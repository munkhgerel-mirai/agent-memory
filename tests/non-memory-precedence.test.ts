import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_WORKSPACE_SCAN_RULES,
  WorkspaceSourceReader,
  findNonMemoryRule,
  findOverridingNonMemoryRule,
  isCandidatePath,
  type WorkspaceScanResult,
} from "../src/index.js";

const timestamp = "2026-07-27T00:00:00.000Z";
const repositoryRoot = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, "$1");

/** The ten READMEs that held a lifecycle category before BOLT-08b. */
const REMOVED_READMES: readonly string[] = [
  "docs/01-inception/01-intent-clarification/README.md",
  "docs/01-inception/02-user-stories/README.md",
  "docs/01-inception/03-nfrs/README.md",
  "docs/01-inception/04-risks/README.md",
  "docs/01-inception/05-units/README.md",
  "docs/01-inception/06-bolts/README.md",
  "docs/01-inception/99-plans/README.md",
  "docs/02-construction/02-design-plan/README.md",
  "docs/02-construction/04-code-generation/README.md",
  "session-logs/README.md",
];

/** Artifacts that match a non-overriding rule and must therefore stay memory. */
const RETAINED_DESPITE_RULE: readonly string[] = ["docs/00-methodology/setup_validation.md"];

describe("BOLT-08b non-memory rule precedence", () => {
  it("marks exactly the readme and template rules as overriding", () => {
    const overriding = DEFAULT_WORKSPACE_SCAN_RULES.filter(
      (rule) => rule.overridesClassification === true,
    );

    assert.deepEqual(
      overriding.map((rule) => rule.label),
      ["non-memory:readme", "non-memory:template"],
    );
    assert.ok(overriding.every((rule) => rule.kind === "non_memory"));
    assert.equal(
      DEFAULT_WORKSPACE_SCAN_RULES.some(
        (rule) => rule.kind !== "non_memory" && rule.overridesClassification === true,
      ),
      false,
      "only non-memory rules may override classification",
    );
  });

  it("matches READMEs by exact base name so a similarly named document is not swept in", () => {
    assert.equal(findOverridingNonMemoryRule("README.md")?.label, "non-memory:readme");
    assert.equal(
      findOverridingNonMemoryRule("docs/01-inception/README.md")?.label,
      "non-memory:readme",
    );

    // Would have matched the previous `fileSuffix: "readme.md"` matcher and silently lost memory.
    assert.equal(findOverridingNonMemoryRule("docs/api-readme.md"), undefined);
    assert.equal(findNonMemoryRule("docs/api-readme.md"), undefined);
    assert.equal(isCandidatePath("docs/api-readme.md"), true);
  });

  it("finds an overriding rule even when a broader non-overriding rule is listed first", () => {
    const operationsTemplate = "docs/03-operations/01-deployment/rollback_plan_TEMPLATE.md";

    // The operations prefix rule appears earlier and does not override.
    assert.equal(findNonMemoryRule(operationsTemplate)?.label, "non-memory:operations");
    assert.equal(findNonMemoryRule(operationsTemplate)?.overridesClassification, false);

    // The template rule still wins, so a broader rule cannot mask it.
    assert.equal(findOverridingNonMemoryRule(operationsTemplate)?.label, "non-memory:template");
  });

  it("keeps a non-overriding rule yielding to classification", () => {
    for (const workspacePath of RETAINED_DESPITE_RULE) {
      assert.ok(findNonMemoryRule(workspacePath), `${workspacePath} should match a non-memory rule`);
      assert.equal(
        findOverridingNonMemoryRule(workspacePath),
        undefined,
        `${workspacePath} must not match an overriding rule`,
      );
    }
  });

  it("removes every README and template from memory when scanning this repository", () => {
    const result = scanRepository();

    for (const workspacePath of REMOVED_READMES) {
      assert.equal(
        skipDetailFor(result, workspacePath)?.startsWith("non-memory:readme"),
        true,
        `${workspacePath} must be excluded by the readme rule`,
      );
    }

    assert.deepEqual(readmeObservations(result), [], "no README may remain in memory");
    assert.deepEqual(
      result.observations.filter((observation) => observation.isTemplate).map((o) => o.workspacePath),
      [],
      "no template may remain in memory",
    );
  });

  it("loses nothing beyond READMEs and templates", () => {
    const result = scanRepository();

    for (const workspacePath of RETAINED_DESPITE_RULE) {
      assert.ok(
        result.observations.some((observation) => observation.workspacePath === workspacePath),
        `${workspacePath} must remain project memory`,
      );
    }

    // Every exclusion must be attributable to a declared rule.
    for (const skip of result.skipped) {
      assert.equal(skip.reason, "excluded_by_rule");
      assert.ok(skip.detail.startsWith("non-memory:"));
    }

    // Compared by exact label: `non-memory:template-checklist` shares a prefix with
    // `non-memory:template`, so prefix matching would over-count by one.
    const byRule = tallyByRule(result);
    assert.equal(byRule["non-memory:readme"], 20, "every README, classified or not");
    assert.equal(byRule["non-memory:template"], 24, "every template, classified or not");
    assert.equal(byRule["non-memory:methodology"], 19);
    assert.equal(byRule["non-memory:template-checklist"], 1);
    assert.equal(byRule["non-memory:operations"], undefined, "operations files are all READMEs or templates");
  });

  it("still reports zero unclassified candidates and accounts for every file", () => {
    const result = scanRepository();

    assert.deepEqual(
      result.skipped.filter((skip) => skip.reason === "unclassified_artifact"),
      [],
    );
    assert.equal(result.observations.length + result.skipped.length, result.candidateFileCount);
    assert.equal(result.skipped.length, 66);

    // The artifacts BOLT-08a added stay in memory.
    assert.ok(result.observations.some((observation) => observation.workspacePath === "PROJECT_STATUS.md"));
    assert.equal(
      result.observations.filter((observation) =>
        observation.workspacePath.startsWith("docs/02-construction/03-domain-design/unit_"),
      ).length,
      10,
    );
  });
});

function scanRepository(): WorkspaceScanResult {
  return new WorkspaceSourceReader({ now: () => timestamp }).scan(repositoryRoot);
}

function readmeObservations(result: WorkspaceScanResult): readonly string[] {
  return result.observations
    .map((observation) => observation.workspacePath)
    .filter((workspacePath) => workspacePath.toLowerCase().split("/").pop() === "readme.md");
}

function skipDetailFor(result: WorkspaceScanResult, workspacePath: string): string | undefined {
  return result.skipped.find((skip) => skip.workspacePath === workspacePath)?.detail;
}

function tallyByRule(result: WorkspaceScanResult): Record<string, number> {
  const tally: Record<string, number> = {};

  for (const skip of result.skipped) {
    const label = skip.detail.slice(0, skip.detail.indexOf(":", "non-memory:".length));
    tally[label] = (tally[label] ?? 0) + 1;
  }

  return tally;
}
