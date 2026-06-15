import { DatabaseSync } from "node:sqlite";

import {
  classifyArtifactSource,
  createApprovalState,
  createArtifactSource,
  createLifecycleMemoryRecord,
} from "../domain/lifecycle-memory-core.js";
import {
  completeRebuildRun,
  createProjectedMemoryRecord,
  createRebuildChange,
  createRebuildRun,
  type DurableSourceObservation,
  type LocalIndexProjectionRepository,
  type LocalMemorySearchRequest,
  type LocalMemorySearchResult,
  type MemoryEventRecord,
  type ProjectedMemoryRecord,
  type RebuildChange,
  type RebuildRun,
  type RebuildWarning,
} from "../domain/local-workspace-storage.js";

export interface RebuildWorkspaceIndexInput {
  readonly rebuildId: string;
  readonly workspaceId: string;
  readonly requestedBy: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly sources: readonly DurableSourceObservation[];
  readonly events?: readonly MemoryEventRecord[];
}

export class WorkspaceIndexRebuilder {
  constructor(private readonly projection: LocalIndexProjectionRepository) {}

  rebuild(input: RebuildWorkspaceIndexInput): RebuildRun {
    const run = createRebuildRun({
      rebuildId: input.rebuildId,
      workspaceId: input.workspaceId,
      requestedBy: input.requestedBy,
      startedAt: input.startedAt,
      sourceCount: input.sources.length,
      eventCount: input.events?.length ?? 0,
    });
    const previousRecords = new Map(
      this.projection.listProjections().map((record) => [record.memoryId, record]),
    );
    const nextRecords = new Map<string, ProjectedMemoryRecord>();
    const warnings: RebuildWarning[] = [];

    for (const source of input.sources) {
      const projected = projectDurableSource(source, input.completedAt, warnings);
      if (projected) {
        nextRecords.set(projected.memoryId, projected);
      }
    }

    for (const event of input.events ?? []) {
      applyMemoryEvent(event, input.completedAt, nextRecords, warnings);
    }

    const changes = summarizeProjectionChanges(previousRecords, nextRecords);

    this.projection.resetProjection();
    for (const record of nextRecords.values()) {
      this.projection.upsertProjection(record);
    }

    return completeRebuildRun(run, {
      completedAt: input.completedAt,
      changes,
      warnings,
    });
  }
}

export class LocalWorkspaceIndexProjection implements LocalIndexProjectionRepository {
  private readonly database: DatabaseSync;

  constructor(databasePath = ":memory:") {
    this.database = new DatabaseSync(databasePath);
    this.initialize();
  }

  close(): void {
    this.database.close();
  }

  resetProjection(): void {
    this.database.exec("DELETE FROM memory_projection");
  }

  upsertProjection(record: ProjectedMemoryRecord): void {
    this.database
      .prepare(
        `INSERT INTO memory_projection (
          memory_id,
          workspace_path,
          category,
          phase,
          approval_status,
          visibility,
          retention_policy,
          observed_version,
          observed_at,
          source_kind,
          is_template,
          text,
          lower_text,
          last_projected_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(memory_id) DO UPDATE SET
          workspace_path = excluded.workspace_path,
          category = excluded.category,
          phase = excluded.phase,
          approval_status = excluded.approval_status,
          visibility = excluded.visibility,
          retention_policy = excluded.retention_policy,
          observed_version = excluded.observed_version,
          observed_at = excluded.observed_at,
          source_kind = excluded.source_kind,
          is_template = excluded.is_template,
          text = excluded.text,
          lower_text = excluded.lower_text,
          last_projected_at = excluded.last_projected_at`,
      )
      .run(
        record.memoryId,
        record.workspacePath,
        record.category,
        record.phase,
        record.approvalStatus,
        record.visibility,
        record.retentionPolicy,
        record.observedVersion,
        record.observedAt,
        record.sourceKind,
        record.isTemplate ? 1 : 0,
        record.text,
        searchableText(record),
        record.lastProjectedAt,
      );
  }

  removeProjection(memoryId: string): void {
    this.database.prepare("DELETE FROM memory_projection WHERE memory_id = ?").run(memoryId);
  }

  findProjection(memoryId: string): ProjectedMemoryRecord | undefined {
    const row = this.database
      .prepare("SELECT * FROM memory_projection WHERE memory_id = ?")
      .get(memoryId) as ProjectionRow | undefined;

    return row ? rowToProjection(row) : undefined;
  }

  listProjections(): readonly ProjectedMemoryRecord[] {
    const rows = this.database
      .prepare("SELECT * FROM memory_projection ORDER BY workspace_path, memory_id")
      .all() as unknown as ProjectionRow[];

    return rows.map((row) => rowToProjection(row));
  }

  countProjections(): number {
    const row = this.database
      .prepare("SELECT COUNT(*) AS count FROM memory_projection")
      .get() as { count: number } | undefined;

    return row?.count ?? 0;
  }

  search(request: LocalMemorySearchRequest): readonly LocalMemorySearchResult[] {
    const limit = Math.max(1, request.limit ?? 20);
    return this.listProjections()
      .map((record) => scoreProjection(record, request))
      .filter((result) => result.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.record.workspacePath.localeCompare(right.record.workspacePath);
      })
      .slice(0, limit);
  }

  private initialize(): void {
    this.database.exec(`CREATE TABLE IF NOT EXISTS memory_projection (
      memory_id TEXT PRIMARY KEY,
      workspace_path TEXT NOT NULL,
      category TEXT NOT NULL,
      phase TEXT NOT NULL,
      approval_status TEXT NOT NULL,
      visibility TEXT NOT NULL,
      retention_policy TEXT NOT NULL,
      observed_version TEXT NOT NULL,
      observed_at TEXT NOT NULL,
      source_kind TEXT NOT NULL,
      is_template INTEGER NOT NULL,
      text TEXT NOT NULL,
      lower_text TEXT NOT NULL,
      last_projected_at TEXT NOT NULL
    )`);

    this.database.exec(
      "CREATE INDEX IF NOT EXISTS idx_memory_projection_path ON memory_projection(workspace_path)",
    );
    this.database.exec(
      "CREATE INDEX IF NOT EXISTS idx_memory_projection_category ON memory_projection(category)",
    );
    this.database.exec(
      "CREATE INDEX IF NOT EXISTS idx_memory_projection_approval ON memory_projection(approval_status)",
    );
  }
}

interface ProjectionRow {
  readonly memory_id: string;
  readonly workspace_path: string;
  readonly category: ProjectedMemoryRecord["category"];
  readonly phase: ProjectedMemoryRecord["phase"];
  readonly approval_status: ProjectedMemoryRecord["approvalStatus"];
  readonly visibility: ProjectedMemoryRecord["visibility"];
  readonly retention_policy: string;
  readonly observed_version: string;
  readonly observed_at: string;
  readonly source_kind: ProjectedMemoryRecord["sourceKind"];
  readonly is_template: number;
  readonly text: string;
  readonly last_projected_at: string;
}

function rowToProjection(row: ProjectionRow): ProjectedMemoryRecord {
  return {
    memoryId: row.memory_id,
    workspacePath: row.workspace_path,
    category: row.category,
    phase: row.phase,
    approvalStatus: row.approval_status,
    visibility: row.visibility,
    retentionPolicy: row.retention_policy,
    observedVersion: row.observed_version,
    observedAt: row.observed_at,
    sourceKind: row.source_kind,
    isTemplate: row.is_template === 1,
    text: row.text,
    lastProjectedAt: row.last_projected_at,
  };
}

function searchableText(record: ProjectedMemoryRecord): string {
  return [
    record.workspacePath,
    record.category,
    record.phase,
    record.approvalStatus,
    record.visibility,
    record.text,
  ]
    .join("\n")
    .toLowerCase();
}

function scoreProjection(
  record: ProjectedMemoryRecord,
  request: LocalMemorySearchRequest,
): LocalMemorySearchResult {
  let score = 0;
  const matchedSignals: string[] = [];
  const lowerSearchableText = searchableText(record);

  if (request.workspacePath) {
    const requestedPath = request.workspacePath.trim().toLowerCase().replaceAll("\\", "/");
    const recordPath = record.workspacePath.toLowerCase();
    if (recordPath === requestedPath) {
      score += 100;
      matchedSignals.push("exact-path");
    } else if (recordPath.includes(requestedPath) || requestedPath.includes(recordPath)) {
      score += 45;
      matchedSignals.push("path-fragment");
    } else {
      return { record, score: 0, matchedSignals: [] };
    }
  }

  if (request.category) {
    if (record.category !== request.category) {
      return { record, score: 0, matchedSignals: [] };
    }
    score += 40;
    matchedSignals.push("category");
  }

  if (request.phase) {
    if (record.phase !== request.phase) {
      return { record, score: 0, matchedSignals: [] };
    }
    score += 25;
    matchedSignals.push("phase");
  }

  if (request.approvalStatus) {
    if (record.approvalStatus !== request.approvalStatus) {
      return { record, score: 0, matchedSignals: [] };
    }
    score += 20;
    matchedSignals.push("approval-status");
  }

  for (const term of searchTerms(request.query)) {
    if (record.workspacePath.toLowerCase().includes(term)) {
      score += 30;
      matchedSignals.push(`query-path:${term}`);
      continue;
    }

    if (record.category.toLowerCase().includes(term) || record.phase.includes(term)) {
      score += 20;
      matchedSignals.push(`query-metadata:${term}`);
      continue;
    }

    if (lowerSearchableText.includes(term)) {
      score += 10;
      matchedSignals.push(`query-text:${term}`);
    }
  }

  if (record.approvalStatus === "approved") {
    score += 3;
    matchedSignals.push("approved-boost");
  }

  if (!request.query && !request.workspacePath && !request.category && !request.phase && !request.approvalStatus) {
    score = 1;
    matchedSignals.push("default-listing");
  }

  return { record, score, matchedSignals };
}

function searchTerms(query: string | undefined): readonly string[] {
  if (!query?.trim()) return [];
  return query
    .toLowerCase()
    .split(/[^a-z0-9_-]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0);
}

function projectDurableSource(
  source: DurableSourceObservation,
  lastProjectedAt: string,
  warnings: RebuildWarning[],
): ProjectedMemoryRecord | undefined {
  try {
    const artifactSource = createArtifactSource({
      workspacePath: source.workspacePath,
      artifactType: source.artifactType,
      observedVersion: source.observedVersion,
      observedAt: source.observedAt,
      isTemplate: source.isTemplate,
    });
    const classification = classifyArtifactSource(artifactSource);
    const approval = createApprovalState({
      status: source.approval.status,
      approver: source.approval.approver,
      decisionDate: source.approval.decisionDate,
    });
    const memory = createLifecycleMemoryRecord({
      source: artifactSource,
      category: classification.primaryCategory,
      secondaryCategories: classification.secondaryCategories,
      approval,
      rationale: classification.rationale,
      createdAt: source.observedAt,
    });

    return createProjectedMemoryRecord({
      memoryId: memory.id,
      workspacePath: source.workspacePath,
      category: memory.category.name,
      approvalStatus: memory.approval.status,
      visibility: source.approval.visibility,
      retentionPolicy: source.approval.retentionPolicy,
      observedVersion: source.observedVersion,
      observedAt: source.observedAt,
      sourceKind: source.sourceKind,
      isTemplate: source.isTemplate,
      text: source.content,
      lastProjectedAt,
    });
  } catch (error) {
    warnings.push({
      sourcePath: source.workspacePath,
      message: error instanceof Error ? error.message : "Unable to project source.",
    });
    return undefined;
  }
}

function applyMemoryEvent(
  event: MemoryEventRecord,
  lastProjectedAt: string,
  nextRecords: Map<string, ProjectedMemoryRecord>,
  warnings: RebuildWarning[],
): void {
  if (event.eventType === "memory_removed") {
    if (event.memoryId) {
      nextRecords.delete(event.memoryId);
      return;
    }

    for (const [memoryId, record] of nextRecords) {
      if (record.workspacePath === event.sourcePath) {
        nextRecords.delete(memoryId);
      }
    }
    return;
  }

  if (!event.category || !event.observedVersion || !event.text) {
    warnings.push({
      sourcePath: event.sourcePath,
      message: `Indexed memory event ${event.eventId} is missing projection data.`,
    });
    return;
  }

  nextRecords.set(
    event.memoryId ?? memoryIdForEvent(event),
    createProjectedMemoryRecord({
      memoryId: event.memoryId ?? memoryIdForEvent(event),
      workspacePath: event.sourcePath,
      category: event.category,
      approvalStatus: event.approvalStatus ?? "approved",
      visibility: event.visibility ?? "workspace",
      retentionPolicy: event.retentionPolicy ?? "approved-lifecycle-memory",
      observedVersion: event.observedVersion,
      observedAt: event.occurredAt,
      sourceKind: "memory_event",
      text: event.text,
      lastProjectedAt,
    }),
  );
}

function summarizeProjectionChanges(
  previousRecords: Map<string, ProjectedMemoryRecord>,
  nextRecords: Map<string, ProjectedMemoryRecord>,
): readonly RebuildChange[] {
  const changes: RebuildChange[] = [];

  for (const [memoryId, next] of nextRecords) {
    const previous = previousRecords.get(memoryId);
    if (!previous) {
      changes.push(
        createRebuildChange({
          memoryId,
          sourcePath: next.workspacePath,
          action: "created",
          detail: "Projection created from durable source or memory event.",
        }),
      );
      continue;
    }

    changes.push(
      createRebuildChange({
        memoryId,
        sourcePath: next.workspacePath,
        action: projectionsMatch(previous, next) ? "unchanged" : "updated",
        detail: projectionsMatch(previous, next)
          ? "Projection matched durable source state."
          : "Projection updated from durable source state.",
      }),
    );
  }

  for (const [memoryId, previous] of previousRecords) {
    if (!nextRecords.has(memoryId)) {
      changes.push(
        createRebuildChange({
          memoryId,
          sourcePath: previous.workspacePath,
          action: "removed",
          detail: "Projection removed because durable source or event no longer replays it.",
        }),
      );
    }
  }

  return changes;
}

function projectionsMatch(
  previous: ProjectedMemoryRecord,
  next: ProjectedMemoryRecord,
): boolean {
  return (
    previous.workspacePath === next.workspacePath &&
    previous.category === next.category &&
    previous.phase === next.phase &&
    previous.approvalStatus === next.approvalStatus &&
    previous.visibility === next.visibility &&
    previous.retentionPolicy === next.retentionPolicy &&
    previous.observedVersion === next.observedVersion &&
    previous.observedAt === next.observedAt &&
    previous.sourceKind === next.sourceKind &&
    previous.isTemplate === next.isTemplate &&
    previous.text === next.text
  );
}

function memoryIdForEvent(event: MemoryEventRecord): string {
  return `event-memory:${encodeURIComponent(event.sourcePath)}:${encodeURIComponent(
    event.observedVersion ?? event.eventId,
  )}:${event.category ?? "unknown"}`;
}