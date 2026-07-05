import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_STARTUP_TOKEN_BUDGET,
  LocalWorkspaceIndexProjection,
  RetrievalContextValidationError,
  StartupContextRetriever,
  buildContextPack,
  createProjectedMemoryRecord,
  createQueryIntent,
  createTokenBudget,
  estimateTokens,
  rankRetrievalCandidates,
} from "../src/index.js";

const observedAt = "2026-06-16T03:00:00.000Z";
const projectedAt = "2026-06-16T03:01:00.000Z";

describe("BOLT-03 startup retrieval and context packing", () => {
  it("builds a startup context pack with provenance, categories, and budget", () => {
    const projection = new LocalWorkspaceIndexProjection();
    try {
      for (const record of startupRecords()) {
        projection.upsertProjection(record);
      }

      const pack = new StartupContextRetriever(projection).retrieveStartupContext({
        goal: "fresh-session continuity",
        phase: "construction",
        builtAt: projectedAt,
      });

      assert.equal(pack.mode, "startup");
      assert.equal(pack.phase, "construction");
      assert.ok(pack.estimatedTokens <= DEFAULT_STARTUP_TOKEN_BUDGET);
      assert.ok(pack.items.length >= 4);
      assert.ok(pack.items.every((item) => item.sourcePath.length > 0));
      assert.ok(pack.items.every((item) => item.category.endsWith("Memory")));
      assert.ok(pack.items.every((item) => item.approvalStatus.length > 0));
      assert.ok(pack.items.every((item) => item.inclusionReason.length > 0));

      const includedSources = new Set(pack.items.map((item) => item.sourcePath));
      assert.ok(includedSources.has("PROJECT_STATUS.md"));
      assert.ok(includedSources.has("docs/02-construction/02-design-plan/code_generation_followup_plan_bolt03.md"));
      assert.ok(includedSources.has("docs/01-inception/04-risks/risk_register.md"));
      assert.ok(includedSources.has("session-logs/20260616_0302_copilot_bolt02-approval-bolt03-plan.md"));
    } finally {
      projection.close();
    }
  });

  it("keeps startup token budget capped and rejects expanded startup budgets", () => {
    const budget = createTokenBudget({ mode: "startup" });
    assert.equal(budget.maximumTokens, 2000);
    assert.equal(estimateTokens("abcd"), 1);
    assert.equal(estimateTokens("abcde"), 2);

    assert.throws(
      () => createTokenBudget({ mode: "startup", maximumTokens: 2001 }),
      RetrievalContextValidationError,
    );
  });

  it("ranks approved lifecycle memory above conflicting draft memory", () => {
    const approved = projectedRecord({
      memoryId: "memory:approved-decision",
      workspacePath: "docs/02-construction/01-architecture/technology_decisions.md",
      category: "DecisionMemory",
      approvalStatus: "approved",
      text: "Approved decision: local-first storage and retrieval remain authoritative for startup context.",
    });
    const draft = projectedRecord({
      memoryId: "memory:draft-decision",
      workspacePath: "docs/02-construction/01-architecture/draft_decision.md",
      category: "DecisionMemory",
      approvalStatus: "draft",
      text: "Draft decision: local-first storage and retrieval should be replaced by unapproved hosted context.",
    });

    const ranked = rankRetrievalCandidates(
      [
        { record: draft, score: 100, matchedSignals: ["query-text:decision"] },
        { record: approved, score: 100, matchedSignals: ["query-text:decision"] },
      ],
      createQueryIntent({ mode: "startup", query: "local-first decision" }),
    );

    assert.equal(ranked[0]?.record.memoryId, "memory:approved-decision");
    assert.ok(ranked[0]?.matchedSignals.includes("ranking:approved-lifecycle-memory"));
  });

  it("omits lower-ranked items when a context pack reaches the token budget", () => {
    const intent = createQueryIntent({ mode: "startup", query: "startup context" });
    const candidates = rankRetrievalCandidates(
      startupRecords().map((record) => ({
        record,
        score: 50,
        matchedSignals: ["test:candidate"],
      })),
      intent,
    );
    const pack = buildContextPack({
      intent,
      candidates,
      tokenBudget: createTokenBudget({ mode: "startup", maximumTokens: 80 }),
      builtAt: projectedAt,
    });

    assert.ok(pack.estimatedTokens <= 80);
    assert.ok(pack.omittedCandidateCount > 0);
  });
});

function startupRecords() {
  return [
    projectedRecord({
      memoryId: "memory:project-status",
      workspacePath: "PROJECT_STATUS.md",
      category: "PlanMemory",
      approvalStatus: "approved",
      text: "Project Goal: persistent AI-DLC memory. Current Status: BOLT-03 Code Generation plan approved. Active plan: implement startup context pack. Next Steps: execute checklist and verify under 2000 tokens.",
    }),
    projectedRecord({
      memoryId: "memory:bolt03-plan",
      workspacePath: "docs/02-construction/02-design-plan/code_generation_followup_plan_bolt03.md",
      category: "PlanMemory",
      approvalStatus: "approved",
      text: "BOLT-03 active plan for construction phase: retrieval orchestration, ranking, token budget, context pack builder, and startup mode.",
    }),
    projectedRecord({
      memoryId: "memory:technology-decisions",
      workspacePath: "docs/02-construction/01-architecture/technology_decisions.md",
      category: "DecisionMemory",
      approvalStatus: "approved",
      text: "Approved decisions: TypeScript Node runtime, local-first storage, rebuildable SQLite projection, semantic retrieval deferred.",
    }),
    projectedRecord({
      memoryId: "memory:risk-register",
      workspacePath: "docs/01-inception/04-risks/risk_register.md",
      category: "RiskMemory",
      approvalStatus: "approved",
      text: "Risk R-008 blocker: 2000-token context pack may omit important context; mitigate with focused retrieval later.",
    }),
    projectedRecord({
      memoryId: "memory:session-log",
      workspacePath: "session-logs/20260616_0302_copilot_bolt02-approval-bolt03-plan.md",
      category: "SessionHandoffMemory",
      approvalStatus: "approved",
      text: "Session handoff next steps: approve BOLT-03 plan, execute one checkbox at a time, produce report and test results.",
    }),
  ];
}

function projectedRecord(input: {
  readonly memoryId: string;
  readonly workspacePath: string;
  readonly category: Parameters<typeof createProjectedMemoryRecord>[0]["category"];
  readonly approvalStatus: Parameters<typeof createProjectedMemoryRecord>[0]["approvalStatus"];
  readonly text: string;
}) {
  return createProjectedMemoryRecord({
    memoryId: input.memoryId,
    workspacePath: input.workspacePath,
    category: input.category,
    approvalStatus: input.approvalStatus,
    observedVersion: `${input.memoryId}:v1`,
    observedAt,
    sourceKind: "lifecycle_artifact",
    text: input.text,
    lastProjectedAt: projectedAt,
  });
}