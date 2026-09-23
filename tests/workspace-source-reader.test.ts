import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  DEFAULT_WORKSPACE_SCAN_RULES,
  WorkspaceSourceReadError,
  WorkspaceSourceReader,
  deriveObservedVersion,
  extractApprovalMetadata,
  isCandidatePath,
  isExcludedPath,
  listWorkspaceScanRules,
  type DurableSourceObservation,
  type WorkspaceScanResult,
} from "../src/index.js";

const timestamp = "2026-07-27T00:00:00.000Z";
const repositoryRoot = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, "$1");

describe("BOLT-08 workspace durable source reader", () => {
  it("exposes inspectable scan rules and applies exclusions before inclusions", () => {
    const rules = listWorkspaceScanRules();
    assert.equal(rules, DEFAULT_WORKSPACE_SCAN_RULES);
    assert.ok(rules.every((rule) => typeof rule.reason === "string" && rule.reason.length > 0));
    assert.equal(containsFunction(rules), false, "scan rules must stay declarative data");

    assert.equal(isCandidatePath("docs/01-inception/03-nfrs/nfrs.md"), true);
    assert.equal(isCandidatePath("session-logs/20260727_example.md"), true);
    assert.equal(isCandidatePath("PROJECT_STATUS.md"), true);

    // src/docs/ is product template territory, not project memory.
    assert.equal(isExcludedPath("src/docs/example.md"), true);
    assert.equal(isCandidatePath("src/docs/example.md"), false);
    assert.equal(isCandidatePath("node_modules/pkg/readme.md"), false);
    assert.equal(isCandidatePath("dist/src/index.js"), false);
    assert.equal(isCandidatePath(".git/COMMIT_EDITMSG"), false);

    // Non-Markdown and nested non-doc files are simply not candidates.
    assert.equal(isCandidatePath("src/index.ts"), false);
    assert.equal(isCandidatePath("docs/diagram.png"), false);
    assert.equal(isCandidatePath("src/nested/notes.md"), false);
  });

  it("derives a deterministic content version that ignores line endings", () => {
    const lf = "# Plan\n\nApproved by user on 2026-07-27.\n";
    const crlf = "# Plan\r\n\r\nApproved by user on 2026-07-27.\r\n";

    assert.equal(deriveObservedVersion(lf), deriveObservedVersion(lf));
    assert.equal(
      deriveObservedVersion(lf),
      deriveObservedVersion(crlf),
      "version must be stable across platforms so rebuild stays reproducible",
    );
    assert.notEqual(deriveObservedVersion(lf), deriveObservedVersion(`${lf}Changed.\n`));
    assert.match(deriveObservedVersion(lf), /^sha256:[0-9a-f]{16}$/u);
  });

  it("extracts declared approval state and defaults unknown artifacts to draft", () => {
    const approved = extractApprovalMetadata(
      "# Plan\n\n## Approval Status\n\nApproved by user on 2026-06-04. Generated from the approved plan.\n\n## Purpose\n\nText.\n",
    );
    assert.equal(approved.status, "approved");
    assert.equal(approved.approver, "user");
    assert.equal(approved.decisionDate, "2026-06-04");

    assert.equal(
      extractApprovalMetadata("## Approval Status\n\nPending human review.\n").status,
      "pending_review",
    );
    assert.equal(
      extractApprovalMetadata("## Approval Status\n\nChanges requested by the reviewer.\n").status,
      "changes_requested",
    );
    assert.equal(
      extractApprovalMetadata("## Approval Status\n\nSuperseded by a later addendum.\n").status,
      "historical",
    );

    // An unfilled template placeholder lists every option at once and declares nothing.
    assert.equal(
      extractApprovalMetadata(
        "## Approval Status\n\n<Pending review / Approved by <APPROVER> on <DATE> / Changes requested / Deferred>\n",
      ).status,
      "draft",
    );

    // A verdict paragraph followed by body text must not be overridden by the body. `nfrs.md`
    // states its approval, then a table whose NFR-004 row contains the word "Historical".
    assert.equal(
      extractApprovalMetadata(
        "## Approval Status\n\nApproved by user on 2026-06-04.\n\n| ID | Requirement |\n|----|----|\n| NFR-004 | Historical approved artifacts must remain stable. |\n",
      ).status,
      "approved",
    );

    // Failing safe matters: BOLT-03 ranking adds +50 for approved.
    assert.equal(extractApprovalMetadata("# Notes\n\nNo approval section here.\n").status, "draft");
    assert.equal(extractApprovalMetadata("## Approval Status\n").status, "draft");
    assert.equal(
      extractApprovalMetadata("Some prose mentioning approved work but no section.\n").status,
      "draft",
      "an approval word outside the approval section must not promote the artifact",
    );
  });

  it("scans a workspace tree, honours exclusions, and reports every skip with a reason", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-memory-bolt08-"));
    try {
      write(root, "docs/01-inception/03-nfrs/nfrs.md", "# NFRs\n\n## Approval Status\n\nApproved by user on 2026-06-04.\n\n## Body\n\nNFR-001 content.\n");
      write(root, "docs/02-construction/02-design-plan/example_plan.md", "# Plan\n\n## Approval Status\n\nPending human review.\n");
      write(
        root,
        "docs/02-construction/02-design-plan/design_plan_TEMPLATE.md",
        "# Template\n\n## Approval Status\n\nApproved by user on 2026-01-01.\n",
      );
      write(root, "docs/notes/unmatched_note.md", "# Unmatched\n\nNo classification rule covers this path.\n");
      write(root, "docs/empty.md", "   \n\n");
      write(root, "session-logs/20260727_example.md", "# Session\n\nWork log.\n");
      write(root, "src/docs/product_template.md", "# Product template\n\nShould never be scanned.\n");
      write(root, "node_modules/pkg/readme.md", "# Dependency\n");
      write(root, "src/index.ts", "export const x = 1;\n");

      const result = new WorkspaceSourceReader({ now: () => timestamp }).scan(root);

      assert.deepEqual(observedPaths(result), [
        "docs/01-inception/03-nfrs/nfrs.md",
        "docs/02-construction/02-design-plan/example_plan.md",
        "session-logs/20260727_example.md",
      ]);

      assert.deepEqual(
        result.skipped.map((skip) => [skip.workspacePath, skip.reason]),
        [
          ["docs/02-construction/02-design-plan/design_plan_TEMPLATE.md", "excluded_by_rule"],
          ["docs/empty.md", "empty_artifact"],
          ["docs/notes/unmatched_note.md", "unclassified_artifact"],
        ],
        "a genuinely unrecognised document must still be reported as unclassified",
      );
      assert.ok(result.skipped.every((skip) => skip.detail.length > 0));

      assert.ok(result.excludedPaths.includes("node_modules/"));
      assert.ok(result.excludedPaths.includes("src/docs/"));
      assert.equal(
        result.observations.some((observation) => observation.workspacePath.startsWith("src/docs/")),
        false,
      );

      const nfr = observationFor(result, "docs/01-inception/03-nfrs/nfrs.md");
      assert.equal(nfr.artifactType, "nfr");
      assert.equal(nfr.approval.status, "approved");
      assert.equal(nfr.approval.approver, "user");
      assert.equal(nfr.observedAt, timestamp);
      assert.equal(nfr.sourceKind, "lifecycle_artifact");
      assert.equal(nfr.isTemplate, false);

      const plan = observationFor(result, "docs/02-construction/02-design-plan/example_plan.md");
      assert.equal(plan.approval.status, "pending_review");

      // US-002 AC-004, strengthened by BOLT-08b: a template never enters memory at all, even
      // when its path classifies and its own text claims approval.
      assert.equal(
        skipReasonFor(result, "docs/02-construction/02-design-plan/design_plan_TEMPLATE.md"),
        "excluded_by_rule",
      );

      assert.equal(result.candidateFileCount, 6);
      assert.equal(result.workspaceRoot.length > 0, true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects an unusable workspace root and an unreadable named artifact", () => {
    const reader = new WorkspaceSourceReader({ now: () => timestamp });

    assert.throws(() => reader.scan(""), WorkspaceSourceReadError);
    assert.throws(() => reader.scan(join(tmpdir(), "agent-memory-missing-root")), WorkspaceSourceReadError);

    const root = mkdtempSync(join(tmpdir(), "agent-memory-bolt08-"));
    try {
      write(root, "docs/01-inception/03-nfrs/nfrs.md", "# NFRs\n\nContent.\n");
      assert.throws(
        () => reader.readArtifact(root, "docs/01-inception/03-nfrs/missing.md"),
        WorkspaceSourceReadError,
      );
      assert.equal(
        reader.readArtifact(root, "docs/01-inception/03-nfrs/nfrs.md").artifactType,
        "nfr",
      );
      assert.throws(() => reader.scan(join(root, "docs/01-inception/03-nfrs/nfrs.md")), WorkspaceSourceReadError);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("skips artifacts larger than the configured limit rather than loading them", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-memory-bolt08-"));
    try {
      write(root, "docs/01-inception/03-nfrs/nfrs.md", `# NFRs\n\n${"x".repeat(4000)}\n`);
      const result = new WorkspaceSourceReader({ now: () => timestamp, maxFileBytes: 512 }).scan(root);

      assert.deepEqual(result.observations, []);
      assert.equal(result.skipped[0]?.reason, "file_too_large");
      assert.match(result.skipped[0]?.detail ?? "", /exceeds the 512-byte artifact limit/u);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("scans this repository's real docs tree with no hand-written fixtures", () => {
    const result = new WorkspaceSourceReader({ now: () => timestamp }).scan(repositoryRoot);

    assert.ok(result.observations.length >= 20, `expected a populated scan, got ${result.observations.length}`);
    assert.ok(result.excludedPaths.includes("node_modules/"));

    const nfrs = observationFor(result, "docs/01-inception/03-nfrs/nfrs.md");
    assert.equal(nfrs.artifactType, "nfr");
    assert.equal(nfrs.approval.status, "approved");
    assert.ok(nfrs.content.includes("NFR-001"));
    assert.match(nfrs.observedVersion, /^sha256:[0-9a-f]{16}$/u);

    const bolts = observationFor(result, "docs/01-inception/06-bolts/bolts_plan.md");
    assert.equal(bolts.artifactType, "bolt");
    assert.equal(bolts.approval.decisionDate, "2026-06-04");

    assert.ok(
      result.observations.some((observation) => observation.workspacePath.startsWith("session-logs/")),
    );
    assert.equal(
      result.observations.some((observation) => observation.workspacePath.startsWith("src/docs/")),
      false,
      "product templates must never enter project memory",
    );

    // Inverted by BOLT-08a: PROJECT_STATUS.md now classifies, so the BOLT-08 tripwire becomes
    // a positive assertion that US-001's source of goal, phase, blockers, and next steps is
    // present in memory.
    assert.equal(skipReasonFor(result, "PROJECT_STATUS.md"), undefined);
    assert.equal(observationFor(result, "PROJECT_STATUS.md").artifactType, "project-status");
    assert.ok(
      result.skipped.every((skip) => skip.reason !== "unreadable_file"),
      "every candidate in this repository must be readable",
    );

    // No template reaches memory at all after BOLT-08b, so no placeholder text can be ranked.
    assert.deepEqual(
      result.observations.filter((observation) => observation.isTemplate).map((o) => o.workspacePath),
      [],
    );
  });

  it("performs no filesystem writes", () => {
    const source = readFileSync(
      new URL("../../src/storage/workspace-source-reader.ts", import.meta.url),
      "utf8",
    );

    for (const writeApi of [
      "writeFile",
      "appendFile",
      "mkdir",
      "rmSync",
      "unlink",
      "rename",
      "copyFile",
      "createWriteStream",
      "truncate",
      "chmod",
    ]) {
      assert.equal(source.includes(writeApi), false, `reader must not reference ${writeApi}`);
    }
  });
});

function write(root: string, relativePath: string, content: string): void {
  const absolutePath = join(root, ...relativePath.split("/"));
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
}

function observedPaths(result: WorkspaceScanResult): readonly string[] {
  return result.observations.map((observation) => observation.workspacePath);
}

function observationFor(result: WorkspaceScanResult, workspacePath: string): DurableSourceObservation {
  const observation = result.observations.find((item) => item.workspacePath === workspacePath);
  assert.ok(observation, `expected an observation for ${workspacePath}`);
  return observation;
}

function skipReasonFor(result: WorkspaceScanResult, workspacePath: string): string | undefined {
  return result.skipped.find((skip) => skip.workspacePath === workspacePath)?.reason;
}

function containsFunction(value: unknown): boolean {
  if (typeof value === "function") return true;
  if (Array.isArray(value)) return value.some((item) => containsFunction(item));
  if (value && typeof value === "object") {
    return Object.values(value).some((item) => containsFunction(item));
  }

  return false;
}
