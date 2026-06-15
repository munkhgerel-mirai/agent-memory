import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  LocalWorkspaceIndexProjection,
  LocalWorkspaceStorageValidationError,
  WorkspaceIndexRebuilder,
  createDurableSourceObservation,
  createMemoryEventRecord,
  createProjectedMemoryRecord,
  parseMemoryEventJsonl,
  serializeMemoryEventRecord,
} from "../src/index.js";

const observedAt = "2026-06-15T10:00:00.000Z";
const completedAt = "2026-06-15T10:01:00.000Z";

describe("BOLT-02 local workspace storage and rebuild", () => {
  it("validates and parses append-only JSONL memory events", () => {
    const event = createMemoryEventRecord({
      eventId: "event-001",
      eventType: "memory_indexed",
      workspaceId: "agent-memory",
      occurredAt: observedAt,
      actor: "copilot",
      sourcePath: "docs/01-inception/04-risks/risk_register.md",
      category: "RiskMemory",
      approvalStatus: "approved",
      observedVersion: "risk-v1",
      text: "R-010 Markdown, JSONL, and SQLite can diverge without deterministic rebuild.",
    });

    assert.deepEqual(parseMemoryEventJsonl(`${serializeMemoryEventRecord(event)}\n\n`), [
      event,
    ]);

    assert.throws(
      () =>
        parseMemoryEventJsonl(
          JSON.stringify({
            ...event,
            actor: "",
          }),
        ),
      LocalWorkspaceStorageValidationError,
    );
    assert.throws(
      () =>
        createMemoryEventRecord({
          ...event,
          category: "GenericNoteMemory",
        }),
      /Unknown memory event category/,
    );
  });

  it("rebuilds a derived projection from durable sources and searches locally", () => {
    const projection = new LocalWorkspaceIndexProjection();
    try {
      const rebuild = new WorkspaceIndexRebuilder(projection).rebuild({
        rebuildId: "rebuild-001",
        workspaceId: "agent-memory",
        requestedBy: "copilot",
        startedAt: observedAt,
        completedAt,
        sources: [riskSource(), technologyDecisionSource()],
      });

      assert.equal(rebuild.outcome?.status, "completed");
      assert.equal(rebuild.outcome?.createdCount, 2);
      assert.equal(projection.countProjections(), 2);

      const riskResults = projection.search({
        query: "R-010 deterministic rebuild",
        approvalStatus: "approved",
      });
      assert.equal(riskResults[0]?.record.category, "RiskMemory");
      assert.ok(riskResults[0]?.matchedSignals.some((signal) => signal.startsWith("query-text")));

      const pathResults = projection.search({
        workspacePath: "docs/02-construction/01-architecture/technology_decisions.md",
      });
      assert.equal(pathResults[0]?.record.category, "DecisionMemory");
      assert.ok(pathResults[0]?.matchedSignals.includes("exact-path"));

      const categoryResults = projection.search({ category: "RiskMemory" });
      assert.deepEqual(
        categoryResults.map((result) => result.record.category),
        ["RiskMemory"],
      );
    } finally {
      projection.close();
    }
  });

  it("rebuilds after deleting derived projection state", () => {
    const projection = new LocalWorkspaceIndexProjection();
    try {
      const rebuilder = new WorkspaceIndexRebuilder(projection);
      rebuilder.rebuild({
        rebuildId: "rebuild-002",
        workspaceId: "agent-memory",
        requestedBy: "copilot",
        startedAt: observedAt,
        completedAt,
        sources: [riskSource()],
      });
      assert.equal(projection.countProjections(), 1);

      projection.resetProjection();
      assert.equal(projection.countProjections(), 0);

      const rebuilt = rebuilder.rebuild({
        rebuildId: "rebuild-003",
        workspaceId: "agent-memory",
        requestedBy: "copilot",
        startedAt: observedAt,
        completedAt,
        sources: [riskSource()],
      });
      assert.equal(projection.countProjections(), 1);
      assert.equal(rebuilt.outcome?.createdCount, 1);
    } finally {
      projection.close();
    }
  });

  it("records rebuild warnings for approved templates and malformed sources", () => {
    const projection = new LocalWorkspaceIndexProjection();
    try {
      const rebuild = new WorkspaceIndexRebuilder(projection).rebuild({
        rebuildId: "rebuild-004",
        workspaceId: "agent-memory",
        requestedBy: "copilot",
        startedAt: observedAt,
        completedAt,
        sources: [
          createDurableSourceObservation({
            workspacePath: "docs/01-inception/02-user-stories/user_stories_TEMPLATE.md",
            observedVersion: "template-v1",
            observedAt,
            content: "Template placeholder content.",
            approval: {
              status: "approved",
              approver: "user",
              decisionDate: "2026-06-04",
            },
          }),
          createDurableSourceObservation({
            workspacePath: "notes/freeform.md",
            observedVersion: "notes-v1",
            observedAt,
            content: "Freeform notes are not AI-DLC lifecycle artifacts.",
          }),
        ],
      });

      assert.equal(projection.countProjections(), 0);
      assert.equal(rebuild.outcome?.status, "completed_with_warnings");
      assert.equal(rebuild.outcome?.warningCount, 2);
      assert.match(rebuild.warnings.map((warning) => warning.message).join("\n"), /template|No AI-DLC classification/u);
    } finally {
      projection.close();
    }
  });

  it("replays memory events during rebuild and removes event-projected memory", () => {
    const projection = new LocalWorkspaceIndexProjection();
    try {
      const rebuilder = new WorkspaceIndexRebuilder(projection);
      const indexedEvent = createMemoryEventRecord({
        eventId: "event-002",
        eventType: "memory_indexed",
        workspaceId: "agent-memory",
        occurredAt: observedAt,
        actor: "copilot",
        sourcePath: "docs/02-construction/02-design-plan/custom_plan.md",
        memoryId: "memory:event-plan",
        category: "PlanMemory",
        approvalStatus: "approved",
        observedVersion: "event-v1",
        text: "Custom approved plan from append-only memory event.",
      });

      rebuilder.rebuild({
        rebuildId: "rebuild-005",
        workspaceId: "agent-memory",
        requestedBy: "copilot",
        startedAt: observedAt,
        completedAt,
        sources: [],
        events: [indexedEvent],
      });

      assert.equal(projection.countProjections(), 1);
      assert.equal(projection.search({ query: "custom approved" })[0]?.record.memoryId, "memory:event-plan");

      const removed = rebuilder.rebuild({
        rebuildId: "rebuild-006",
        workspaceId: "agent-memory",
        requestedBy: "copilot",
        startedAt: observedAt,
        completedAt,
        sources: [],
        events: [
          indexedEvent,
          createMemoryEventRecord({
            eventId: "event-003",
            eventType: "memory_removed",
            workspaceId: "agent-memory",
            occurredAt: completedAt,
            actor: "copilot",
            sourcePath: "docs/02-construction/02-design-plan/custom_plan.md",
            memoryId: "memory:event-plan",
          }),
        ],
      });

      assert.equal(projection.countProjections(), 0);
      assert.equal(removed.outcome?.removedCount, 1);
    } finally {
      projection.close();
    }
  });

  it("exposes projection repository operations behind the local boundary", () => {
    const projection = new LocalWorkspaceIndexProjection();
    try {
      const record = createProjectedMemoryRecord({
        memoryId: "memory:nfr",
        workspacePath: "docs/01-inception/03-nfrs/nfrs.md",
        category: "NfrMemory",
        approvalStatus: "approved",
        observedVersion: "nfr-v1",
        observedAt,
        sourceKind: "lifecycle_artifact",
        text: "NFR-003 SQLite index must be rebuildable from durable sources.",
        lastProjectedAt: completedAt,
      });

      projection.upsertProjection(record);
      assert.equal(projection.countProjections(), 1);
      assert.equal(projection.findProjection("memory:nfr")?.category, "NfrMemory");
      assert.equal(projection.listProjections()[0]?.workspacePath, record.workspacePath);

      projection.removeProjection("memory:nfr");
      assert.equal(projection.countProjections(), 0);
    } finally {
      projection.close();
    }
  });
});

function riskSource() {
  return createDurableSourceObservation({
    workspacePath: "docs/01-inception/04-risks/risk_register.md",
    observedVersion: "risk-v1",
    observedAt,
    content: "R-010 Markdown, JSONL, and SQLite can diverge if sync/indexing is not deterministic.",
    approval: {
      status: "approved",
      approver: "user",
      decisionDate: "2026-06-04",
    },
  });
}

function technologyDecisionSource() {
  return createDurableSourceObservation({
    workspacePath: "docs/02-construction/01-architecture/technology_decisions.md",
    observedVersion: "td-v1",
    observedAt,
    content: "ADR-003 selects local-first durable docs/events plus rebuildable SQLite projection.",
    approval: {
      status: "approved",
      approver: "user",
      decisionDate: "2026-06-04",
    },
  });
}