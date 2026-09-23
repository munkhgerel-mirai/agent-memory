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

/**
 * NFR-002 caps the default at 2000 tokens "unless an explicit expanded retrieval mode is
 * requested". `handoff` and `audit` are those explicit modes, so they may carry more.
 */
export const EXPANDED_TOKEN_BUDGET = 20000;

export const DEFAULT_SECTION_TOKEN_CAP = 500;

const DEFAULT_BUDGET_BY_MODE: Record<RetrievalMode, number> = {
  startup: DEFAULT_STARTUP_TOKEN_BUDGET,
  focused: 4000,
  handoff: EXPANDED_TOKEN_BUDGET,
  audit: EXPANDED_TOKEN_BUDGET,
};

export interface CategoryReservation {
  readonly label: string;
  readonly categories: readonly MemoryCategoryName[];
  readonly share: number;
}

/**
 * Startup packing reserves budget per lifecycle category so the pack's shape matches what
 * US-001 AC-001 enumerates, rather than whatever happens to rank highest. Unfilled
 * reservations spill back into the general pool, so a workspace missing a category loses
 * nothing.
 */
export const STARTUP_CATEGORY_RESERVATIONS: readonly CategoryReservation[] = [
  { label: "continuity", categories: ["SessionHandoffMemory"], share: 0.25 },
  { label: "active-plan", categories: ["PlanMemory", "ApprovalGateMemory"], share: 0.25 },
  { label: "decisions", categories: ["DecisionMemory"], share: 0.2 },
  { label: "blockers", categories: ["RiskMemory"], share: 0.15 },
];

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
  /** Absent for an artifact's preamble, or for an artifact with no headings. */
  readonly sectionHeading?: string;
  readonly truncated?: boolean;
}

export interface ArtifactSection {
  readonly heading?: string;
  readonly content: string;
  readonly isBulletList: boolean;
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
  readonly sectionTokenCap?: number;
  readonly reservations?: readonly CategoryReservation[];
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
  const maximumTokens = input.maximumTokens ?? DEFAULT_BUDGET_BY_MODE[mode];

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

/**
 * Packs sections rather than whole documents. AI-DLC artifacts run to thousands of tokens, so
 * whole-document packing let a single artifact consume a 2000-token budget and left US-001
 * unanswerable. A section keeps its parent's provenance, so US-001 AC-003 still holds.
 */
export function buildContextPack(input: BuildContextPackInput): ContextPack {
  const tokenBudget = input.tokenBudget ?? createTokenBudget({ mode: input.intent.mode });
  const sectionCap = input.sectionTokenCap ?? DEFAULT_SECTION_TOKEN_CAP;
  const packable = collectPackableSections(input.candidates, sectionCap);

  const reservations =
    input.reservations ?? (input.intent.mode === "startup" ? STARTUP_CATEGORY_RESERVATIONS : []);
  const selected = selectWithinBudget(packable, tokenBudget.maximumTokens, reservations);

  const items = packable.filter((_, index) => selected.has(index)).map((entry) => entry.item);
  const estimatedTokens = items.reduce((total, item) => total + item.tokenEstimate, 0);

  return {
    mode: input.intent.mode,
    goal: input.intent.goal,
    phase: input.intent.phase,
    tokenBudget,
    estimatedTokens,
    items,
    omittedCandidateCount: Math.max(0, packable.length - items.length),
    builtAt: input.builtAt,
  };
}

/**
 * Splits artifact text on Markdown headings. Content before the first heading becomes an
 * unnamed preamble, and an artifact with no headings yields exactly one section, so the
 * caller never has to special-case either shape.
 */
export function splitArtifactSections(text: string): readonly ArtifactSection[] {
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  const sections: ArtifactSection[] = [];
  let heading: string | undefined;
  let buffer: string[] = [];

  const flush = (): void => {
    const content = buffer.join("\n").trim();
    if (content.length > 0) {
      sections.push({ heading, content, isBulletList: isBulletList(content) });
    }
    buffer = [];
  };

  for (const line of lines) {
    const match = /^#{2,6}\s+(.*)$/u.exec(line);
    if (match) {
      flush();
      heading = match[1]?.trim();
      continue;
    }

    buffer.push(line);
  }
  flush();

  return sections;
}

/**
 * Heading-level signals for the elements US-001 AC-001 enumerates. BOLT-03 already looked for
 * next-step and blocker wording, but applied it to whole documents where almost everything
 * matched. Applied to a heading it actually discriminates.
 */
const SECTION_HEADING_SIGNALS: readonly { readonly pattern: RegExp; readonly boost: number }[] = [
  { pattern: /\bproject\s+goal\b|\bgoal\b|\bintent\b|\bpurpose\b/iu, boost: 60 },
  { pattern: /\bcurrent\s+status\b|\bphase\b/iu, boost: 55 },
  { pattern: /\bnext\s+steps?\b/iu, boost: 50 },
  { pattern: /\brisks?\b|\bblockers?\b/iu, boost: 45 },
];

interface PackableSection {
  readonly category: MemoryCategoryName;
  readonly item: ContextPackItem;
  readonly score: number;
}

function sectionHeadingBoost(heading: string | undefined): number {
  if (!heading) return 0;

  return SECTION_HEADING_SIGNALS.find((signal) => signal.pattern.test(heading))?.boost ?? 0;
}

function collectPackableSections(
  candidates: readonly RetrievalCandidate[],
  sectionCap: number,
): readonly PackableSection[] {
  const packable: PackableSection[] = [];

  for (const candidate of candidates) {
    for (const section of splitArtifactSections(candidate.record.text)) {
      // The cap bounds the packed item, not just its body. The provenance header carries a
      // free-text inclusion reason, so capping the body alone would leave item size unbounded.
      const header = renderProvenanceHeader(candidate, section.heading);
      const capped = capSectionContent(section, Math.max(1, sectionCap - estimateTokens(header)));
      const content = `${header}\n${capped.content}`;

      packable.push({
        category: candidate.record.category,
        // Parent relevance plus heading signal, so a heading boost lifts the right section
        // without letting an irrelevant document jump the queue on its heading alone.
        score: candidate.score + sectionHeadingBoost(section.heading),
        item: {
          memoryId: candidate.record.memoryId,
          sourcePath: candidate.record.workspacePath,
          category: candidate.record.category,
          approvalStatus: candidate.record.approvalStatus,
          inclusionReason: candidate.rationale.explanation,
          tokenEstimate: estimateTokens(content),
          content,
          sectionHeading: section.heading,
          truncated: capped.truncated,
        },
      });
    }
  }

  return packable
    .map((entry, index) => ({ entry, index }))
    .sort((left, right) =>
      right.entry.score !== left.entry.score
        ? right.entry.score - left.entry.score
        : left.index - right.index,
    )
    .map(({ entry }) => entry);
}

function selectWithinBudget(
  packable: readonly PackableSection[],
  maximumTokens: number,
  reservations: readonly CategoryReservation[],
): ReadonlySet<number> {
  const selected = new Set<number>();
  let spent = 0;

  const take = (index: number, tokens: number): void => {
    selected.add(index);
    spent += tokens;
  };

  for (const reservation of reservations) {
    let allowance = Math.floor(maximumTokens * reservation.share);

    for (const [index, entry] of packable.entries()) {
      if (selected.has(index)) continue;
      if (!reservation.categories.includes(entry.category)) continue;

      const tokens = entry.item.tokenEstimate;
      if (tokens > allowance || spent + tokens > maximumTokens) continue;

      take(index, tokens);
      allowance -= tokens;
    }
  }

  // Unfilled reservations spill back here, so nothing is wasted on an absent category.
  for (const [index, entry] of packable.entries()) {
    if (selected.has(index)) continue;

    const tokens = entry.item.tokenEstimate;
    if (spent + tokens > maximumTokens) continue;

    take(index, tokens);
  }

  return selected;
}

const TRUNCATED_HEAD_MARKER = "[earlier entries omitted]";
const TRUNCATED_TAIL_MARKER = "[remainder omitted]";

/**
 * A bullet list in this corpus is an append-only log whose newest entry is last, so keeping
 * the head would return the oldest decisions. Prose leads with its point, so it keeps the head.
 */
function capSectionContent(
  section: ArtifactSection,
  capTokens: number,
): { readonly content: string; readonly truncated: boolean } {
  if (estimateTokens(section.content) <= capTokens) {
    return { content: section.content, truncated: false };
  }

  if (section.isBulletList) {
    const lines = section.content.split("\n");
    const kept: string[] = [];
    let tokens = estimateTokens(TRUNCATED_HEAD_MARKER);

    for (let index = lines.length - 1; index >= 0; index -= 1) {
      const line = lines[index] ?? "";
      const lineTokens = estimateTokens(line);
      if (tokens + lineTokens > capTokens) break;

      tokens += lineTokens;
      kept.unshift(line);
    }

    return { content: [TRUNCATED_HEAD_MARKER, ...kept].join("\n"), truncated: true };
  }

  const maxCharacters = Math.max(0, capTokens * 4 - TRUNCATED_TAIL_MARKER.length - 1);

  return {
    content: `${section.content.slice(0, maxCharacters).trimEnd()}\n${TRUNCATED_TAIL_MARKER}`,
    truncated: true,
  };
}

function isBulletList(content: string): boolean {
  const lines = content.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
  if (lines.length < 3) return false;

  const bullets = lines.filter((line) => /^([-*+]|\d+\.)\s/u.test(line)).length;

  return bullets / lines.length >= 0.6;
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
  } else if (result.record.approvalStatus === "draft" && !isContinuityCategory(result.record.category)) {
    // A continuity record such as PROJECT_STATUS.md is never "approved" by nature, so
    // penalising it for being draft is a category error. It is the current state of the
    // project and US-001 depends on it.
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

function isContinuityCategory(category: MemoryCategoryName): boolean {
  return category === "SessionHandoffMemory";
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

function renderProvenanceHeader(
  candidate: RetrievalCandidate,
  heading: string | undefined,
): string {
  return [
    `Source: ${candidate.record.workspacePath}${heading ? ` § ${heading}` : ""}`,
    `Category: ${candidate.record.category}`,
    `Approval: ${candidate.record.approvalStatus}`,
    `Reason: ${candidate.rationale.explanation}`,
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