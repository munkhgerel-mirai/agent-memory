import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  LifecycleMemoryValidationError,
  V1_MEMORY_CATEGORY_NAMES,
  classifyArtifactSource,
  createApprovalState,
  createArtifactSource,
  createClassificationRationale,
  createLifecycleEdge,
  createLifecycleMemoryRecord,
  evaluateHistoricalChange,
  listMemoryCategories,
  markLifecycleMemoryHistorical,
  requireMemoryCategory,
} from "../src/domain/lifecycle-memory-core.js";

const observedAt = "2026-06-05T00:00:00.000Z";

describe("UNIT-01 lifecycle memory core", () => {
  it("defines every approved v1 AI-DLC memory category", () => {
    const categories = listMemoryCategories();
    assert.deepEqual(
      categories.map((category) => category.name),
      [...V1_MEMORY_CATEGORY_NAMES],
    );

    assert.equal(requireMemoryCategory("PlanMemory").phase, "cross_phase");
    assert.throws(
      () => requireMemoryCategory("GenericNoteMemory"),
      LifecycleMemoryValidationError,
    );
  });

  it("classifies approved AI-DLC artifact paths with primary category and secondary tags", () => {
    const planSource = createArtifactSource({
      workspacePath: "docs/02-construction/02-design-plan/code_generation_plan.md",
      observedVersion: "v1",
      observedAt,
    });

    const planClassification = classifyArtifactSource(planSource);

    assert.equal(planClassification.primaryCategory, "PlanMemory");
    assert.deepEqual(planClassification.secondaryCategories, ["ApprovalGateMemory"]);
    assert.match(planClassification.rationale.ruleName, /plan-artifact/);

    const nfrSource = createArtifactSource({
      workspacePath: "docs/01-inception/03-nfrs/nfrs.md",
      observedVersion: "v1",
      observedAt,
    });

    assert.equal(classifyArtifactSource(nfrSource).primaryCategory, "NfrMemory");
  });

  it("creates approved lifecycle memory only with provenance and approval evidence", () => {
    const source = createArtifactSource({
      workspacePath: "docs/01-inception/02-user-stories/all_user_stories.md",
      observedVersion: "abc123",
      observedAt,
    });
    const classification = classifyArtifactSource(source);
    const approval = createApprovalState({
      status: "approved",
      approver: "user",
      decisionDate: "2026-06-04",
      rationale: "Approved inception artifacts.",
    });

    const memory = createLifecycleMemoryRecord({
      source,
      category: classification.primaryCategory,
      secondaryCategories: classification.secondaryCategories,
      approval,
      rationale: classification.rationale,
      createdAt: observedAt,
    });

    assert.equal(memory.category.name, "UserStoryMemory");
    assert.equal(memory.source.workspacePath, source.workspacePath);
    assert.equal(memory.approval.status, "approved");
    assert.match(memory.id, /^memory:/);
  });

  it("rejects templates and runtime examples as approved lifecycle memory", () => {
    const source = createArtifactSource({
      workspacePath: "docs/01-inception/02-user-stories/user_stories_TEMPLATE.md",
      observedVersion: "template-v1",
      observedAt,
    });
    const classification = classifyArtifactSource(source);
    const approval = createApprovalState({
      status: "approved",
      approver: "user",
      decisionDate: "2026-06-05",
    });

    assert.equal(source.isTemplate, true);
    assert.throws(
      () =>
        createLifecycleMemoryRecord({
          source,
          category: classification.primaryCategory,
          approval,
          rationale: classification.rationale,
          createdAt: observedAt,
        }),
      /cannot become approved lifecycle memory/,
    );
  });

  it("allows one primary category with optional secondary tags but rejects duplicates", () => {
    const source = createArtifactSource({
      workspacePath: "docs/02-construction/01-architecture/system_architecture.md",
      observedVersion: "v1",
      observedAt,
    });
    const classification = classifyArtifactSource(source);

    const memory = createLifecycleMemoryRecord({
      source,
      category: classification.primaryCategory,
      secondaryCategories: classification.secondaryCategories,
      approval: createApprovalState({ status: "draft" }),
      rationale: classification.rationale,
      createdAt: observedAt,
    });

    assert.equal(memory.category.name, "DecisionMemory");
    assert.deepEqual(
      memory.secondaryCategories.map((category) => category.name),
      ["PlanMemory"],
    );

    assert.throws(
      () =>
        createLifecycleMemoryRecord({
          source,
          category: "DecisionMemory",
          secondaryCategories: ["DecisionMemory"],
          approval: createApprovalState({ status: "draft" }),
          rationale: classification.rationale,
          createdAt: observedAt,
        }),
      /Secondary categories cannot duplicate/,
    );
  });

  it("validates lifecycle edge types and prevents self-referential trace edges", () => {
    const rationale = createClassificationRationale({
      ruleName: "test:edge",
      evidenceReference: "test",
      confidence: 1,
    });

    const edge = createLifecycleEdge({
      sourceMemoryId: "memory:a",
      targetMemoryId: "memory:b",
      edgeType: "derives_from",
      rationale,
    });

    assert.equal(edge.edgeType.name, "derives_from");
    assert.match(edge.id, /^edge:/);

    assert.throws(
      () =>
        createLifecycleEdge({
          sourceMemoryId: "memory:a",
          targetMemoryId: "memory:a",
          edgeType: "derives_from",
          rationale,
        }),
      /source and target must be different/,
    );
  });

  it("preserves approved historical records through addendum or supersession decisions", () => {
    const source = createArtifactSource({
      workspacePath: "docs/02-construction/02-design-plan/logical_design_plan.md",
      observedVersion: "v1",
      observedAt,
    });
    const classification = classifyArtifactSource(source);
    const record = createLifecycleMemoryRecord({
      source,
      category: classification.primaryCategory,
      secondaryCategories: classification.secondaryCategories,
      approval: createApprovalState({
        status: "approved",
        approver: "user",
        decisionDate: "2026-06-04",
      }),
      rationale: classification.rationale,
      createdAt: observedAt,
    });

    const withoutApproval = evaluateHistoricalChange({
      existingRecord: record,
      newObservedVersion: "v2",
      hasApprovalEvidence: false,
      occurredAt: observedAt,
      detail: "Plan body changed.",
    });

    assert.equal(withoutApproval.action, "require_addendum");
    assert.equal(withoutApproval.events[0]?.type, "LifecycleMemoryMarkedHistorical");

    const withApproval = evaluateHistoricalChange({
      existingRecord: record,
      newObservedVersion: "v2",
      hasApprovalEvidence: true,
      occurredAt: observedAt,
      detail: "Approved addendum supersedes earlier plan.",
    });

    assert.equal(withApproval.action, "create_supersession");
    assert.deepEqual(
      withApproval.events.map((event) => event.type),
      ["LifecycleMemoryMarkedHistorical", "ArtifactClassificationSuperseded"],
    );

    const historical = markLifecycleMemoryHistorical(
      record,
      "Approved plan superseded by addendum.",
      "memory:new-plan",
    );

    assert.equal(historical.status, "historical");
    assert.equal(historical.supersededByMemoryId, "memory:new-plan");
  });
});
