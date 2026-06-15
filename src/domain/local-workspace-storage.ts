import {
  isMemoryCategoryName,
  requireMemoryCategory,
  type ApprovalStatus,
  type LifecyclePhase,
  type MemoryCategoryName,
} from "./lifecycle-memory-core.js";

export class LocalWorkspaceStorageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocalWorkspaceStorageValidationError";
  }
}

export type DurableSourceKind = "lifecycle_artifact" | "memory_event";

export type MemoryVisibility = "private" | "workspace" | "team_shared";

export interface DurableSourceApprovalMetadata {
  readonly status: ApprovalStatus;
  readonly approver?: string;
  readonly decisionDate?: string;
  readonly visibility: MemoryVisibility;
  readonly retentionPolicy: string;
}

export interface CreateDurableSourceApprovalMetadataInput {
  readonly status?: ApprovalStatus;
  readonly approver?: string;
  readonly decisionDate?: string;
  readonly visibility?: MemoryVisibility;
  readonly retentionPolicy?: string;
}

export interface DurableSourceObservation {
  readonly workspacePath: string;
  readonly sourceKind: DurableSourceKind;
  readonly artifactType?: string;
  readonly observedVersion: string;
  readonly observedAt: string;
  readonly content: string;
  readonly isTemplate: boolean;
  readonly approval: DurableSourceApprovalMetadata;
}

export interface CreateDurableSourceObservationInput {
  readonly workspacePath: string;
  readonly sourceKind?: DurableSourceKind;
  readonly artifactType?: string;
  readonly observedVersion: string;
  readonly observedAt: string;
  readonly content: string;
  readonly isTemplate?: boolean;
  readonly approval?: CreateDurableSourceApprovalMetadataInput;
}

export function createDurableSourceApprovalMetadata(
  input: CreateDurableSourceApprovalMetadataInput = {},
): DurableSourceApprovalMetadata {
  return {
    status: input.status ?? "draft",
    approver: cleanOptional(input.approver),
    decisionDate: cleanOptional(input.decisionDate),
    visibility: input.visibility ?? "workspace",
    retentionPolicy: cleanOptional(input.retentionPolicy) ?? "approved-lifecycle-memory",
  };
}

export function createDurableSourceObservation(
  input: CreateDurableSourceObservationInput,
): DurableSourceObservation {
  const workspacePath = normalizeWorkspacePath(input.workspacePath);
  assertText(workspacePath, "Durable source path is required.");
  assertText(input.observedVersion, "Durable source observed version is required.");
  assertText(input.observedAt, "Durable source observed timestamp is required.");

  return {
    workspacePath,
    sourceKind: input.sourceKind ?? "lifecycle_artifact",
    artifactType: cleanOptional(input.artifactType),
    observedVersion: input.observedVersion.trim(),
    observedAt: input.observedAt.trim(),
    content: input.content,
    isTemplate: input.isTemplate ?? isTemplateSourcePath(workspacePath),
    approval: createDurableSourceApprovalMetadata(input.approval),
  };
}

export interface LocalIndexProjectionRepository {
  resetProjection(): void;
  upsertProjection(record: ProjectedMemoryRecord): void;
  removeProjection(memoryId: string): void;
  findProjection(memoryId: string): ProjectedMemoryRecord | undefined;
  listProjections(): readonly ProjectedMemoryRecord[];
  countProjections(): number;
  search(request: LocalMemorySearchRequest): readonly LocalMemorySearchResult[];
}

export interface ProjectedMemoryRecord {
  readonly memoryId: string;
  readonly workspacePath: string;
  readonly category: MemoryCategoryName;
  readonly phase: LifecyclePhase;
  readonly approvalStatus: ApprovalStatus;
  readonly visibility: MemoryVisibility;
  readonly retentionPolicy: string;
  readonly observedVersion: string;
  readonly observedAt: string;
  readonly sourceKind: DurableSourceKind;
  readonly isTemplate: boolean;
  readonly text: string;
  readonly lastProjectedAt: string;
}

export interface CreateProjectedMemoryRecordInput {
  readonly memoryId: string;
  readonly workspacePath: string;
  readonly category: MemoryCategoryName;
  readonly approvalStatus: ApprovalStatus;
  readonly visibility?: MemoryVisibility;
  readonly retentionPolicy?: string;
  readonly observedVersion: string;
  readonly observedAt: string;
  readonly sourceKind: DurableSourceKind;
  readonly isTemplate?: boolean;
  readonly text: string;
  readonly lastProjectedAt: string;
}

export function createProjectedMemoryRecord(
  input: CreateProjectedMemoryRecordInput,
): ProjectedMemoryRecord {
  assertText(input.memoryId, "Projected memory ID is required.");
  assertText(input.workspacePath, "Projected source path is required.");
  const category = requireMemoryCategory(input.category);
  assertText(input.observedVersion, "Projected source version is required.");
  assertText(input.observedAt, "Projected observed timestamp is required.");
  assertText(input.text, "Projected searchable text is required.");
  assertText(input.lastProjectedAt, "Projected timestamp is required.");

  return {
    memoryId: input.memoryId.trim(),
    workspacePath: normalizeWorkspacePath(input.workspacePath),
    category: category.name,
    phase: category.phase,
    approvalStatus: input.approvalStatus,
    visibility: input.visibility ?? "workspace",
    retentionPolicy: cleanOptional(input.retentionPolicy) ?? "approved-lifecycle-memory",
    observedVersion: input.observedVersion.trim(),
    observedAt: input.observedAt.trim(),
    sourceKind: input.sourceKind,
    isTemplate: input.isTemplate ?? isTemplateSourcePath(input.workspacePath),
    text: input.text.trim(),
    lastProjectedAt: input.lastProjectedAt.trim(),
  };
}

export type RebuildRunStatus =
  | "started"
  | "completed"
  | "completed_with_warnings"
  | "failed";

export type RebuildChangeAction =
  | "created"
  | "updated"
  | "removed"
  | "unchanged"
  | "conflicted";

export interface RebuildWarning {
  readonly sourcePath?: string;
  readonly message: string;
}

export interface RebuildChange {
  readonly memoryId: string;
  readonly sourcePath: string;
  readonly action: RebuildChangeAction;
  readonly detail: string;
}

export interface CreateRebuildChangeInput {
  readonly memoryId: string;
  readonly sourcePath: string;
  readonly action: RebuildChangeAction;
  readonly detail: string;
}

export interface RebuildOutcome {
  readonly status: RebuildRunStatus;
  readonly createdCount: number;
  readonly updatedCount: number;
  readonly removedCount: number;
  readonly unchangedCount: number;
  readonly conflictedCount: number;
  readonly warningCount: number;
}

export interface RebuildRun {
  readonly rebuildId: string;
  readonly workspaceId: string;
  readonly requestedBy: string;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly sourceCount: number;
  readonly eventCount: number;
  readonly changes: readonly RebuildChange[];
  readonly warnings: readonly RebuildWarning[];
  readonly outcome?: RebuildOutcome;
}

export interface CreateRebuildRunInput {
  readonly rebuildId: string;
  readonly workspaceId: string;
  readonly requestedBy: string;
  readonly startedAt: string;
  readonly sourceCount?: number;
  readonly eventCount?: number;
}

export interface CompleteRebuildRunInput {
  readonly completedAt: string;
  readonly changes: readonly RebuildChange[];
  readonly warnings?: readonly RebuildWarning[];
  readonly failed?: boolean;
}

export function createRebuildChange(
  input: CreateRebuildChangeInput,
): RebuildChange {
  assertText(input.memoryId, "Rebuild change memory ID is required.");
  assertText(input.sourcePath, "Rebuild change source path is required.");
  assertText(input.detail, "Rebuild change detail is required.");

  return {
    memoryId: input.memoryId.trim(),
    sourcePath: normalizeWorkspacePath(input.sourcePath),
    action: input.action,
    detail: input.detail.trim(),
  };
}

export function createRebuildRun(input: CreateRebuildRunInput): RebuildRun {
  assertText(input.rebuildId, "Rebuild run ID is required.");
  assertText(input.workspaceId, "Rebuild workspace ID is required.");
  assertText(input.requestedBy, "Rebuild requested actor is required.");
  assertText(input.startedAt, "Rebuild start timestamp is required.");

  return {
    rebuildId: input.rebuildId.trim(),
    workspaceId: input.workspaceId.trim(),
    requestedBy: input.requestedBy.trim(),
    startedAt: input.startedAt.trim(),
    sourceCount: input.sourceCount ?? 0,
    eventCount: input.eventCount ?? 0,
    changes: [],
    warnings: [],
  };
}

export function completeRebuildRun(
  run: RebuildRun,
  input: CompleteRebuildRunInput,
): RebuildRun {
  assertText(input.completedAt, "Rebuild completion timestamp is required.");

  const warnings = [...(input.warnings ?? [])];
  const outcome = summarizeRebuildOutcome(input.changes, warnings, input.failed ?? false);

  return {
    ...run,
    completedAt: input.completedAt.trim(),
    changes: [...input.changes],
    warnings,
    outcome,
  };
}

export function summarizeRebuildOutcome(
  changes: readonly RebuildChange[],
  warnings: readonly RebuildWarning[] = [],
  failed = false,
): RebuildOutcome {
  const countByAction = (action: RebuildChangeAction): number =>
    changes.filter((change) => change.action === action).length;

  const conflictedCount = countByAction("conflicted");
  const warningCount = warnings.length;
  const status: RebuildRunStatus = failed
    ? "failed"
    : conflictedCount > 0 || warningCount > 0
      ? "completed_with_warnings"
      : "completed";

  return {
    status,
    createdCount: countByAction("created"),
    updatedCount: countByAction("updated"),
    removedCount: countByAction("removed"),
    unchangedCount: countByAction("unchanged"),
    conflictedCount,
    warningCount,
  };
}

export interface DurableSourceReader {
  scanSources(workspaceRoot: string): Promise<readonly DurableSourceObservation[]>;
  readSource(workspacePath: string): Promise<DurableSourceObservation>;
}

export interface MemoryEventLogReader {
  readEvents(workspaceRoot: string): Promise<readonly MemoryEventRecord[]>;
}

export const MEMORY_EVENT_TYPES = ["memory_indexed", "memory_removed"] as const;

export type MemoryEventType = (typeof MEMORY_EVENT_TYPES)[number];

export interface MemoryEventRecord {
  readonly eventId: string;
  readonly eventType: MemoryEventType;
  readonly workspaceId: string;
  readonly occurredAt: string;
  readonly actor: string;
  readonly sourcePath: string;
  readonly memoryId?: string;
  readonly category?: MemoryCategoryName;
  readonly approvalStatus?: ApprovalStatus;
  readonly visibility?: MemoryVisibility;
  readonly retentionPolicy?: string;
  readonly observedVersion?: string;
  readonly text?: string;
  readonly reason?: string;
}

export interface CreateMemoryEventRecordInput {
  readonly eventId: string;
  readonly eventType: MemoryEventType;
  readonly workspaceId: string;
  readonly occurredAt: string;
  readonly actor: string;
  readonly sourcePath: string;
  readonly memoryId?: string;
  readonly category?: string;
  readonly approvalStatus?: ApprovalStatus;
  readonly visibility?: MemoryVisibility;
  readonly retentionPolicy?: string;
  readonly observedVersion?: string;
  readonly text?: string;
  readonly reason?: string;
}

export function createMemoryEventRecord(
  input: CreateMemoryEventRecordInput,
): MemoryEventRecord {
  assertText(input.eventId, "Memory event ID is required.");
  assertMemoryEventType(input.eventType);
  assertText(input.workspaceId, "Memory event workspace ID is required.");
  assertText(input.occurredAt, "Memory event timestamp is required.");
  assertText(input.actor, "Memory event actor is required.");

  const sourcePath = normalizeWorkspacePath(input.sourcePath);
  assertText(sourcePath, "Memory event source path is required.");

  const category = cleanOptional(input.category);
  if (category && !isMemoryCategoryName(category)) {
    throw new LocalWorkspaceStorageValidationError(
      `Unknown memory event category: ${category}`,
    );
  }

  if (input.eventType === "memory_indexed") {
    assertText(category, "Indexed memory event requires category.");
    assertText(
      input.observedVersion,
      "Indexed memory event requires observed source version.",
    );
    assertText(input.text, "Indexed memory event requires text.");
  }

  if (input.eventType === "memory_removed" && !hasText(input.memoryId)) {
    assertText(input.reason, "Removed memory event requires reason without memory ID.");
  }

  return {
    eventId: input.eventId.trim(),
    eventType: input.eventType,
    workspaceId: input.workspaceId.trim(),
    occurredAt: input.occurredAt.trim(),
    actor: input.actor.trim(),
    sourcePath,
    memoryId: cleanOptional(input.memoryId),
    category: category as MemoryCategoryName | undefined,
    approvalStatus: input.approvalStatus,
    visibility: input.visibility,
    retentionPolicy: cleanOptional(input.retentionPolicy),
    observedVersion: cleanOptional(input.observedVersion),
    text: cleanOptional(input.text),
    reason: cleanOptional(input.reason),
  };
}

export function serializeMemoryEventRecord(event: MemoryEventRecord): string {
  return JSON.stringify(event);
}

export function parseMemoryEventJsonl(jsonl: string): readonly MemoryEventRecord[] {
  return jsonl
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => {
      try {
        return createMemoryEventRecord(JSON.parse(line) as CreateMemoryEventRecordInput);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown parse error.";
        throw new LocalWorkspaceStorageValidationError(
          `Invalid memory event JSONL line ${index + 1}: ${message}`,
        );
      }
    });
}

function assertMemoryEventType(value: string): asserts value is MemoryEventType {
  if (!MEMORY_EVENT_TYPES.includes(value as MemoryEventType)) {
    throw new LocalWorkspaceStorageValidationError(
      `Unknown memory event type: ${value}`,
    );
  }
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

function assertText(value: string | undefined, message: string): asserts value is string {
  if (!hasText(value)) {
    throw new LocalWorkspaceStorageValidationError(message);
  }
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanOptional(value: string | undefined): string | undefined {
  return hasText(value) ? value.trim() : undefined;
}

export interface LocalMemorySearchRequest {
  readonly query?: string;
  readonly workspacePath?: string;
  readonly category?: MemoryCategoryName;
  readonly phase?: LifecyclePhase;
  readonly approvalStatus?: ApprovalStatus;
  readonly limit?: number;
}

export interface LocalMemorySearchResult {
  readonly record: ProjectedMemoryRecord;
  readonly score: number;
  readonly matchedSignals: readonly string[];
}