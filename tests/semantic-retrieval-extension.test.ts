import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";

import {
  DEFAULT_FUSION_POLICY,
  SEMANTIC_RETRIEVAL_MODES,
  SemanticRetrievalExtension,
  SemanticRetrievalValidationError,
  assessSemanticConflict,
  buildContextPack,
  buildSemanticCandidateSet,
  cleanupSemanticEntries,
  createProjectedMemoryRecord,
  createQueryIntent,
  createSemanticRetrievalProfile,
  createSemanticSignal,
  createTokenBudget,
  disableSemanticRetrieval,
  enableSemanticRetrieval,
  evaluateSemanticEligibility,
  fuseRetrievalCandidates,
  isSemanticRetrievalActive,
  type ApprovalStatus,
  type ProjectedMemoryRecord,
  type RetrievalCandidate,
  type SemanticDeleteRequest,
  type SemanticDeleteResult,
  type SemanticIndexPort,
  type SemanticMatch,
  type SemanticProviderPort,
  type SemanticRetrievalProfile,
} from "../src/index.js";

const timestamp = "2026-07-27T00:00:00.000Z";

describe("BOLT-07 optional semantic retrieval extension", () => {
  it("creates a disabled profile by default and validates mode transitions", () => {
    const profile = semanticProfile();

    assert.equal(profile.mode, "disabled");
    assert.equal(isSemanticRetrievalActive(profile), false);
    assert.equal(isSemanticRetrievalActive(undefined), false);
    assert.deepEqual([...SEMANTIC_RETRIEVAL_MODES], ["disabled", "enabled", "experimental", "expanded"]);

    const experimental = enableSemanticRetrieval(profile, {
      reason: "Operator enabled experimental semantic recall.",
      mode: "experimental",
      updatedAt: timestamp,
    });
    assert.equal(experimental.mode, "experimental");
    assert.equal(isSemanticRetrievalActive(experimental), true);
    assert.equal(profile.mode, "disabled", "transitions must return copies");

    assert.equal(
      disableSemanticRetrieval(experimental, { reason: "Back to lifecycle-only retrieval." }).mode,
      "disabled",
    );
    assert.throws(
      () => enableSemanticRetrieval(profile, { reason: "Ambiguous.", mode: "disabled" }),
      SemanticRetrievalValidationError,
    );
    assert.throws(
      () => enableSemanticRetrieval(profile, { reason: "" }),
      SemanticRetrievalValidationError,
    );
    assert.throws(
      () => createSemanticRetrievalProfile({ profileId: "p", workspaceId: "w", candidateLimit: 0 }),
      SemanticRetrievalValidationError,
    );
    assert.throws(() => createSemanticSignal(1.5, "Too similar."), SemanticRetrievalValidationError);
  });

  it("leaves baseline retrieval and context packing untouched while disabled", () => {
    const baseline = [
      baselineCandidate("memory:plan", "approved", 120),
      baselineCandidate("memory:decision", "approved", 90),
    ];
    const decision = fuseRetrievalCandidates({ baseline, profile: semanticProfile() });

    assert.equal(decision.mode, "disabled");
    assert.equal(decision.degraded, false);
    assert.deepEqual(
      decision.candidates.map((candidate) => candidate.record.memoryId),
      ["memory:plan", "memory:decision"],
    );
    assert.equal(decision.items.every((item) => item.origin === "baseline"), true);
    assert.match(decision.explanation, /semantic extension is disabled/u);

    // The fused list must still pack exactly like the untouched baseline list.
    const budget = createTokenBudget({ mode: "startup" });
    const intent = createQueryIntent({ goal: "BOLT-07" });
    const fusedPack = buildContextPack({ intent, candidates: decision.candidates, tokenBudget: budget, builtAt: timestamp });
    const baselinePack = buildContextPack({ intent, candidates: baseline, tokenBudget: budget, builtAt: timestamp });
    assert.deepEqual(fusedPack, baselinePack);
    assert.ok(fusedPack.estimatedTokens <= budget.maximumTokens);
  });

  it("falls back to baseline and reports degraded mode when a port is missing or recall fails", () => {
    const active = enableSemanticRetrieval(semanticProfile(), { reason: "Enabled for recall." });
    const baseline = [baselineCandidate("memory:plan", "approved", 120)];
    const recallInput = {
      intent: createQueryIntent({ goal: "semantic recall" }),
      workspaceId: "agent-memory",
      governedRecords: new Map<string, ProjectedMemoryRecord>(),
      requestedAt: timestamp,
    };

    const noPorts = new SemanticRetrievalExtension(active).recall(recallInput);
    assert.equal(noPorts.degraded, true);
    assert.match(noPorts.degradedReason ?? "", /no semantic provider or index is attached/u);
    assert.equal(noPorts.candidateSet, undefined);

    const indexOnly = new SemanticRetrievalExtension(active, { index: stubIndex([]) }).recall(recallInput);
    assert.match(indexOnly.degradedReason ?? "", /no semantic provider is attached/u);

    const throwingProvider: SemanticProviderPort = {
      describeProvider: () => ({ providerLabel: "stub", modelLabel: "stub", privacyClass: "local" }),
      embedMemory: () => representation(),
      embedQuery: () => {
        throw new Error("Provider endpoint unavailable.");
      },
    };
    const failed = new SemanticRetrievalExtension(active, {
      provider: throwingProvider,
      index: stubIndex([]),
    }).recall(recallInput);
    assert.equal(failed.degraded, true);
    assert.match(failed.degradedReason ?? "", /Provider endpoint unavailable/u);

    // Degraded recall still yields a usable baseline-only fusion decision.
    const decision = new SemanticRetrievalExtension(active).fuse(baseline, noPorts);
    assert.equal(decision.degraded, true);
    assert.deepEqual(decision.candidates, baseline);
    assert.equal(decision.policy, DEFAULT_FUSION_POLICY);
  });

  it("rejects semantic matches without a governed reference or eligibility", () => {
    const governedRecords = recordMap([
      projected("memory:known", "approved", { visibility: "workspace" }),
      projected("memory:private", "approved", { visibility: "team_shared" }),
      projected("memory:expired", "approved", { retentionPolicy: "raw-observation-24h" }),
      projected("memory:deleted", "approved", {}),
    ]);

    const set = buildSemanticCandidateSet({
      matches: [
        match("memory:known", 0.9),
        match("memory:orphan", 0.95),
        match("memory:private", 0.9),
        match("memory:expired", 0.9),
        match("memory:deleted", 0.9),
        match("memory:known", 1.4),
      ],
      governedRecords,
      eligibility: {
        actorVisibilityScope: "workspace",
        deletedMemoryIds: ["memory:deleted"],
        expiredRetentionPolicies: ["raw-observation-24h"],
      },
    });

    assert.deepEqual(
      set.candidates.map((candidate) => candidate.memoryId),
      ["memory:known"],
    );
    assert.deepEqual(
      set.rejected.map((rejection) => [rejection.memoryId, rejection.rule]),
      [
        ["memory:orphan", "missing_governed_reference"],
        ["memory:private", "ineligible_visibility"],
        ["memory:expired", "ineligible_retention"],
        ["memory:deleted", "deleted_memory"],
        ["memory:known", "invalid_similarity"],
      ],
    );

    assert.equal(set.candidates[0]?.signal.secondary, true);
    assert.equal(set.candidates[0]?.signal.confidenceBand, "high");
    assert.equal(
      evaluateSemanticEligibility(projected("memory:private", "approved", { visibility: "team_shared" }), {
        actorVisibilityScope: "team_shared",
      }).eligible,
      true,
    );
  });

  it("keeps approved lifecycle candidates above a higher-similarity semantic candidate", () => {
    const baseline = [baselineCandidate("memory:approved-plan", "approved", 200)];
    const semanticRecord = projected("memory:related-note", "approved", {
      workspacePath: "docs/other/related-note.md",
    });
    const set = buildSemanticCandidateSet({
      matches: [match("memory:related-note", 1)],
      governedRecords: recordMap([semanticRecord]),
      eligibility: { actorVisibilityScope: "workspace" },
    });

    const decision = fuseRetrievalCandidates({
      baseline,
      profile: enableSemanticRetrieval(semanticProfile(), { reason: "Enabled." }),
      semantic: set,
    });

    assert.deepEqual(
      decision.candidates.map((candidate) => candidate.record.memoryId),
      ["memory:approved-plan", "memory:related-note"],
      "a perfect-similarity semantic candidate must still rank below approved lifecycle memory",
    );
    assert.equal(decision.items[0]?.finalRank, 0);
    assert.equal(decision.items[1]?.origin, "semantic");
    assert.equal(decision.items[1]?.outcome, "included");
    assert.equal(decision.candidates[1]?.score, 0);
    assert.ok(decision.candidates[1]?.matchedSignals.includes("semantic:secondary-signal"));
    assert.match(decision.explanation, /lifecycle-authoritative order/u);
  });

  it("annotates rather than reorders when semantic agrees with a baseline candidate", () => {
    const baseline = [
      baselineCandidate("memory:plan", "approved", 200),
      baselineCandidate("memory:decision", "approved", 150),
    ];
    const set = buildSemanticCandidateSet({
      matches: [match("memory:decision", 0.99)],
      governedRecords: recordMap([projected("memory:decision", "approved", {})]),
      eligibility: { actorVisibilityScope: "workspace" },
    });

    const decision = fuseRetrievalCandidates({
      baseline,
      profile: enableSemanticRetrieval(semanticProfile(), { reason: "Enabled." }),
      semantic: set,
    });

    assert.deepEqual(
      decision.candidates.map((candidate) => candidate.record.memoryId),
      ["memory:plan", "memory:decision"],
    );
    assert.equal(decision.items[1]?.origin, "both");
    assert.equal(decision.items[1]?.semanticSignal?.secondary, true);
    assert.equal(decision.items[1]?.baselineRank, 1);
  });

  it("demotes, excludes, or routes for review when semantic conflicts with approved memory", () => {
    const sharedPath = "docs/02-construction/02-design-plan/contested.md";
    const approvedBaseline = [
      baselineCandidate("memory:approved-v2", "approved", 200, {
        workspacePath: sharedPath,
        observedVersion: "v2",
      }),
      baselineCandidate("memory:unrelated", "approved", 180),
    ];

    const draft = semanticCandidateFor("memory:draft-v3", "draft", sharedPath, "v3");
    const historical = semanticCandidateFor("memory:old-v1", "historical", sharedPath, "v1");
    const rivalApproved = semanticCandidateFor("memory:approved-v9", "approved", sharedPath, "v9");

    assert.equal(assessSemanticConflict(draft, approvedBaseline)?.outcome, "demote");
    assert.equal(assessSemanticConflict(historical, approvedBaseline)?.outcome, "exclude");
    assert.equal(assessSemanticConflict(rivalApproved, approvedBaseline)?.outcome, "review_required");
    assert.equal(
      assessSemanticConflict(semanticCandidateFor("memory:elsewhere", "draft", "docs/other.md", "v1"), approvedBaseline),
      undefined,
    );

    const unrelated = semanticCandidateFor("memory:elsewhere", "approved", "docs/other.md", "v1");
    const decision = fuseRetrievalCandidates({
      baseline: approvedBaseline,
      profile: enableSemanticRetrieval(semanticProfile(), { reason: "Enabled." }),
      semantic: { candidates: [draft, historical, rivalApproved, unrelated], rejected: [] },
    });

    // Excluded and review-required candidates never enter the pack; demoted ones go last.
    assert.deepEqual(
      decision.candidates.map((candidate) => candidate.record.memoryId),
      ["memory:approved-v2", "memory:unrelated", "memory:elsewhere", "memory:draft-v3"],
    );
    assert.equal(outcomeFor(decision.items, "memory:old-v1"), "excluded");
    assert.equal(outcomeFor(decision.items, "memory:approved-v9"), "review_required");
    assert.equal(outcomeFor(decision.items, "memory:draft-v3"), "demoted");
    assert.equal(
      decision.items.find((item) => item.memoryId === "memory:old-v1")?.finalRank,
      undefined,
    );
    assert.ok(
      decision.candidates[3]?.matchedSignals.includes("semantic:demoted-below-approved-lifecycle-memory"),
    );
  });

  it("purges deleted memories from the semantic index and reports incomplete cleanup", () => {
    const disabled = semanticProfile();
    const active = enableSemanticRetrieval(disabled, { reason: "Enabled." });
    const request = { operationId: "op:delete-1", memoryIds: ["memory:gone"], requestedAt: timestamp };

    const notApplicable = cleanupSemanticEntries(request, disabled, stubIndex([]));
    assert.equal(notApplicable.outcome, "not_applicable");
    assert.equal(notApplicable.retryable, false);

    const noIndex = cleanupSemanticEntries(request, active);
    assert.equal(noIndex.outcome, "incomplete");
    assert.equal(noIndex.retryable, true);
    assert.deepEqual(noIndex.remainingMemoryIds, ["memory:gone"]);

    const store = new Set(["memory:gone"]);
    const index = stubIndex([], store);
    const first = cleanupSemanticEntries(request, active, index);
    assert.equal(first.outcome, "completed");
    assert.deepEqual(first.removedMemoryIds, ["memory:gone"]);

    // Idempotent: repeating the same operation still reports completed with nothing left.
    const second = cleanupSemanticEntries(request, active, index);
    assert.equal(second.outcome, "completed");
    assert.deepEqual(second.removedMemoryIds, []);
    assert.deepEqual(second.remainingMemoryIds, []);

    const stubborn: SemanticIndexPort = {
      ...stubIndex([]),
      deleteSemanticEntries: (deleteRequest: SemanticDeleteRequest): SemanticDeleteResult => ({
        removedMemoryIds: [],
        remainingMemoryIds: [...deleteRequest.memoryIds],
      }),
    };
    const stuck = cleanupSemanticEntries(request, active, stubborn);
    assert.equal(stuck.outcome, "incomplete");
    assert.equal(stuck.retryable, true);

    const throwing: SemanticIndexPort = {
      ...stubIndex([]),
      deleteSemanticEntries: () => {
        throw new Error("Index locked.");
      },
    };
    const failed = cleanupSemanticEntries(request, active, throwing);
    assert.equal(failed.outcome, "incomplete");
    assert.match(failed.reason, /Index locked/u);
    assert.throws(
      () => cleanupSemanticEntries({ ...request, operationId: "" }, active, index),
      SemanticRetrievalValidationError,
    );
  });

  it("recalls through attached ports without leaving the governed memory set", () => {
    const record = projected("memory:related-note", "approved", {
      workspacePath: "docs/other/related-note.md",
    });
    const extension = new SemanticRetrievalExtension(
      enableSemanticRetrieval(semanticProfile(), { reason: "Enabled." }),
      {
        provider: stubProvider(),
        index: stubIndex([match("memory:related-note", 0.7), match("memory:ghost", 0.99)]),
      },
    );

    const recall = extension.recall({
      intent: createQueryIntent({ goal: "semantic recall", query: "related note" }),
      workspaceId: "agent-memory",
      governedRecords: recordMap([record]),
      requestedAt: timestamp,
      eligibility: { actorVisibilityScope: "workspace" },
    });

    assert.equal(recall.degraded, false);
    assert.deepEqual(
      recall.candidateSet?.candidates.map((candidate) => candidate.memoryId),
      ["memory:related-note"],
    );
    assert.equal(recall.candidateSet?.rejected[0]?.rule, "missing_governed_reference");
    assert.equal(recall.candidateSet?.candidates[0]?.signal.confidenceBand, "medium");

    const decision = extension.fuse([baselineCandidate("memory:plan", "approved", 200)], recall);
    assert.deepEqual(
      decision.candidates.map((candidate) => candidate.record.memoryId),
      ["memory:plan", "memory:related-note"],
    );

    // An intent with no goal or query has nothing to embed and degrades rather than guessing.
    const empty = extension.recall({
      intent: createQueryIntent({}),
      workspaceId: "agent-memory",
      governedRecords: recordMap([record]),
      requestedAt: timestamp,
    });
    assert.equal(empty.degraded, true);
    assert.match(empty.degradedReason ?? "", /needs a goal or query term/u);
  });

  it("requires no embedding provider, vector index, or other dependency", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const dependencyNames = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ];

    for (const forbidden of [
      "openai",
      "cohere",
      "transformers",
      "onnxruntime",
      "embedding",
      "sqlite-vec",
      "pgvector",
      "chromadb",
      "faiss",
      "lancedb",
      "iii",
    ]) {
      assert.equal(
        dependencyNames.some((dependencyName) => dependencyName.toLowerCase().includes(forbidden)),
        false,
        `unexpected dependency matching '${forbidden}'`,
      );
    }

    const sourceRoot = new URL("../../src/domain/", import.meta.url);
    for (const relativePath of listTypeScriptSources(sourceRoot)) {
      const source = readFileSync(new URL(relativePath, sourceRoot), "utf8");
      const importTargets = [...source.matchAll(/from\s+"([^"]+)"|require\("([^"]+)"\)/gu)].map(
        (match_) => match_[1] ?? match_[2] ?? "",
      );

      for (const target of importTargets) {
        assert.equal(
          target.startsWith(".") || target.startsWith("node:"),
          true,
          `${relativePath} imports non-local module '${target}'`,
        );
      }
    }
  });
});

function semanticProfile(): SemanticRetrievalProfile {
  return createSemanticRetrievalProfile({
    profileId: "profile:agent-memory",
    workspaceId: "agent-memory",
  });
}

function projected(
  memoryId: string,
  approvalStatus: ApprovalStatus,
  overrides: {
    readonly workspacePath?: string;
    readonly visibility?: "private" | "workspace" | "team_shared";
    readonly retentionPolicy?: string;
    readonly observedVersion?: string;
  },
): ProjectedMemoryRecord {
  return createProjectedMemoryRecord({
    memoryId,
    workspacePath: overrides.workspacePath ?? `docs/generated/${memoryId.replace(":", "-")}.md`,
    category: "PlanMemory",
    approvalStatus,
    visibility: overrides.visibility ?? "workspace",
    retentionPolicy: overrides.retentionPolicy ?? "approved-lifecycle-default",
    observedVersion: overrides.observedVersion ?? "v1",
    observedAt: timestamp,
    sourceKind: "lifecycle_artifact",
    text: `Lifecycle memory content for ${memoryId}.`,
    lastProjectedAt: timestamp,
  });
}

function baselineCandidate(
  memoryId: string,
  approvalStatus: ApprovalStatus,
  score: number,
  overrides: { readonly workspacePath?: string; readonly observedVersion?: string } = {},
): RetrievalCandidate {
  const record = projected(memoryId, approvalStatus, overrides);
  const signals = ["ranking:approved-lifecycle-memory"];

  return {
    record,
    score,
    matchedSignals: signals,
    rationale: {
      signals,
      explanation: `${record.category} from ${record.workspacePath} was included as approved lifecycle memory.`,
    },
  };
}

function semanticCandidateFor(
  memoryId: string,
  approvalStatus: ApprovalStatus,
  workspacePath: string,
  observedVersion: string,
) {
  const record = projected(memoryId, approvalStatus, { workspacePath, observedVersion });

  return {
    candidateId: `semantic:${memoryId}`,
    memoryId,
    record,
    similarity: 0.95,
    signal: createSemanticSignal(0.95, `Conceptually close to ${workspacePath}.`),
  };
}

function match(memoryId: string, similarity: number): SemanticMatch {
  return { memoryId, similarity, rationale: `Conceptual similarity for ${memoryId}.` };
}

function recordMap(records: readonly ProjectedMemoryRecord[]): ReadonlyMap<string, ProjectedMemoryRecord> {
  return new Map(records.map((record) => [record.memoryId, record]));
}

function representation() {
  return { representationId: "representation:stub", providerLabel: "stub", createdAt: timestamp };
}

function stubProvider(): SemanticProviderPort {
  return {
    describeProvider: () => ({ providerLabel: "stub", modelLabel: "stub", privacyClass: "local" }),
    embedMemory: () => representation(),
    embedQuery: () => representation(),
  };
}

function stubIndex(matches: readonly SemanticMatch[], store?: Set<string>): SemanticIndexPort {
  return {
    upsertSemanticEntry: (entry) => {
      store?.add(entry.memoryId);
    },
    querySemanticCandidates: () => matches,
    deleteSemanticEntries: (request: SemanticDeleteRequest): SemanticDeleteResult => {
      const removed = request.memoryIds.filter((memoryId) => store?.delete(memoryId) ?? false);
      return { removedMemoryIds: removed, remainingMemoryIds: [] };
    },
  };
}

function outcomeFor(
  items: readonly { readonly memoryId: string; readonly outcome: string }[],
  memoryId: string,
): string | undefined {
  return items.find((item) => item.memoryId === memoryId)?.outcome;
}

function listTypeScriptSources(root: URL): readonly string[] {
  const paths: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      paths.push(...listTypeScriptSources(new URL(`${entry.name}/`, root)).map((child) => `${entry.name}/${child}`));
    } else if (entry.name.endsWith(".ts")) {
      paths.push(entry.name);
    }
  }

  return paths;
}
