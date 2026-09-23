import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_WORKSPACE_SCAN_RULES,
  V1_MEMORY_CATEGORY_NAMES,
  WorkspaceSourceReader,
  classifyArtifactSource,
  createArtifactSource,
  deriveArtifactType,
  findNonMemoryRule,
  type MemoryCategoryName,
} from "../src/index.js";

const timestamp = "2026-07-27T00:00:00.000Z";
const repositoryRoot = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, "$1");

/**
 * Captured from the BOLT-08 baseline before BOLT-08a changed the classifier. Every entry must
 * keep its exact primary and secondary categories, so leading-slash anchoring can only add
 * matches and never reclassify anything.
 */
const UNCHANGED_BASELINE: readonly (readonly [string, MemoryCategoryName, readonly MemoryCategoryName[]])[] = [
  ["docs/00-methodology/setup_validation.md", "VerificationMemory", []],
  ["docs/01-inception/01-intent-clarification/intent_clarification.md", "IntentMemory", []],
  ["docs/01-inception/02-user-stories/all_user_stories.md", "UserStoryMemory", []],
  ["docs/01-inception/03-nfrs/nfrs.md", "NfrMemory", []],
  ["docs/01-inception/04-risks/risk_register.md", "RiskMemory", []],
  ["docs/01-inception/05-units/units_composition.md", "UnitMemory", []],
  ["docs/01-inception/06-bolts/bolts_plan.md", "BoltMemory", []],
  ["docs/01-inception/99-plans/inception_plan.md", "PlanMemory", ["ApprovalGateMemory"]],
  ["docs/02-construction/01-architecture/system_architecture.md", "DecisionMemory", ["PlanMemory"]],
  ["docs/02-construction/01-architecture/technology_decisions.md", "DecisionMemory", []],
  ["docs/02-construction/02-design-plan/v1_release_plan.md", "PlanMemory", ["ApprovalGateMemory"]],
  ["docs/02-construction/04-code-generation/test_results_bolt08.md", "VerificationMemory", []],
  ["session-logs/20260603_1611_codex_setup-plan.md", "SessionHandoffMemory", []],
];

describe("BOLT-08a classification coverage", () => {
  it("keeps every previously classified artifact in its original category", () => {
    for (const [workspacePath, primary, secondary] of UNCHANGED_BASELINE) {
      const classification = classify(workspacePath);
      assert.equal(classification.primaryCategory, primary, `${workspacePath} primary category changed`);
      assert.deepEqual(
        classification.secondaryCategories,
        secondary,
        `${workspacePath} secondary categories changed`,
      );
    }
  });

  it("adds no memory category", () => {
    assert.equal(V1_MEMORY_CATEGORY_NAMES.length, 13);
    assert.equal(V1_MEMORY_CATEGORY_NAMES.includes("SessionHandoffMemory" as MemoryCategoryName), true);
    assert.equal(V1_MEMORY_CATEGORY_NAMES.includes("StatusMemory" as MemoryCategoryName), false);
  });

  it("classifies unit-scoped domain and logical design documents as decision memory", () => {
    for (const workspacePath of [
      "docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core.md",
      "docs/02-construction/03-domain-design/unit_05_optional_semantic_retrieval_extension_logical_design.md",
    ]) {
      const classification = classify(workspacePath);
      assert.equal(classification.primaryCategory, "DecisionMemory");
      assert.deepEqual(classification.secondaryCategories, ["UnitMemory"]);
      assert.equal(classification.rationale.ruleName, "path:domain-design-artifact");
      assert.equal(deriveArtifactType(workspacePath), "domain-design");
    }

    // Scoped to unit_ files, so the directory's own README and templates are not swept in.
    assert.throws(() => classify("docs/02-construction/03-domain-design/README.md"));
    assert.throws(() => classify("docs/02-construction/03-domain-design/domain_design_TEMPLATE.md"));
  });

  it("classifies the project status file as the workspace continuity record", () => {
    const classification = classify("PROJECT_STATUS.md");

    assert.equal(classification.primaryCategory, "SessionHandoffMemory");
    assert.deepEqual(classification.secondaryCategories, ["PlanMemory"]);
    assert.equal(classification.rationale.ruleName, "path:project-status");
    assert.equal(deriveArtifactType("PROJECT_STATUS.md"), "project-status");
  });

  it("matches root-level directories now that classifier paths are anchored", () => {
    // Before anchoring, `/session-logs/` could not match a root-level folder by path, so this
    // only classified because the reader declared the artifact type.
    assert.equal(classify("session-logs/20260727_example.md").primaryCategory, "SessionHandoffMemory");
    assert.equal(
      classifyArtifactSource(
        createArtifactSource({
          workspacePath: "session-logs/20260727_example.md",
          artifactType: "unknown",
          observedVersion: "v",
          observedAt: timestamp,
        }),
      ).primaryCategory,
      "SessionHandoffMemory",
    );
  });

  it("declares non-memory documents as rules rather than leaving them unclassified", () => {
    const nonMemoryRules = DEFAULT_WORKSPACE_SCAN_RULES.filter((rule) => rule.kind === "non_memory");
    assert.ok(nonMemoryRules.length >= 7);
    assert.ok(nonMemoryRules.every((rule) => rule.reason.length > 0));

    for (const workspacePath of [
      "docs/00-methodology/01-skills/ai-dlc-inception/SKILL.md",
      "docs/03-operations/02-observability/runbooks_TEMPLATE.md",
      "docs/02-construction/README.md",
      "README.md",
      "docs/02-construction/03-domain-design/logical_design_TEMPLATE.md",
      "TEMPLATE_CHECKLIST.md",
      "AGENTS.md",
      "ai-dlc-paper.md",
    ]) {
      assert.ok(findNonMemoryRule(workspacePath), `${workspacePath} needs a non-memory rule`);
    }

    // The classifier itself still recognises these paths. BOLT-08b changed which rule wins at
    // discovery time, not what the classifier would say.
    assert.ok(findNonMemoryRule("docs/01-inception/03-nfrs/README.md"));
    assert.equal(classify("docs/01-inception/03-nfrs/README.md").primaryCategory, "NfrMemory");

    // A non-overriding rule still yields to classification: `setup_validation.md` matches the
    // methodology prefix yet remains project memory.
    assert.ok(findNonMemoryRule("docs/00-methodology/setup_validation.md"));
    assert.equal(
      classify("docs/00-methodology/setup_validation.md").primaryCategory,
      "VerificationMemory",
    );
  });

  it("leaves no unclassified candidate when scanning this repository", () => {
    const result = new WorkspaceSourceReader({ now: () => timestamp }).scan(repositoryRoot);
    const unclassified = result.skipped.filter((skip) => skip.reason === "unclassified_artifact");

    assert.deepEqual(
      unclassified.map((skip) => skip.workspacePath),
      [],
      "every discovered Markdown file must be classified or excluded by an explicit rule",
    );
    assert.ok(result.skipped.every((skip) => skip.reason === "excluded_by_rule"));
    assert.ok(result.skipped.every((skip) => skip.detail.includes("non-memory:")));
    assert.equal(
      result.observations.length + result.skipped.length,
      result.candidateFileCount,
      "every candidate must be accounted for",
    );

    // The two artifacts BOLT-08 reported as gaps are now memory.
    assert.ok(result.observations.some((observation) => observation.workspacePath === "PROJECT_STATUS.md"));
    assert.ok(
      result.observations.some(
        (observation) => observation.workspacePath === "docs/00-methodology/setup_validation.md",
      ),
      "setup_validation.md is a real project record and must stay memory",
    );
    assert.equal(
      result.observations.filter((observation) =>
        observation.workspacePath.startsWith("docs/02-construction/03-domain-design/unit_"),
      ).length,
      10,
    );
  });
});

function classify(workspacePath: string) {
  return classifyArtifactSource(
    createArtifactSource({
      workspacePath,
      artifactType: deriveArtifactType(workspacePath),
      observedVersion: "sha256:0000000000000000",
      observedAt: timestamp,
    }),
  );
}
