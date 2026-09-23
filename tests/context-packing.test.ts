import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_SECTION_TOKEN_CAP,
  DEFAULT_STARTUP_TOKEN_BUDGET,
  EXPANDED_TOKEN_BUDGET,
  RetrievalContextValidationError,
  STARTUP_CATEGORY_RESERVATIONS,
  StartupContextRetriever,
  WorkspaceMemoryStore,
  buildContextPack,
  createProjectedMemoryRecord,
  createQueryIntent,
  createTokenBudget,
  extractApprovalMetadata,
  rankRetrievalCandidates,
  splitArtifactSections,
  type ContextPack,
  type MemoryCategoryName,
  type ProjectedMemoryRecord,
} from "../src/index.js";

const timestamp = "2026-07-27T00:00:00.000Z";
const repositoryRoot = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, "$1");

describe("BOLT-10a section-level context packing", () => {
  it("splits an artifact into a preamble and its headings", () => {
    const sections = splitArtifactSections(
      "# Title\n\n**Project:** X\n\n## Project Goal\n\nBuild it.\n\n## Next Steps\n\n1. Do the thing.\n\n### Nested\n\nDetail.\n",
    );

    assert.deepEqual(
      sections.map((section) => section.heading),
      [undefined, "Project Goal", "Next Steps", "Nested"],
    );
    assert.match(sections[0]?.content ?? "", /# Title/u);
    assert.equal(sections[1]?.content, "Build it.");

    // A document with no headings yields exactly one section, so callers never special-case it.
    const single = splitArtifactSections("Just prose, no headings at all.");
    assert.equal(single.length, 1);
    assert.equal(single[0]?.heading, undefined);
    assert.deepEqual(splitArtifactSections("   \n\n  "), []);
  });

  it("keeps the newest entries of a bullet log and the opening of prose", () => {
    const bullets = ["## Log", "", ...Array.from({ length: 200 }, (_, i) => `- entry ${i + 1}`)].join("\n");
    const [bulletSection] = splitArtifactSections(bullets);
    assert.equal(bulletSection?.isBulletList, true);

    const packed = packOne(record("memory:log", "PlanMemory", "approved", bullets));
    const logItem = packed.items.find((item) => item.sectionHeading === "Log");

    assert.equal(logItem?.truncated, true);
    assert.match(logItem?.content ?? "", /earlier entries omitted/u);
    assert.match(logItem?.content ?? "", /entry 200/u, "an append-only log must keep its newest entry");
    assert.equal(/entry 1\b/u.test(logItem?.content ?? ""), false, "the oldest entry must be dropped");

    const prose = `## Notes\n\n${"Sentence one. ".repeat(400)}`;
    const proseItem = packOne(record("memory:prose", "PlanMemory", "approved", prose)).items.find(
      (item) => item.sectionHeading === "Notes",
    );

    assert.equal(proseItem?.truncated, true);
    assert.match(proseItem?.content ?? "", /remainder omitted/u);

    // The cap bounds the whole packed item, provenance header included.
    for (const item of [logItem, proseItem]) {
      assert.ok(
        (item?.tokenEstimate ?? 0) <= DEFAULT_SECTION_TOKEN_CAP,
        `item was ${item?.tokenEstimate} tokens against a ${DEFAULT_SECTION_TOKEN_CAP} cap`,
      );
    }
  });

  it("carries parent provenance onto every packed section", () => {
    const pack = packOne(
      record(
        "memory:status",
        "SessionHandoffMemory",
        "draft",
        "# Status\n\n## Project Goal\n\nGoal text.\n\n## Next Steps\n\nStep text.\n",
      ),
    );

    assert.ok(pack.items.length >= 2);
    for (const item of pack.items) {
      assert.equal(item.memoryId, "memory:status");
      assert.equal(item.sourcePath, "PROJECT_STATUS.md");
      assert.equal(item.category, "SessionHandoffMemory");
      assert.equal(item.approvalStatus, "draft");
      assert.ok(item.inclusionReason.length > 0);
      assert.match(item.content, /^Source: PROJECT_STATUS\.md/u);
    }

    assert.match(
      pack.items.find((item) => item.sectionHeading === "Next Steps")?.content ?? "",
      /Source: PROJECT_STATUS\.md § Next Steps/u,
    );
  });

  it("reserves budget per category and spills unused reservations back", () => {
    assert.equal(
      STARTUP_CATEGORY_RESERVATIONS.reduce((total, r) => total + r.share, 0) < 1,
      true,
      "reservations must leave an unreserved remainder",
    );

    const filler = `## Body\n\n${"Plan detail. ".repeat(200)}`;
    const candidates = ranked([
      record("memory:plan-1", "PlanMemory", "approved", filler),
      record("memory:plan-2", "PlanMemory", "approved", filler),
      record("memory:plan-3", "PlanMemory", "approved", filler),
      record("memory:risk", "RiskMemory", "approved", "## Risks\n\nBlocker R-008 is open."),
      record("memory:decision", "DecisionMemory", "approved", "## Decisions\n\nADR-003 selected."),
    ]);
    const pack = buildContextPack({
      intent: createQueryIntent({ mode: "startup" }),
      candidates,
      builtAt: timestamp,
    });

    const categories = new Set(pack.items.map((item) => item.category));
    assert.ok(categories.has("RiskMemory"), "a reservation keeps the small risk artifact in");
    assert.ok(categories.has("DecisionMemory"), "a reservation keeps the small decision artifact in");
    assert.ok(categories.has("PlanMemory"));
    assert.ok(pack.estimatedTokens <= DEFAULT_STARTUP_TOKEN_BUDGET);

    // With no reservations the large plan sections crowd the small ones out.
    const unreserved = buildContextPack({
      intent: createQueryIntent({ mode: "startup" }),
      candidates,
      reservations: [],
      builtAt: timestamp,
    });
    assert.ok(
      new Set(unreserved.items.map((item) => item.category)).size <= categories.size,
      "reservations must not reduce category coverage",
    );
  });

  it("lifts the sections US-001 names above the rest of their document", () => {
    const status = record(
      "memory:status",
      "SessionHandoffMemory",
      "draft",
      [
        "# Project Status",
        "",
        "## Recent Decisions",
        "",
        ...Array.from({ length: 120 }, (_, i) => `- decision ${i + 1}`),
        "",
        "## Next Steps",
        "",
        "1. Review the plan.",
      ].join("\n"),
    );

    const pack = packOne(status);
    const headings = pack.items.map((item) => item.sectionHeading);

    assert.ok(headings.includes("Next Steps"));
    assert.ok(
      headings.indexOf("Next Steps") < headings.indexOf("Recent Decisions"),
      "a document-order section must not outrank the one US-001 asks for",
    );
  });

  it("still ranks approved lifecycle memory above a conflicting draft", () => {
    const approved = record(
      "memory:approved",
      "DecisionMemory",
      "approved",
      "## Decision\n\nLocal-first storage stays authoritative.",
      "docs/02-construction/01-architecture/technology_decisions.md",
    );
    const draft = record(
      "memory:draft",
      "DecisionMemory",
      "draft",
      "## Decision\n\nLocal-first storage should be replaced.",
      "docs/02-construction/01-architecture/draft_decision.md",
    );

    const order = rankRetrievalCandidates(
      [
        { record: draft, score: 100, matchedSignals: [] },
        { record: approved, score: 100, matchedSignals: [] },
      ],
      createQueryIntent({ mode: "startup", query: "local-first" }),
    );

    assert.equal(order[0]?.record.memoryId, "memory:approved");
  });

  it("stops penalising a continuity record for being draft", () => {
    const rank = (category: MemoryCategoryName) =>
      rankRetrievalCandidates(
        [{ record: record("memory:x", category, "draft", "## Body\n\nText."), score: 100, matchedSignals: [] }],
        createQueryIntent({ mode: "startup" }),
      )[0];

    const continuity = rank("SessionHandoffMemory");
    const other = rank("DecisionMemory");

    assert.equal(continuity?.matchedSignals.includes("ranking:draft-penalty"), false);
    assert.equal(other?.matchedSignals.includes("ranking:draft-penalty"), true);
  });

  it("keeps startup at 2000 tokens and gives the explicit expanded modes more", () => {
    assert.equal(createTokenBudget({ mode: "startup" }).maximumTokens, DEFAULT_STARTUP_TOKEN_BUDGET);
    assert.equal(createTokenBudget({ mode: "focused" }).maximumTokens, 4000);
    assert.equal(createTokenBudget({ mode: "handoff" }).maximumTokens, EXPANDED_TOKEN_BUDGET);
    assert.equal(createTokenBudget({ mode: "audit" }).maximumTokens, EXPANDED_TOKEN_BUDGET);

    // NFR-002 still forbids raising the default startup budget.
    assert.throws(
      () => createTokenBudget({ mode: "startup", maximumTokens: 2001 }),
      RetrievalContextValidationError,
    );
  });

  it("honours a supersession marker anywhere in the approval section", () => {
    const verdictParagraph = extractApprovalMetadata(
      "## Approval Status\n\nApproved by user on 2026-07-27. Superseded by later.md.\n",
    );
    const laterParagraph = extractApprovalMetadata(
      "## Approval Status\n\nApproved by user on 2026-07-27.\n\nThis record is superseded by later.md.\n",
    );

    assert.equal(verdictParagraph.status, "historical");
    assert.equal(laterParagraph.status, "historical", "placement must no longer decide the outcome");
    assert.equal(laterParagraph.decisionDate, "2026-07-27");

    // The BOLT-08 false positive must not return: nfrs.md places its table under the approval
    // heading, and NFR-004's row contains the word "Historical".
    assert.equal(
      extractApprovalMetadata(
        "## Approval Status\n\nApproved by user on 2026-06-04.\n\n| ID | Requirement |\n|----|----|\n| NFR-004 | Historical approved artifacts must remain stable. |\n",
      ).status,
      "approved",
    );

    // A template placeholder still declares nothing.
    assert.equal(
      extractApprovalMetadata(
        "## Approval Status\n\n<Pending review / Approved by <APPROVER> on <DATE> / superseded by <ARTIFACT>>\n",
      ).status,
      "draft",
    );
  });

  it("meets the US-001 acceptance criterion against this repository", () => {
    const store = WorkspaceMemoryStore.open({ workspaceRoot: repositoryRoot, now: () => timestamp });
    try {
      store.rebuild({ rebuildId: "bolt10a-acceptance" });
      const pack = new StartupContextRetriever(store.projectionRepository).retrieveStartupContext({
        builtAt: timestamp,
      });

      const statusSections = pack.items
        .filter((item) => item.sourcePath === "PROJECT_STATUS.md")
        .map((item) => item.sectionHeading);

      for (const heading of ["Project Goal", "Current Status", "Next Steps"]) {
        assert.ok(
          statusSections.includes(heading),
          `the pack must carry PROJECT_STATUS.md § ${heading}; got ${JSON.stringify(statusSections)}`,
        );
      }

      assert.ok(pack.estimatedTokens <= DEFAULT_STARTUP_TOKEN_BUDGET);
      assert.ok(pack.items.length >= 8, `expected a populated pack, got ${pack.items.length}`);
      assert.ok(pack.items.every((item) => item.sourcePath.length > 0));
    } finally {
      store.close();
    }
  });
});

function record(
  memoryId: string,
  category: MemoryCategoryName,
  approvalStatus: "approved" | "draft",
  text: string,
  workspacePath = "PROJECT_STATUS.md",
): ProjectedMemoryRecord {
  return createProjectedMemoryRecord({
    memoryId,
    workspacePath,
    category,
    approvalStatus,
    observedVersion: `${memoryId}:v1`,
    observedAt: timestamp,
    sourceKind: "lifecycle_artifact",
    text,
    lastProjectedAt: timestamp,
  });
}

function ranked(records: readonly ProjectedMemoryRecord[]) {
  return rankRetrievalCandidates(
    records.map((item) => ({ record: item, score: 100, matchedSignals: [] })),
    createQueryIntent({ mode: "startup" }),
  );
}

function packOne(...records: readonly ProjectedMemoryRecord[]): ContextPack {
  return buildContextPack({
    intent: createQueryIntent({ mode: "startup" }),
    candidates: ranked(records),
    builtAt: timestamp,
  });
}
