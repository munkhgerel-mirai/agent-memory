import type {
  ApprovalStatus,
  LifecyclePhase,
  MemoryCategoryName,
} from "./lifecycle-memory-core.js";
import type {
  LocalIndexProjectionRepository,
  LocalMemorySearchResult,
  ProjectedMemoryRecord,
} from "./local-workspace-storage.js";

export class RetrievalContextValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetrievalContextValidationError";
  }
}

export const RETRIEVAL_MODES = ["startup", "focused", "handoff", "audit"] as const;

export type RetrievalMode = (typeof RETRIEVAL_MODES)[number];

export const DEFAULT_STARTUP_TOKEN_BUDGET = 2000;

export interface QueryIntent {
  readonly mode: RetrievalMode;
  readonly goal?: string;
  readonly phase?: LifecyclePhase;
  readonly query?: string;
  readonly categories: readonly MemoryCategoryName[];
  readonly approvalStatus?: ApprovalStatus;
}

export interface CreateQueryIntentInput {
  readonly mode?: RetrievalMode;
  readonly goal?: string;
  readonly phase?: LifecyclePhase;
  readonly query?: string;
  readonly categories?: readonly MemoryCategoryName[];
  readonly approvalStatus?: ApprovalStatus;
}

export interface TokenBudget {
  readonly mode: RetrievalMode;
  readonly maximumTokens: number;
  readonly estimatorLabel: string;
}

export interface CreateTokenBudgetInput {
  readonly mode?: RetrievalMode;
  readonly maximumTokens?: number;
  readonly estimatorLabel?: string;
}

export interface RetrievalCandidate {
  readonly record: ProjectedMemoryRecord;
  readonly score: number;
  readonly matchedSignals: readonly string[];
  readonly rationale: RankingRationale;
}

export interface RankingRationale {
  readonly signals: readonly string[];
  readonly explanation: string;
}

export interface ContextPackItem {
  readonly memoryId: string;
  readonly sourcePath: string;
  readonly category: MemoryCategoryName;
  readonly approvalStatus: ApprovalStatus;
  readonly inclusionReason: string;
  readonly tokenEstimate: number;
  readonly content: string;
}

export interface ContextPack {
  readonly mode: RetrievalMode;
  readonly goal?: string;
  readonly phase?: LifecyclePhase;
  readonly tokenBudget: TokenBudget;
  readonly estimatedTokens: number;
  readonly items: readonly ContextPackItem[];
  readonly omittedCandidateCount: number;
  readonly builtAt: string;
}

export interface BuildContextPackInput {
  readonly intent: QueryIntent;
  readonly candidates: readonly RetrievalCandidate[];
  readonly tokenBudget?: TokenBudget;
  readonly builtAt: string;
}

export interface RetrieveStartupContextInput extends Omit<CreateQueryIntentInput, "mode"> {
  readonly builtAt: string;
  readonly tokenBudget?: TokenBudget;
  readonly limit?: number;
}

export function createQueryIntent(input: CreateQueryIntentInput = {}): QueryIntent {
  const mode = input.mode ?? "startup";
  assertRetrievalMode(mode);

  return {
    mode,
    goal: cleanOptional(input.goal),
    phase: input.phase,
    query: cleanOptional(input.query),
    categories: [...(input.categories ?? [])],
    approvalStatus: input.approvalStatus,
  };
}

export function createTokenBudget(input: CreateTokenBudgetInput = {}): TokenBudget {
  const mode = input.mode ?? "startup";
  assertRetrievalMode(mode);
  const maximumTokens = input.maximumTokens ?? (mode === "startup" ? DEFAULT_STARTUP_TOKEN_BUDGET : 4000);

  if (!Number.isInteger(maximumTokens) || maximumTokens <= 0) {
    throw new RetrievalContextValidationError("Token budget must be a positive integer.");
  }

  if (mode === "startup" && maximumTokens > DEFAULT_STARTUP_TOKEN_BUDGET) {
    throw new RetrievalContextValidationError(
      "Startup token budget cannot exceed 2000 tokens in BOLT-03.",
    );
  }

  return {
    mode,
    maximumTokens,
    estimatorLabel: cleanOptional(input.estimatorLabel) ?? "approx-chars-per-token-v1",
  };
}

export function estimateTokens(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return Math.max(1, Math.ceil(trimmed.length / 4));
}

export function rankRetrievalCandidates(
  searchResults: readonly LocalMemorySearchResult[],
  intent: QueryIntent,
): readonly RetrievalCandidate[] {
  return searchResults
    .map((result) => rankSearchResult(result, intent))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.record.workspacePath.localeCompare(right.record.workspacePath);
    });
}

export function buildContextPack(input: BuildContextPackInput): ContextPack {
  const tokenBudget = input.tokenBudget ?? createTokenBudget({ mode: input.intent.mode });
  let estimatedTokens = 0;
  const items: ContextPackItem[] = [];

  for (const candidate of input.candidates) {
    const content = renderContextPackItemContent(candidate);
    const tokenEstimate = estimateTokens(content);
    if (estimatedTokens + tokenEstimate > tokenBudget.maximumTokens) {
      continue;
    }

    items.push({
      memoryId: candidate.record.memoryId,
      sourcePath: candidate.record.workspacePath,
      category: candidate.record.category,
      approvalStatus: candidate.record.approvalStatus,
      inclusionReason: candidate.rationale.explanation,
      tokenEstimate,
      content,
    });
    estimatedTokens += tokenEstimate;
  }

  return {
    mode: input.intent.mode,
    goal: input.intent.goal,
    phase: input.intent.phase,
    tokenBudget,
    estimatedTokens,
    items,
    omittedCandidateCount: Math.max(0, input.candidates.length - items.length),
    builtAt: input.builtAt,
  };
}

export class StartupContextRetriever {
  constructor(private readonly projection: LocalIndexProjectionRepository) {}

  retrieveStartupContext(input: RetrieveStartupContextInput): ContextPack {
    const intent = createQueryIntent({
      ...input,
      mode: "startup",
    });
    const tokenBudget = input.tokenBudget ?? createTokenBudget({ mode: "startup" });
    const query = startupQuery(intent);
    const searchResults = this.projection.search({
      query,
      limit: input.limit ?? 100,
    });
    const ranked = rankRetrievalCandidates(searchResults, intent);

    return buildContextPack({
      intent,
      candidates: ranked,
      tokenBudget,
      builtAt: input.builtAt,
    });
  }
}

function rankSearchResult(
  result: LocalMemorySearchResult,
  intent: QueryIntent,
): RetrievalCandidate {
  const signals = [...result.matchedSignals];
  let score = result.score;

  if (result.record.approvalStatus === "approved") {
    score += 50;
    signals.push("ranking:approved-lifecycle-memory");
  } else if (result.record.approvalStatus === "draft") {
    score -= 10;
    signals.push("ranking:draft-penalty");
  }

  const categoryBoost = startupCategoryBoost(result.record.category);
  if (categoryBoost > 0) {
    score += categoryBoost;
    signals.push(`ranking:startup-category:${result.record.category}`);
  }

  if (intent.phase && result.record.phase === intent.phase) {
    score += 15;
    signals.push(`ranking:phase:${intent.phase}`);
  }

  for (const term of intentTerms(intent)) {
    if (searchableRecordText(result.record).includes(term)) {
      score += 5;
      signals.push(`ranking:intent-term:${term}`);
    }
  }

  if (/blocker|risk|r-\d+/iu.test(result.record.text)) {
    score += 15;
    signals.push("ranking:blocker-risk-signal");
  }

  if (/next steps?|follow-?ups?/iu.test(result.record.text)) {
    score += 15;
    signals.push("ranking:next-step-signal");
  }

  return {
    record: result.record,
    score,
    matchedSignals: signals,
    rationale: {
      signals,
      explanation: explainRanking(result.record, signals),
    },
  };
}

function startupCategoryBoost(category: MemoryCategoryName): number {
  switch (category) {
    case "PlanMemory":
      return 60;
    case "DecisionMemory":
      return 50;
    case "RiskMemory":
      return 45;
    case "SessionHandoffMemory":
      return 40;
    case "VerificationMemory":
      return 25;
    case "NfrMemory":
    case "UserStoryMemory":
      return 20;
    default:
      return 10;
  }
}

function renderContextPackItemContent(candidate: RetrievalCandidate): string {
  return [
    `Source: ${candidate.record.workspacePath}`,
    `Category: ${candidate.record.category}`,
    `Approval: ${candidate.record.approvalStatus}`,
    `Reason: ${candidate.rationale.explanation}`,
    candidate.record.text,
  ].join("\n");
}

function explainRanking(
  record: ProjectedMemoryRecord,
  signals: readonly string[],
): string {
  if (signals.includes("ranking:approved-lifecycle-memory")) {
    return `${record.category} from ${record.workspacePath} was included because it is approved lifecycle memory with relevant startup context.`;
  }

  return `${record.category} from ${record.workspacePath} was included because it matched startup retrieval signals.`;
}

function startupQuery(intent: QueryIntent): string {
  return [
    intent.goal,
    intent.phase,
    intent.query,
    "project goal current status active plan approved decision blocker risk next steps follow-up verification session handoff",
  ]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ");
}

function intentTerms(intent: QueryIntent): readonly string[] {
  return [intent.goal, intent.phase, intent.query]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .flatMap((part) => part.toLowerCase().split(/[^a-z0-9_-]+/))
    .map((term) => term.trim())
    .filter((term) => term.length > 0);
}

function searchableRecordText(record: ProjectedMemoryRecord): string {
  return [record.workspacePath, record.category, record.phase, record.approvalStatus, record.text]
    .join("\n")
    .toLowerCase();
}

function assertRetrievalMode(value: string): asserts value is RetrievalMode {
  if (!RETRIEVAL_MODES.includes(value as RetrievalMode)) {
    throw new RetrievalContextValidationError(`Unknown retrieval mode: ${value}`);
  }
}

function cleanOptional(value: string | undefined): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}