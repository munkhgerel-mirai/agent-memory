import { basename } from "node:path";

import {
  completeRebuildRun,
  createMemoryEventRecord,
  type LocalIndexProjectionRepository,
  type LocalMemorySearchRequest,
  type LocalMemorySearchResult,
  type MemoryEventRecord,
  type ProjectedMemoryRecord,
  type RebuildRun,
  type RebuildWarning,
} from "../domain/local-workspace-storage.js";
import { LocalWorkspaceIndexProjection, WorkspaceIndexRebuilder } from "./local-workspace-index.js";
import { MemoryEventLog } from "./memory-event-log.js";
import { WorkspaceSourceReader, type WorkspaceScanResult } from "./workspace-source-reader.js";
import { ensureWorkspaceLayout, type WorkspaceLayout } from "./workspace-layout.js";

export interface WorkspaceMemoryStoreOptions {
  readonly workspaceRoot: string;
  readonly workspaceId?: string;
  readonly actor?: string;
  readonly now?: () => string;
  readonly reader?: WorkspaceSourceReader;
}

export interface RebuildWorkspaceMemoryInput {
  readonly rebuildId: string;
  readonly requestedBy?: string;
}

export interface WorkspaceMemoryRebuildResult {
  readonly run: RebuildRun;
  readonly scan: WorkspaceScanResult;
  readonly layout: WorkspaceLayout;
  readonly appendedEvents: readonly MemoryEventRecord[];
  readonly replayedEventCount: number;
  readonly supersededEventCount: number;
}

/**
 * Coordinates the three stores that make workspace memory durable.
 *
 * Authority follows the BOLT-09-Q4 decision: for any path the scan currently sees, the Markdown
 * artifact wins outright. Events only speak about paths the scan does not see, which is where
 * they carry information the filesystem cannot express, above all a deliberate removal.
 */
export class WorkspaceMemoryStore {
  private constructor(
    private readonly layoutValue: WorkspaceLayout,
    private readonly projection: LocalWorkspaceIndexProjection,
    private readonly rebuilder: WorkspaceIndexRebuilder,
    private readonly eventLog: MemoryEventLog,
    private readonly reader: WorkspaceSourceReader,
    private readonly workspaceId: string,
    private readonly actor: string,
    private readonly now: () => string,
  ) {}

  static open(options: WorkspaceMemoryStoreOptions): WorkspaceMemoryStore {
    const layout = ensureWorkspaceLayout(options.workspaceRoot);
    const projection = new LocalWorkspaceIndexProjection(layout.indexPath);

    return new WorkspaceMemoryStore(
      layout,
      projection,
      new WorkspaceIndexRebuilder(projection),
      new MemoryEventLog(layout),
      options.reader ?? new WorkspaceSourceReader(),
      options.workspaceId?.trim() || basename(layout.workspaceRoot),
      options.actor?.trim() || "agent-memory",
      options.now ?? (() => new Date().toISOString()),
    );
  }

  get layout(): WorkspaceLayout {
    return this.layoutValue;
  }

  /**
   * Exposed so a surface can hand the persisted projection to the approved Capability Router
   * instead of opening a second connection to the same database file.
   */
  get projectionRepository(): LocalIndexProjectionRepository {
    return this.projection;
  }

  rebuild(input: RebuildWorkspaceMemoryInput): WorkspaceMemoryRebuildResult {
    const startedAt = this.now();
    const scan = this.reader.scan(this.layoutValue.workspaceRoot);
    const logRead = this.eventLog.read();

    const scannedPaths = new Set(scan.observations.map((observation) => observation.workspacePath));
    const replayed = logRead.events.filter(
      (event) => event.eventType === "memory_deleted" || !scannedPaths.has(event.sourcePath),
    );
    const superseded = logRead.events.length - replayed.length;

    const completedAt = this.now();
    const rebuilt = this.rebuilder.rebuild({
      rebuildId: input.rebuildId,
      workspaceId: this.workspaceId,
      requestedBy: input.requestedBy?.trim() || this.actor,
      startedAt,
      completedAt,
      sources: scan.observations,
      events: replayed,
    });

    // Event-log warnings must reach the run, because `summarizeRebuildOutcome` downgrades a
    // run with any warning to `completed_with_warnings`. A rebuild that skipped a malformed
    // line must never report a clean `completed`.
    const warnings: RebuildWarning[] = [
      ...logRead.warnings,
      ...scanWarnings(scan),
      ...rebuilt.warnings,
    ];
    const run = completeRebuildRun(rebuilt, {
      completedAt,
      changes: rebuilt.changes,
      warnings,
    });

    const appendedEvents = this.recordRemovals(run, completedAt);

    return {
      run,
      scan,
      layout: this.layoutValue,
      appendedEvents,
      replayedEventCount: replayed.length,
      supersededEventCount: superseded,
    };
  }

  search(request: LocalMemorySearchRequest): readonly LocalMemorySearchResult[] {
    return this.projection.search(request);
  }

  listProjections(): readonly ProjectedMemoryRecord[] {
    return this.projection.listProjections();
  }

  countProjections(): number {
    return this.projection.countProjections();
  }

  readEventLog(): readonly MemoryEventRecord[] {
    return this.eventLog.read().events;
  }

  recordDeletionTombstones(
    records: readonly ProjectedMemoryRecord[],
    operationId: string,
    reason: string,
  ): readonly MemoryEventRecord[] {
    const occurredAt = this.now();
    const events = records.map((record) =>
      createMemoryEventRecord({
        eventId: `${operationId}:deleted:${record.memoryId}`,
        eventType: "memory_deleted",
        workspaceId: this.workspaceId,
        occurredAt,
        actor: this.actor,
        sourcePath: record.workspacePath,
        memoryId: record.memoryId,
        reason,
      }),
    );

    this.eventLog.append(events);
    return events;
  }

  removeProjection(memoryId: string): void {
    this.projection.removeProjection(memoryId);
  }

  close(): void {
    this.projection.close();
  }

  /**
   * Appends one `memory_removed` event per projection that disappeared. Nothing else is
   * appended: writing a `memory_indexed` event for an ordinary artifact would let a later
   * rebuild replay it after the file was deleted, resurrecting memory the filesystem no
   * longer backs.
   */
  private recordRemovals(run: RebuildRun, occurredAt: string): readonly MemoryEventRecord[] {
    const events = run.changes
      .filter((change) => change.action === "removed")
      .map((change) =>
        createMemoryEventRecord({
          eventId: `${run.rebuildId}:removed:${change.memoryId}`,
          eventType: "memory_removed",
          workspaceId: this.workspaceId,
          occurredAt,
          actor: this.actor,
          sourcePath: change.sourcePath,
          memoryId: change.memoryId,
          reason: change.detail,
        }),
      );

    this.eventLog.append(events);

    return events;
  }
}

/** Surfaces discovery problems in the rebuild result, not just in the scan result. */
function scanWarnings(scan: WorkspaceScanResult): readonly RebuildWarning[] {
  return scan.skipped
    .filter((skip) => skip.reason !== "excluded_by_rule")
    .map((skip) => ({
      sourcePath: skip.workspacePath,
      message: `Durable source skipped during scan (${skip.reason}): ${skip.detail}`,
    }));
}
