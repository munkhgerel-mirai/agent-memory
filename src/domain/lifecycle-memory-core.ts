export class LifecycleMemoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LifecycleMemoryValidationError";
  }
}

export type LifecyclePhase =
  | "inception"
  | "construction"
  | "operations"
  | "cross_phase";

export const V1_MEMORY_CATEGORY_NAMES = [
  "IntentMemory",
  "PlanMemory",
  "ApprovalGateMemory",
  "DecisionMemory",
  "AssumptionMemory",
  "OpenQuestionMemory",
  "UserStoryMemory",
  "NfrMemory",
  "RiskMemory",
  "UnitMemory",
  "BoltMemory",
  "VerificationMemory",
  "SessionHandoffMemory",
] as const;

export type MemoryCategoryName = (typeof V1_MEMORY_CATEGORY_NAMES)[number];

export interface MemoryCategory {
  readonly name: MemoryCategoryName;
  readonly phase: LifecyclePhase;
  readonly description: string;
}

export const V1_MEMORY_CATEGORIES: readonly MemoryCategory[] = [
  {
    name: "IntentMemory",
    phase: "inception",
    description: "Clarified project intent and durable product purpose.",
  },
  {
    name: "PlanMemory",
    phase: "cross_phase",
    description: "Approved or pending AI-DLC plans and execution gates.",
  },
  {
    name: "ApprovalGateMemory",
    phase: "cross_phase",
    description: "Human approval, rejection, or review status for lifecycle gates.",
  },
  {
    name: "DecisionMemory",
    phase: "cross_phase",
    description: "Human-approved technology, architecture, or design decisions.",
  },
  {
    name: "AssumptionMemory",
    phase: "cross_phase",
    description: "Explicit assumptions that shape downstream work.",
  },
  {
    name: "OpenQuestionMemory",
    phase: "cross_phase",
    description: "Unresolved questions and trade-offs requiring human decision.",
  },
  {
    name: "UserStoryMemory",
    phase: "inception",
    description: "User stories and acceptance criteria.",
  },
  {
    name: "NfrMemory",
    phase: "inception",
    description: "Non-functional requirements and target measures.",
  },
  {
    name: "RiskMemory",
    phase: "inception",
    description: "Risks, mitigations, triggers, and ownership.",
  },
  {
    name: "UnitMemory",
    phase: "inception",
    description: "AI-DLC Units and their cohesive business capabilities.",
  },
  {
    name: "BoltMemory",
    phase: "inception",
    description: "AI-DLC Bolts and their execution sequencing.",
  },
  {
    name: "VerificationMemory",
    phase: "cross_phase",
    description: "Validation, verification, code-generation, and test evidence.",
  },
  {
    name: "SessionHandoffMemory",
    phase: "cross_phase",
    description: "Session logs and handoff records used for continuity.",
  },
] as const;

const CATEGORY_BY_NAME = new Map(
  V1_MEMORY_CATEGORIES.map((category) => [category.name, category]),
);

export function listMemoryCategories(): readonly MemoryCategory[] {
  return V1_MEMORY_CATEGORIES;
}

export function isMemoryCategoryName(value: string): value is MemoryCategoryName {
  return CATEGORY_BY_NAME.has(value as MemoryCategoryName);
}

export function requireMemoryCategory(name: string): MemoryCategory {
  const category = CATEGORY_BY_NAME.get(name as MemoryCategoryName);
  if (!category) {
    throw new LifecycleMemoryValidationError(
      `Unknown AI-DLC memory category: ${name}`,
    );
  }

  return category;
}

export type ApprovalStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "changes_requested"
  | "deferred"
  | "historical";

export interface ApprovalState {
  readonly status: ApprovalStatus;
  readonly approver?: string;
  readonly decisionDate?: string;
  readonly rationale?: string;
}

export interface CreateApprovalStateInput {
  readonly status: ApprovalStatus;
  readonly approver?: string;
  readonly decisionDate?: string;
  readonly rationale?: string;
}

export function createApprovalState(
  input: CreateApprovalStateInput,
): ApprovalState {
  if (input.status === "approved" && !hasText(input.approver)) {
    throw new LifecycleMemoryValidationError(
      "Approved memory requires approver evidence.",
    );
  }

  if (input.status === "approved" && !hasText(input.decisionDate)) {
    throw new LifecycleMemoryValidationError(
      "Approved memory requires decision date evidence.",
    );
  }

  return {
    status: input.status,
    approver: cleanOptional(input.approver),
    decisionDate: cleanOptional(input.decisionDate),
    rationale: cleanOptional(input.rationale),
  };
}

export interface ArtifactSource {
  readonly workspacePath: string;
  readonly artifactType: string;
  readonly observedVersion: string;
  readonly observedAt: string;
  readonly isTemplate: boolean;
}

export interface CreateArtifactSourceInput {
  readonly workspacePath: string;
  readonly artifactType?: string;
  readonly observedVersion: string;
  readonly observedAt: string;
  readonly isTemplate?: boolean;
}

export function createArtifactSource(
  input: CreateArtifactSourceInput,
): ArtifactSource {
  const workspacePath = normalizeWorkspacePath(input.workspacePath);
  assertText(workspacePath, "Artifact source path is required.");
  assertText(input.observedVersion, "Artifact source observed version is required.");
  assertText(input.observedAt, "Artifact source observed timestamp is required.");

  return {
    workspacePath,
    artifactType: cleanOptional(input.artifactType) ?? inferArtifactType(workspacePath),
    observedVersion: input.observedVersion.trim(),
    observedAt: input.observedAt.trim(),
    isTemplate: input.isTemplate ?? isTemplateSourcePath(workspacePath),
  };
}

export interface ClassificationRationale {
  readonly ruleName: string;
  readonly evidenceReference: string;
  readonly confidence: number;
}

export interface CreateClassificationRationaleInput {
  readonly ruleName: string;
  readonly evidenceReference: string;
  readonly confidence: number;
}

export function createClassificationRationale(
  input: CreateClassificationRationaleInput,
): ClassificationRationale {
  assertText(input.ruleName, "Classification rule name is required.");
  assertText(
    input.evidenceReference,
    "Classification evidence reference is required.",
  );

  if (!Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1) {
    throw new LifecycleMemoryValidationError(
      "Classification confidence must be between 0 and 1.",
    );
  }

  return {
    ruleName: input.ruleName.trim(),
    evidenceReference: input.evidenceReference.trim(),
    confidence: input.confidence,
  };
}

export interface ArtifactClassification {
  readonly classificationId: string;
  readonly source: ArtifactSource;
  readonly primaryCategory: MemoryCategoryName;
  readonly secondaryCategories: readonly MemoryCategoryName[];
  readonly rationale: ClassificationRationale;
}

export function classifyArtifactSource(
  source: ArtifactSource,
): ArtifactClassification {
  const normalizedPath = normalizeWorkspacePath(source.workspacePath);
  const lowerPath = normalizedPath.toLowerCase();
  const lowerType = source.artifactType.toLowerCase();
  const match = matchCategoryRule(lowerPath, lowerType);

  if (!match) {
    throw new LifecycleMemoryValidationError(
      `No AI-DLC classification rule matched artifact source: ${source.workspacePath}`,
    );
  }

  return {
    classificationId: classificationIdFor(source, match.primaryCategory),
    source,
    primaryCategory: match.primaryCategory,
    secondaryCategories: match.secondaryCategories,
    rationale: createClassificationRationale({
      ruleName: match.ruleName,
      evidenceReference: source.workspacePath,
      confidence: match.confidence,
    }),
  };
}

export type LifecycleMemoryStatus = "current" | "historical";

export interface LifecycleMemoryRecord {
  readonly id: string;
  readonly category: MemoryCategory;
  readonly secondaryCategories: readonly MemoryCategory[];
  readonly source: ArtifactSource;
  readonly approval: ApprovalState;
  readonly rationale: ClassificationRationale;
  readonly status: LifecycleMemoryStatus;
  readonly createdAt: string;
}

export interface CreateLifecycleMemoryRecordInput {
  readonly source: ArtifactSource;
  readonly category: MemoryCategoryName;
  readonly secondaryCategories?: readonly MemoryCategoryName[];
  readonly approval: ApprovalState;
  readonly rationale: ClassificationRationale;
  readonly createdAt: string;
}

export function createLifecycleMemoryRecord(
  input: CreateLifecycleMemoryRecordInput,
): LifecycleMemoryRecord {
  const category = requireMemoryCategory(input.category);
  const secondaryCategories = validateSecondaryCategories(
    input.category,
    input.secondaryCategories ?? [],
  );

  if (input.source.isTemplate && input.approval.status === "approved") {
    throw new LifecycleMemoryValidationError(
      "Reusable templates and runtime examples cannot become approved lifecycle memory.",
    );
  }

  assertText(input.createdAt, "Lifecycle memory creation timestamp is required.");

  return {
    id: memoryIdFor(input.source, input.category),
    category,
    secondaryCategories,
    source: input.source,
    approval: input.approval,
    rationale: input.rationale,
    status: input.approval.status === "historical" ? "historical" : "current",
    createdAt: input.createdAt.trim(),
  };
}

export interface HistoricalMemoryRecord extends LifecycleMemoryRecord {
  readonly status: "historical";
  readonly supersededByMemoryId?: string;
  readonly historicalReason: string;
}

export function markLifecycleMemoryHistorical(
  record: LifecycleMemoryRecord,
  reason: string,
  supersededByMemoryId?: string,
): HistoricalMemoryRecord {
  assertText(reason, "Historical record reason is required.");

  return {
    ...record,
    approval: {
      ...record.approval,
      status: "historical",
    },
    status: "historical",
    historicalReason: reason.trim(),
    supersededByMemoryId: cleanOptional(supersededByMemoryId),
  };
}

export const EDGE_TYPE_NAMES = [
  "derives_from",
  "approves",
  "mitigates",
  "blocks",
  "verifies",
  "supersedes",
  "relates_to",
] as const;

export type EdgeTypeName = (typeof EDGE_TYPE_NAMES)[number];

export interface EdgeType {
  readonly name: EdgeTypeName;
  readonly direction: "outbound";
  readonly meaning: string;
}

export const EDGE_TYPES: readonly EdgeType[] = [
  {
    name: "derives_from",
    direction: "outbound",
    meaning: "Source memory was derived from the target memory.",
  },
  {
    name: "approves",
    direction: "outbound",
    meaning: "Source memory approves or records approval for target memory.",
  },
  {
    name: "mitigates",
    direction: "outbound",
    meaning: "Source memory mitigates a risk or blocker represented by target memory.",
  },
  {
    name: "blocks",
    direction: "outbound",
    meaning: "Source memory blocks target memory or downstream work.",
  },
  {
    name: "verifies",
    direction: "outbound",
    meaning: "Source memory verifies target memory or implementation evidence.",
  },
  {
    name: "supersedes",
    direction: "outbound",
    meaning: "Source memory replaces target memory while preserving history.",
  },
  {
    name: "relates_to",
    direction: "outbound",
    meaning: "Source memory has a traceable lifecycle relationship to target memory.",
  },
] as const;

const EDGE_BY_NAME = new Map(EDGE_TYPES.map((edgeType) => [edgeType.name, edgeType]));

export function requireEdgeType(name: string): EdgeType {
  const edgeType = EDGE_BY_NAME.get(name as EdgeTypeName);
  if (!edgeType) {
    throw new LifecycleMemoryValidationError(
      `Unknown lifecycle edge type: ${name}`,
    );
  }

  return edgeType;
}

export interface LifecycleEdge {
  readonly id: string;
  readonly sourceMemoryId: string;
  readonly targetMemoryId: string;
  readonly edgeType: EdgeType;
  readonly rationale: ClassificationRationale;
}

export interface CreateLifecycleEdgeInput {
  readonly sourceMemoryId: string;
  readonly targetMemoryId: string;
  readonly edgeType: EdgeTypeName;
  readonly rationale: ClassificationRationale;
}

export function createLifecycleEdge(input: CreateLifecycleEdgeInput): LifecycleEdge {
  assertText(input.sourceMemoryId, "Lifecycle edge source memory ID is required.");
  assertText(input.targetMemoryId, "Lifecycle edge target memory ID is required.");

  if (input.sourceMemoryId.trim() === input.targetMemoryId.trim()) {
    throw new LifecycleMemoryValidationError(
      "Lifecycle edge source and target must be different memories.",
    );
  }

  const edgeType = requireEdgeType(input.edgeType);

  return {
    id: edgeIdFor(input.sourceMemoryId, input.targetMemoryId, input.edgeType),
    sourceMemoryId: input.sourceMemoryId.trim(),
    targetMemoryId: input.targetMemoryId.trim(),
    edgeType,
    rationale: input.rationale,
  };
}

export type DomainEventType =
  | "LifecycleArtifactClassified"
  | "LifecycleMemoryApproved"
  | "LifecycleMemoryMarkedHistorical"
  | "LifecycleRelationshipRecorded"
  | "ArtifactClassificationSuperseded";

export interface DomainEvent {
  readonly type: DomainEventType;
  readonly memoryId?: string;
  readonly sourcePath?: string;
  readonly occurredAt: string;
  readonly detail: string;
}

export type HistoricalChangeAction =
  | "preserve_current"
  | "require_addendum"
  | "create_supersession"
  | "supersede_draft_classification";

export interface HistoricalChangeEvaluation {
  readonly action: HistoricalChangeAction;
  readonly events: readonly DomainEvent[];
}

export interface EvaluateHistoricalChangeInput {
  readonly existingRecord: LifecycleMemoryRecord;
  readonly newObservedVersion: string;
  readonly hasApprovalEvidence: boolean;
  readonly occurredAt: string;
  readonly detail: string;
}

export function evaluateHistoricalChange(
  input: EvaluateHistoricalChangeInput,
): HistoricalChangeEvaluation {
  assertText(input.newObservedVersion, "New observed version is required.");
  assertText(input.occurredAt, "Historical change timestamp is required.");
  assertText(input.detail, "Historical change detail is required.");

  if (input.existingRecord.source.observedVersion === input.newObservedVersion) {
    return { action: "preserve_current", events: [] };
  }

  if (input.existingRecord.approval.status !== "approved") {
    return {
      action: "supersede_draft_classification",
      events: [
        eventFor(
          "ArtifactClassificationSuperseded",
          input.existingRecord,
          input.occurredAt,
          input.detail,
        ),
      ],
    };
  }

  if (!input.hasApprovalEvidence) {
    return {
      action: "require_addendum",
      events: [
        eventFor(
          "LifecycleMemoryMarkedHistorical",
          input.existingRecord,
          input.occurredAt,
          "Approved memory changed without approval evidence; create an addendum before replacing it.",
        ),
      ],
    };
  }

  return {
    action: "create_supersession",
    events: [
      eventFor(
        "LifecycleMemoryMarkedHistorical",
        input.existingRecord,
        input.occurredAt,
        input.detail,
      ),
      eventFor(
        "ArtifactClassificationSuperseded",
        input.existingRecord,
        input.occurredAt,
        input.detail,
      ),
    ],
  };
}

export interface LifecycleMemoryRepository {
  findBySource(source: ArtifactSource): Promise<LifecycleMemoryRecord | undefined>;
  findApprovedByCategory(
    category: MemoryCategoryName,
  ): Promise<readonly LifecycleMemoryRecord[]>;
  saveLifecycleMemory(record: LifecycleMemoryRecord): Promise<void>;
  markHistorical(memoryId: string, reason: string): Promise<void>;
  findTemplateClassifications(): Promise<readonly ArtifactClassification[]>;
}

export interface ArtifactClassificationRepository {
  findCurrentClassificationForSource(
    source: ArtifactSource,
  ): Promise<ArtifactClassification | undefined>;
  saveClassification(classification: ArtifactClassification): Promise<void>;
  supersedeClassification(classificationId: string): Promise<void>;
}

export interface LifecycleRelationshipRepository {
  findRelatedMemories(memoryId: string): Promise<readonly LifecycleEdge[]>;
  saveRelationshipSet(edges: readonly LifecycleEdge[]): Promise<void>;
  removeStaleRelationshipsForSource(source: ArtifactSource): Promise<void>;
}

interface CategoryRuleMatch {
  readonly primaryCategory: MemoryCategoryName;
  readonly secondaryCategories: readonly MemoryCategoryName[];
  readonly ruleName: string;
  readonly confidence: number;
}

function matchCategoryRule(
  lowerPath: string,
  lowerType: string,
): CategoryRuleMatch | undefined {
  if (lowerPath.includes("/01-intent-clarification/") || lowerType.includes("intent")) {
    return rule("IntentMemory", [], "path:intent-clarification");
  }

  if (lowerPath.includes("/02-user-stories/") || lowerType.includes("user-story")) {
    return rule("UserStoryMemory", [], "path:user-stories");
  }

  if (lowerPath.includes("/03-nfrs/") || lowerType.includes("nfr")) {
    return rule("NfrMemory", [], "path:nfrs");
  }

  if (lowerPath.includes("/04-risks/") || lowerType.includes("risk")) {
    return rule("RiskMemory", [], "path:risks");
  }

  if (lowerPath.includes("/05-units/") || lowerType.includes("unit")) {
    return rule("UnitMemory", [], "path:units");
  }

  if (lowerPath.includes("/06-bolts/") || lowerType.includes("bolt")) {
    return rule("BoltMemory", [], "path:bolts");
  }

  if (lowerPath.includes("technology_decisions") || lowerType.includes("decision")) {
    return rule("DecisionMemory", [], "path:decision-artifact");
  }

  if (lowerPath.includes("system_architecture") || lowerType.includes("architecture")) {
    return rule("DecisionMemory", ["PlanMemory"], "path:architecture-artifact");
  }

  if (
    lowerPath.includes("/99-plans/") ||
    lowerPath.includes("/02-design-plan/") ||
    lowerPath.endsWith("_plan.md") ||
    lowerType.includes("plan")
  ) {
    return rule("PlanMemory", ["ApprovalGateMemory"], "path:plan-artifact");
  }

  if (lowerPath.includes("/session-logs/") || lowerType.includes("session")) {
    return rule("SessionHandoffMemory", [], "path:session-log");
  }

  if (
    lowerPath.includes("/04-code-generation/") ||
    lowerPath.includes("test_results") ||
    lowerPath.includes("setup_validation") ||
    lowerType.includes("verification")
  ) {
    return rule("VerificationMemory", [], "path:verification-artifact");
  }

  if (lowerPath.includes("open-question") || lowerType.includes("open-question")) {
    return rule("OpenQuestionMemory", [], "path:open-question");
  }

  return undefined;
}

function rule(
  primaryCategory: MemoryCategoryName,
  secondaryCategories: readonly MemoryCategoryName[],
  ruleName: string,
): CategoryRuleMatch {
  return {
    primaryCategory,
    secondaryCategories,
    ruleName,
    confidence: 0.95,
  };
}

function validateSecondaryCategories(
  primaryCategory: MemoryCategoryName,
  secondaryCategoryNames: readonly MemoryCategoryName[],
): readonly MemoryCategory[] {
  const unique = [...new Set(secondaryCategoryNames)];
  if (unique.includes(primaryCategory)) {
    throw new LifecycleMemoryValidationError(
      "Secondary categories cannot duplicate the primary category.",
    );
  }

  return unique.map((categoryName) => requireMemoryCategory(categoryName));
}

function classificationIdFor(
  source: ArtifactSource,
  category: MemoryCategoryName,
): string {
  return `classification:${encodeStable(source.workspacePath)}:${encodeStable(
    source.observedVersion,
  )}:${category}`;
}

function memoryIdFor(source: ArtifactSource, category: MemoryCategoryName): string {
  return `memory:${encodeStable(source.workspacePath)}:${encodeStable(
    source.observedVersion,
  )}:${category}`;
}

function edgeIdFor(
  sourceMemoryId: string,
  targetMemoryId: string,
  edgeType: EdgeTypeName,
): string {
  return `edge:${encodeStable(sourceMemoryId)}:${edgeType}:${encodeStable(targetMemoryId)}`;
}

function eventFor(
  type: DomainEventType,
  record: LifecycleMemoryRecord,
  occurredAt: string,
  detail: string,
): DomainEvent {
  return {
    type,
    memoryId: record.id,
    sourcePath: record.source.workspacePath,
    occurredAt,
    detail,
  };
}

function inferArtifactType(path: string): string {
  const lowerPath = path.toLowerCase();
  if (lowerPath.includes("/01-intent-clarification/")) return "intent";
  if (lowerPath.includes("/02-user-stories/")) return "user-story";
  if (lowerPath.includes("/03-nfrs/")) return "nfr";
  if (lowerPath.includes("/04-risks/")) return "risk";
  if (lowerPath.includes("/05-units/")) return "unit";
  if (lowerPath.includes("/06-bolts/")) return "bolt";
  if (lowerPath.includes("/99-plans/") || lowerPath.includes("_plan")) return "plan";
  if (lowerPath.includes("technology_decisions")) return "decision";
  if (lowerPath.includes("system_architecture")) return "architecture";
  if (lowerPath.includes("/session-logs/")) return "session-log";
  if (lowerPath.includes("test_results") || lowerPath.includes("setup_validation")) {
    return "verification";
  }

  return "unknown";
}

function isTemplateSourcePath(path: string): boolean {
  const lowerPath = normalizeWorkspacePath(path).toLowerCase();
  return (
    lowerPath.startsWith("src/docs/") ||
    lowerPath.includes("_template.") ||
    lowerPath.endsWith("_template.md") ||
    lowerPath.includes("/templates/")
  );
}

function normalizeWorkspacePath(path: string): string {
  return path.trim().replaceAll("\\", "/").replace(/^\.\//, "");
}

function encodeStable(value: string): string {
  return encodeURIComponent(value.trim().replaceAll("\\", "/"));
}

function assertText(value: string | undefined, message: string): asserts value is string {
  if (!hasText(value)) {
    throw new LifecycleMemoryValidationError(message);
  }
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanOptional(value: string | undefined): string | undefined {
  return hasText(value) ? value.trim() : undefined;
}
