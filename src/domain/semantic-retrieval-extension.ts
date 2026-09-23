import type { ApprovalStatus } from "./lifecycle-memory-core.js";
import type {
  MemoryVisibility,
  ProjectedMemoryRecord,
} from "./local-workspace-storage.js";
import type { QueryIntent, RetrievalCandidate } from "./retrieval-context.js";

export class SemanticRetrievalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SemanticRetrievalValidationError";
  }
}

export const SEMANTIC_RETRIEVAL_MODES = [
  "disabled",
  "enabled",
  "experimental",
  "expanded",
] as const;

export type SemanticRetrievalMode = (typeof SEMANTIC_RETRIEVAL_MODES)[number];

export type SemanticConfidenceBand = "low" | "medium" | "high";

export type SemanticCandidateRejectionRule =
  | "missing_governed_reference"
  | "invalid_similarity"
  | "ineligible_visibility"
  | "ineligible_retention"
  | "deleted_memory";

export type ConflictOutcome = "exclude" | "demote" | "review_required";

export type FusionOutcome = "included" | "demoted" | "excluded" | "review_required";

export type SemanticCleanupOutcome = "not_applicable" | "completed" | "incomplete";

export interface SemanticRetrievalProfile {
  readonly profileId: string;
  readonly workspaceId: string;
  readonly mode: SemanticRetrievalMode;
  readonly reason: string;
  readonly candidateLimit: number;
  readonly updatedAt?: string;
}

export interface CreateSemanticRetrievalProfileInput {
  readonly profileId: string;
  readonly workspaceId: string;
  readonly candidateLimit?: number;
  readonly reason?: string;
  readonly updatedAt?: string;
}

export interface ChangeSemanticProfileInput {
  readonly reason: string;
  readonly mode?: SemanticRetrievalMode;
  readonly updatedAt?: string;
}

/**
 * Opaque handle for whatever a future provider produces. Deliberately not a vector: ADR-005
 * defers provider selection, so this slice must not commit to a representation shape.
 */
export interface SemanticRepresentation {
  readonly representationId: string;
  readonly providerLabel: string;
  readonly createdAt: string;
}

export interface SemanticProviderDescriptor {
  readonly providerLabel: string;
  readonly modelLabel: string;
  readonly privacyClass: "local" | "hosted";
}

export interface EmbedMemoryInput {
  readonly memoryId: string;
  readonly text: string;
  readonly requestedAt: string;
}

export interface EmbedQueryInput {
  readonly query: string;
  readonly requestedAt: string;
}

export interface SemanticProviderPort {
  describeProvider(): SemanticProviderDescriptor;
  embedMemory(input: EmbedMemoryInput): SemanticRepresentation;
  embedQuery(input: EmbedQueryInput): SemanticRepresentation;
}

export interface SemanticIndexEntry {
  readonly memoryId: string;
  readonly representation: SemanticRepresentation;
  readonly indexedAt: string;
}

export interface SemanticQueryRequest {
  readonly representation: SemanticRepresentation;
  readonly workspaceId: string;
  readonly candidateLimit: number;
}

export interface SemanticMatch {
  readonly memoryId: string;
  readonly similarity: number;
  readonly rationale: string;
}

export interface SemanticDeleteRequest {
  readonly operationId: string;
  readonly memoryIds: readonly string[];
}

export interface SemanticDeleteResult {
  readonly removedMemoryIds: readonly string[];
  readonly remainingMemoryIds: readonly string[];
}

export interface SemanticIndexPort {
  upsertSemanticEntry(entry: SemanticIndexEntry): void;
  querySemanticCandidates(request: SemanticQueryRequest): readonly SemanticMatch[];
  deleteSemanticEntries(request: SemanticDeleteRequest): SemanticDeleteResult;
}

export interface SemanticSignal {
  readonly label: string;
  readonly rationale: string;
  readonly confidenceBand: SemanticConfidenceBand;
  /** Literal `true`: a semantic signal can never be constructed as a primary signal. */
  readonly secondary: true;
}

export interface SemanticCandidate {
  readonly candidateId: string;
  readonly memoryId: string;
  readonly record: ProjectedMemoryRecord;
  readonly similarity: number;
  readonly signal: SemanticSignal;
}

export interface SemanticCandidateRejection {
  readonly memoryId: string;
  readonly rule: SemanticCandidateRejectionRule;
  readonly reason: string;
}

export interface SemanticCandidateSet {
  readonly candidates: readonly SemanticCandidate[];
  readonly rejected: readonly SemanticCandidateRejection[];
}

export interface SemanticEligibilityContext {
  readonly actorVisibilityScope: MemoryVisibility;
  readonly deletedMemoryIds?: readonly string[];
  readonly expiredRetentionPolicies?: readonly string[];
}

export interface SemanticEligibilityDecision {
  readonly eligible: boolean;
  readonly rule?: SemanticCandidateRejectionRule;
  readonly reason: string;
}

export interface BuildSemanticCandidateSetInput {
  readonly matches: readonly SemanticMatch[];
  readonly governedRecords: ReadonlyMap<string, ProjectedMemoryRecord>;
  readonly eligibility?: SemanticEligibilityContext;
  readonly candidateLimit?: number;
}

export interface FusionPolicy {
  readonly policyVersion: string;
  readonly priorityOrder: readonly string[];
  readonly conflictRule: "lifecycle_authoritative";
}

export interface ConflictAssessment {
  readonly conflictingMemoryId: string;
  readonly approvedSourceMemoryId: string;
  readonly outcome: ConflictOutcome;
  readonly reason: string;
}

export interface FusionResultItem {
  readonly memoryId: string;
  readonly origin: "baseline" | "semantic" | "both";
  readonly outcome: FusionOutcome;
  readonly baselineRank?: number;
  readonly finalRank?: number;
  readonly semanticSignal?: SemanticSignal;
  readonly conflict?: ConflictAssessment;
}

export interface RetrievalFusionDecision {
  readonly policy: FusionPolicy;
  readonly mode: SemanticRetrievalMode;
  readonly degraded: boolean;
  readonly degradedReason?: string;
  readonly candidates: readonly RetrievalCandidate[];
  readonly items: readonly FusionResultItem[];
  readonly explanation: string;
}

export interface FuseRetrievalCandidatesInput {
  readonly baseline: readonly RetrievalCandidate[];
  readonly profile?: SemanticRetrievalProfile;
  readonly semantic?: SemanticCandidateSet;
  readonly policy?: FusionPolicy;
  readonly degradedReason?: string;
}

export interface SemanticRecallInput {
  readonly intent: QueryIntent;
  readonly workspaceId: string;
  readonly governedRecords: ReadonlyMap<string, ProjectedMemoryRecord>;
  readonly requestedAt: string;
  readonly eligibility?: SemanticEligibilityContext;
}

export interface SemanticRecallResult {
  readonly mode: SemanticRetrievalMode;
  readonly degraded: boolean;
  readonly degradedReason?: string;
  readonly candidateSet?: SemanticCandidateSet;
}

export interface SemanticCleanupRequest {
  readonly operationId: string;
  readonly memoryIds: readonly string[];
  readonly requestedAt: string;
}

export interface SemanticCleanupResult {
  readonly operationId: string;
  readonly outcome: SemanticCleanupOutcome;
  readonly removedMemoryIds: readonly string[];
  readonly remainingMemoryIds: readonly string[];
  readonly reason: string;
  readonly retryable: boolean;
}

export interface SemanticRetrievalPorts {
  readonly provider?: SemanticProviderPort;
  readonly index?: SemanticIndexPort;
}

export const DEFAULT_SEMANTIC_CANDIDATE_LIMIT = 10;

export const DEFAULT_FUSION_POLICY: FusionPolicy = {
  policyVersion: "lifecycle-first-v1",
  priorityOrder: ["approved_lifecycle_memory", "baseline_retrieval_signal", "semantic_signal"],
  conflictRule: "lifecycle_authoritative",
};

const VISIBILITY_RANK: Record<MemoryVisibility, number> = {
  private: 0,
  workspace: 1,
  team_shared: 2,
};

/** Approval states that a later approved version of the same artifact supersedes outright. */
const SUPERSEDED_STATUSES: readonly ApprovalStatus[] = ["historical", "changes_requested"];

/** Approval states that stay available but must never sit above approved lifecycle memory. */
const UNSETTLED_STATUSES: readonly ApprovalStatus[] = ["draft", "pending_review", "deferred"];

export function createSemanticRetrievalProfile(
  input: CreateSemanticRetrievalProfileInput,
): SemanticRetrievalProfile {
  assertText(input.profileId, "Semantic profile ID is required.");
  assertText(input.workspaceId, "Semantic profile workspace is required.");

  const candidateLimit = input.candidateLimit ?? DEFAULT_SEMANTIC_CANDIDATE_LIMIT;
  if (!Number.isInteger(candidateLimit) || candidateLimit <= 0) {
    throw new SemanticRetrievalValidationError(
      "Semantic candidate limit must be a positive integer.",
    );
  }

  return {
    profileId: input.profileId.trim(),
    workspaceId: input.workspaceId.trim(),
    // ADR-005: v1 ships with semantic retrieval off, and off is a fully valid state.
    mode: "disabled",
    reason: cleanOptional(input.reason) ?? "Semantic retrieval is disabled by default in v1.",
    candidateLimit,
    updatedAt: cleanOptional(input.updatedAt),
  };
}

export function enableSemanticRetrieval(
  profile: SemanticRetrievalProfile,
  input: ChangeSemanticProfileInput,
): SemanticRetrievalProfile {
  const mode = input.mode ?? "enabled";
  if (mode === "disabled") {
    throw new SemanticRetrievalValidationError(
      "Use disableSemanticRetrieval to turn the semantic extension off.",
    );
  }

  return withMode(profile, mode, input);
}

export function disableSemanticRetrieval(
  profile: SemanticRetrievalProfile,
  input: ChangeSemanticProfileInput,
): SemanticRetrievalProfile {
  return withMode(profile, "disabled", input);
}

export function isSemanticRetrievalActive(profile?: SemanticRetrievalProfile): boolean {
  return profile !== undefined && profile.mode !== "disabled";
}

export function createSemanticSignal(
  similarity: number,
  rationale: string,
): SemanticSignal {
  assertSimilarity(similarity);
  assertText(rationale, "Semantic signal rationale is required.");

  return {
    label: "semantic:similarity",
    rationale: rationale.trim(),
    confidenceBand: confidenceBandFor(similarity),
    secondary: true,
  };
}

export function evaluateSemanticEligibility(
  record: ProjectedMemoryRecord,
  context?: SemanticEligibilityContext,
): SemanticEligibilityDecision {
  if (context?.deletedMemoryIds?.includes(record.memoryId)) {
    return {
      eligible: false,
      rule: "deleted_memory",
      reason: `${record.memoryId} was deleted and cannot re-enter retrieval through a derived index.`,
    };
  }

  if (context?.expiredRetentionPolicies?.includes(record.retentionPolicy)) {
    return {
      eligible: false,
      rule: "ineligible_retention",
      reason: `${record.memoryId} falls under expired retention policy '${record.retentionPolicy}'.`,
    };
  }

  const actorScope = context?.actorVisibilityScope ?? "private";
  if (VISIBILITY_RANK[record.visibility] > VISIBILITY_RANK[actorScope]) {
    return {
      eligible: false,
      rule: "ineligible_visibility",
      reason: `${record.memoryId} has '${record.visibility}' visibility, which exceeds the '${actorScope}' actor scope.`,
    };
  }

  return { eligible: true, reason: `${record.memoryId} passed governance eligibility.` };
}

/**
 * Turns raw index matches into candidates. A match that cannot be tied back to a governed
 * memory record is rejected here, so semantic similarity can never introduce a memory that
 * governance has not already seen.
 */
export function buildSemanticCandidateSet(
  input: BuildSemanticCandidateSetInput,
): SemanticCandidateSet {
  const candidates: SemanticCandidate[] = [];
  const rejected: SemanticCandidateRejection[] = [];
  const limit = input.candidateLimit ?? DEFAULT_SEMANTIC_CANDIDATE_LIMIT;

  for (const match of input.matches) {
    if (!isValidSimilarity(match.similarity)) {
      rejected.push({
        memoryId: match.memoryId,
        rule: "invalid_similarity",
        reason: `Similarity ${match.similarity} is outside the inclusive 0..1 range.`,
      });
      continue;
    }

    const record = input.governedRecords.get(match.memoryId);
    if (!record) {
      rejected.push({
        memoryId: match.memoryId,
        rule: "missing_governed_reference",
        reason: `${match.memoryId} has no governed memory record and cannot become a candidate.`,
      });
      continue;
    }

    const eligibility = evaluateSemanticEligibility(record, input.eligibility);
    if (!eligibility.eligible) {
      rejected.push({
        memoryId: match.memoryId,
        rule: eligibility.rule ?? "missing_governed_reference",
        reason: eligibility.reason,
      });
      continue;
    }

    candidates.push({
      candidateId: `semantic:${match.memoryId}`,
      memoryId: match.memoryId,
      record,
      similarity: match.similarity,
      signal: createSemanticSignal(match.similarity, match.rationale),
    });
  }

  candidates.sort((left, right) => {
    if (right.similarity !== left.similarity) return right.similarity - left.similarity;
    return left.memoryId.localeCompare(right.memoryId);
  });

  return { candidates: candidates.slice(0, limit), rejected };
}

/**
 * Compares a semantic-only candidate against approved baseline evidence for the same source
 * path. The conservative default is to demote rather than include when the two disagree; the
 * evidence threshold for `review_required` stays deliberately narrow (LD-UNIT05-OQ-003).
 */
export function assessSemanticConflict(
  candidate: SemanticCandidate,
  baseline: readonly RetrievalCandidate[],
): ConflictAssessment | undefined {
  const approvedPeer = baseline.find(
    (item) =>
      item.record.approvalStatus === "approved" &&
      item.record.workspacePath === candidate.record.workspacePath &&
      item.record.memoryId !== candidate.memoryId,
  );
  if (!approvedPeer) return undefined;

  const status = candidate.record.approvalStatus;

  if (SUPERSEDED_STATUSES.includes(status)) {
    return {
      conflictingMemoryId: candidate.memoryId,
      approvedSourceMemoryId: approvedPeer.record.memoryId,
      outcome: "exclude",
      reason: `${candidate.memoryId} is '${status}' for ${candidate.record.workspacePath}, which approved memory ${approvedPeer.record.memoryId} supersedes.`,
    };
  }

  if (UNSETTLED_STATUSES.includes(status)) {
    return {
      conflictingMemoryId: candidate.memoryId,
      approvedSourceMemoryId: approvedPeer.record.memoryId,
      outcome: "demote",
      reason: `${candidate.memoryId} is '${status}' while approved memory ${approvedPeer.record.memoryId} covers the same source.`,
    };
  }

  if (status === "approved" && candidate.record.observedVersion !== approvedPeer.record.observedVersion) {
    return {
      conflictingMemoryId: candidate.memoryId,
      approvedSourceMemoryId: approvedPeer.record.memoryId,
      outcome: "review_required",
      reason: `Two approved versions of ${candidate.record.workspacePath} disagree: '${candidate.record.observedVersion}' and '${approvedPeer.record.observedVersion}'.`,
    };
  }

  return undefined;
}

/**
 * Fuses semantic candidates into a baseline result list. Baseline order is never changed:
 * semantic evidence either annotates a baseline candidate it already agrees with, or lands
 * strictly after every baseline candidate. That is what keeps lifecycle memory authoritative
 * under R-003 regardless of how confident a future provider is.
 */
export function fuseRetrievalCandidates(
  input: FuseRetrievalCandidatesInput,
): RetrievalFusionDecision {
  const policy = input.policy ?? DEFAULT_FUSION_POLICY;
  const mode = input.profile?.mode ?? "disabled";
  const active = isSemanticRetrievalActive(input.profile);
  const degraded = active && input.semantic === undefined;

  const items: FusionResultItem[] = input.baseline.map((candidate, index) => ({
    memoryId: candidate.record.memoryId,
    origin: "baseline",
    outcome: "included",
    baselineRank: index,
    finalRank: index,
  }));

  if (!active || !input.semantic) {
    return {
      policy,
      mode,
      degraded,
      degradedReason: degraded
        ? input.degradedReason ?? "Semantic retrieval is active but no candidate set was produced."
        : undefined,
      candidates: [...input.baseline],
      items,
      explanation: degraded
        ? "Baseline lifecycle retrieval was used because the semantic extension produced no candidates."
        : "Baseline lifecycle retrieval was used because the semantic extension is disabled.",
    };
  }

  const baselineByMemoryId = new Map(
    input.baseline.map((candidate, index) => [candidate.record.memoryId, index] as const),
  );
  const fused: RetrievalCandidate[] = [...input.baseline];
  const demoted: SemanticCandidate[] = [];

  for (const candidate of input.semantic.candidates) {
    const baselineRank = baselineByMemoryId.get(candidate.memoryId);
    if (baselineRank !== undefined) {
      // Agreement with baseline: record the signal, but do not let it move the ranking.
      const item = items[baselineRank];
      if (item) {
        items[baselineRank] = { ...item, origin: "both", semanticSignal: candidate.signal };
      }
      continue;
    }

    const conflict = assessSemanticConflict(candidate, input.baseline);
    if (conflict?.outcome === "exclude") {
      items.push(semanticItem(candidate, "excluded", conflict));
      continue;
    }

    if (conflict?.outcome === "review_required") {
      items.push(semanticItem(candidate, "review_required", conflict));
      continue;
    }

    if (conflict?.outcome === "demote") {
      demoted.push(candidate);
      items.push(semanticItem(candidate, "demoted", conflict));
      continue;
    }

    items.push(semanticItem(candidate, "included"));
    fused.push(toRetrievalCandidate(candidate, "included"));
  }

  for (const candidate of demoted) {
    fused.push(toRetrievalCandidate(candidate, "demoted"));
  }

  let rank = 0;
  const finalRankByMemoryId = new Map(fused.map((candidate) => [candidate.record.memoryId, rank++] as const));
  const rankedItems = items.map((item) =>
    item.outcome === "included" || item.outcome === "demoted"
      ? { ...item, finalRank: finalRankByMemoryId.get(item.memoryId) }
      : { ...item, finalRank: undefined },
  );

  const semanticIncluded = rankedItems.filter(
    (item) => item.origin === "semantic" && item.outcome === "included",
  ).length;
  const semanticDemoted = rankedItems.filter((item) => item.outcome === "demoted").length;
  const semanticExcluded = rankedItems.filter(
    (item) => item.outcome === "excluded" || item.outcome === "review_required",
  ).length;

  return {
    policy,
    mode,
    degraded: false,
    candidates: fused,
    items: rankedItems,
    explanation:
      `${input.baseline.length} baseline candidates kept their lifecycle-authoritative order; ` +
      `${semanticIncluded} semantic candidates were appended, ${semanticDemoted} demoted, and ${semanticExcluded} excluded or routed for review.`,
  };
}

/**
 * Removes deleted memories from the derived semantic index. Reports `incomplete` instead of
 * succeeding quietly whenever an active profile cannot prove the purge happened, because a
 * silent success would let a deleted memory survive in derived data (NFR-011, R-005).
 */
export function cleanupSemanticEntries(
  request: SemanticCleanupRequest,
  profile?: SemanticRetrievalProfile,
  index?: SemanticIndexPort,
): SemanticCleanupResult {
  assertText(request.operationId, "Semantic cleanup operation ID is required.");
  assertText(request.requestedAt, "Semantic cleanup timestamp is required.");

  if (!isSemanticRetrievalActive(profile)) {
    return {
      operationId: request.operationId,
      outcome: "not_applicable",
      removedMemoryIds: [],
      remainingMemoryIds: [],
      reason: "Semantic retrieval is disabled, so no derived semantic entries exist to purge.",
      retryable: false,
    };
  }

  if (!index) {
    return {
      operationId: request.operationId,
      outcome: "incomplete",
      removedMemoryIds: [],
      remainingMemoryIds: [...request.memoryIds],
      reason: "Semantic retrieval is active but no semantic index port is attached to confirm the purge.",
      retryable: true,
    };
  }

  let result: SemanticDeleteResult;
  try {
    result = index.deleteSemanticEntries({
      operationId: request.operationId,
      memoryIds: request.memoryIds,
    });
  } catch (error) {
    return {
      operationId: request.operationId,
      outcome: "incomplete",
      removedMemoryIds: [],
      remainingMemoryIds: [...request.memoryIds],
      reason: `Semantic index purge failed: ${errorMessage(error)}`,
      retryable: true,
    };
  }

  if (result.remainingMemoryIds.length > 0) {
    return {
      operationId: request.operationId,
      outcome: "incomplete",
      removedMemoryIds: [...result.removedMemoryIds],
      remainingMemoryIds: [...result.remainingMemoryIds],
      reason: `${result.remainingMemoryIds.length} memory IDs remain in the semantic index after cleanup.`,
      retryable: true,
    };
  }

  return {
    operationId: request.operationId,
    outcome: "completed",
    removedMemoryIds: [...result.removedMemoryIds],
    remainingMemoryIds: [],
    reason: `Semantic index purge completed for operation ${request.operationId}.`,
    retryable: false,
  };
}

/**
 * Optional coordinator that holds the profile and the two deferred ports. It exists so
 * degraded behaviour is a tested contract rather than something each caller reinvents.
 */
export class SemanticRetrievalExtension {
  constructor(
    private readonly profile: SemanticRetrievalProfile,
    private readonly ports: SemanticRetrievalPorts = {},
  ) {}

  describeProfile(): SemanticRetrievalProfile {
    return this.profile;
  }

  recall(input: SemanticRecallInput): SemanticRecallResult {
    if (!isSemanticRetrievalActive(this.profile)) {
      return {
        mode: this.profile.mode,
        degraded: false,
        candidateSet: undefined,
      };
    }

    const missing = this.missingPortLabel();
    if (missing) {
      return {
        mode: this.profile.mode,
        degraded: true,
        degradedReason: `Semantic retrieval is '${this.profile.mode}' but no ${missing} is attached; baseline retrieval continues.`,
      };
    }

    const queryText = semanticQueryText(input.intent);
    if (!queryText) {
      return {
        mode: this.profile.mode,
        degraded: true,
        degradedReason: "Semantic retrieval needs a goal or query term; baseline retrieval continues.",
      };
    }

    let matches: readonly SemanticMatch[];
    try {
      const representation = this.ports.provider!.embedQuery({
        query: queryText,
        requestedAt: input.requestedAt,
      });
      matches = this.ports.index!.querySemanticCandidates({
        representation,
        workspaceId: input.workspaceId,
        candidateLimit: this.profile.candidateLimit,
      });
    } catch (error) {
      return {
        mode: this.profile.mode,
        degraded: true,
        degradedReason: `Semantic recall failed and baseline retrieval continues: ${errorMessage(error)}`,
      };
    }

    return {
      mode: this.profile.mode,
      degraded: false,
      candidateSet: buildSemanticCandidateSet({
        matches,
        governedRecords: input.governedRecords,
        eligibility: input.eligibility,
        candidateLimit: this.profile.candidateLimit,
      }),
    };
  }

  fuse(
    baseline: readonly RetrievalCandidate[],
    recall: SemanticRecallResult,
    policy?: FusionPolicy,
  ): RetrievalFusionDecision {
    return fuseRetrievalCandidates({
      baseline,
      profile: this.profile,
      semantic: recall.candidateSet,
      policy,
      degradedReason: recall.degradedReason,
    });
  }

  cleanup(request: SemanticCleanupRequest): SemanticCleanupResult {
    return cleanupSemanticEntries(request, this.profile, this.ports.index);
  }

  private missingPortLabel(): string | undefined {
    if (!this.ports.provider && !this.ports.index) return "semantic provider or index";
    if (!this.ports.provider) return "semantic provider";
    if (!this.ports.index) return "semantic index";
    return undefined;
  }
}

function withMode(
  profile: SemanticRetrievalProfile,
  mode: SemanticRetrievalMode,
  input: ChangeSemanticProfileInput,
): SemanticRetrievalProfile {
  assertSemanticRetrievalMode(mode);
  assertText(input.reason, "Semantic profile change requires a human-readable reason.");

  return {
    ...profile,
    mode,
    reason: input.reason.trim(),
    updatedAt: cleanOptional(input.updatedAt) ?? profile.updatedAt,
  };
}

function semanticItem(
  candidate: SemanticCandidate,
  outcome: FusionOutcome,
  conflict?: ConflictAssessment,
): FusionResultItem {
  return {
    memoryId: candidate.memoryId,
    origin: "semantic",
    outcome,
    semanticSignal: candidate.signal,
    conflict,
  };
}

function toRetrievalCandidate(
  candidate: SemanticCandidate,
  outcome: Extract<FusionOutcome, "included" | "demoted">,
): RetrievalCandidate {
  const signals = [
    candidate.signal.label,
    `semantic:confidence:${candidate.signal.confidenceBand}`,
    `semantic:secondary-signal`,
    ...(outcome === "demoted" ? ["semantic:demoted-below-approved-lifecycle-memory"] : []),
  ];

  return {
    record: candidate.record,
    // Zero keeps a semantic-only candidate from competing with baseline scores if a caller
    // re-sorts the fused list; ordering is already positional.
    score: 0,
    matchedSignals: signals,
    rationale: {
      signals,
      explanation:
        outcome === "demoted"
          ? `${candidate.record.category} from ${candidate.record.workspacePath} was included as a demoted secondary semantic signal below approved lifecycle memory.`
          : `${candidate.record.category} from ${candidate.record.workspacePath} was included as a secondary semantic signal after baseline lifecycle candidates.`,
    },
  };
}

function semanticQueryText(intent: QueryIntent): string | undefined {
  return cleanOptional([intent.goal, intent.query].filter(Boolean).join(" "));
}

function confidenceBandFor(similarity: number): SemanticConfidenceBand {
  if (similarity >= 0.8) return "high";
  if (similarity >= 0.5) return "medium";
  return "low";
}

function isValidSimilarity(similarity: number): boolean {
  return Number.isFinite(similarity) && similarity >= 0 && similarity <= 1;
}

function assertSimilarity(similarity: number): void {
  if (!isValidSimilarity(similarity)) {
    throw new SemanticRetrievalValidationError(
      `Semantic similarity must be within the inclusive 0..1 range, received ${similarity}.`,
    );
  }
}

function assertSemanticRetrievalMode(value: string): asserts value is SemanticRetrievalMode {
  if (!SEMANTIC_RETRIEVAL_MODES.includes(value as SemanticRetrievalMode)) {
    throw new SemanticRetrievalValidationError(`Unknown semantic retrieval mode: ${value}`);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function assertText(value: string | undefined, message: string): asserts value is string {
  if (!hasText(value)) {
    throw new SemanticRetrievalValidationError(message);
  }
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanOptional(value: string | undefined): string | undefined {
  return hasText(value) ? value.trim() : undefined;
}
