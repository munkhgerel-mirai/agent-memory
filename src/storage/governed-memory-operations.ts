import { writeFileSync } from "node:fs";

import type { ProjectedMemoryRecord } from "../domain/local-workspace-storage.js";
import {
  cleanupSemanticEntries,
  type SemanticCleanupRequest,
  type SemanticCleanupResult,
} from "../domain/semantic-retrieval-extension.js";
import {
  createMemoryOperationRequest,
  createProvenanceStamp,
  evaluateMemoryOperation,
  type MemoryOperationRequest,
  type OperationDecision,
  type ProvenanceStamp,
} from "../domain/privacy-governance.js";

export interface GovernedMemoryOperationStore {
  readonly listProjections: () => readonly ProjectedMemoryRecord[];
  readonly recordDeletionTombstones: (
    records: readonly ProjectedMemoryRecord[],
    operationId: string,
    reason: string,
  ) => readonly unknown[];
  readonly removeProjection: (memoryId: string) => void;
}

export interface ExportMemoryInput {
  readonly operationId: string;
  readonly actor: string;
  readonly purpose: string;
  readonly requestedAt: string;
  readonly targetMemoryIds: readonly string[];
  readonly outputPath: string;
}

export interface ExportedMemoryRecord {
  readonly memoryId: string;
  readonly workspacePath: string;
  readonly category: ProjectedMemoryRecord["category"];
  readonly phase: ProjectedMemoryRecord["phase"];
  readonly text: string;
  readonly provenance: ProvenanceStamp;
}

export interface MemoryExportDocument {
  readonly schemaVersion: "1.0";
  readonly exportedAt: string;
  readonly operation: {
    readonly request: MemoryOperationRequest;
    readonly decision: OperationDecision;
  };
  readonly records: readonly ExportedMemoryRecord[];
}

export type ExportMemoryResult =
  | {
      readonly outcome: "completed";
      readonly outputPath: string;
      readonly document: MemoryExportDocument;
    }
  | {
      readonly outcome: "denied" | "approval_required";
      readonly decision: OperationDecision;
    };

export interface DeleteMemoryInput {
  readonly operationId: string;
  readonly actor: string;
  readonly purpose: string;
  readonly requestedAt: string;
  readonly targetMemoryIds: readonly string[];
}

export interface CleanupTargetResult {
  readonly target: "durable-record" | "local-index" | "lifecycle-edges" | "future-vector-index";
  readonly outcome: "completed" | "not_applicable" | "incomplete";
  readonly reason: string;
}

export type DeleteMemoryResult =
  | {
      readonly outcome: "completed" | "incomplete";
      readonly retryable: boolean;
      readonly decision: OperationDecision;
      readonly deletedMemoryIds: readonly string[];
      readonly sourceFilesModified: false;
      readonly cleanupTargets: readonly CleanupTargetResult[];
      readonly semanticCleanup: SemanticCleanupResult;
    }
  | {
      readonly outcome: "denied" | "approval_required";
      readonly retryable: false;
      readonly decision: OperationDecision;
    };

export interface GovernedMemoryOperationsOptions {
  readonly decisionProvider?: (request: MemoryOperationRequest) => OperationDecision;
  readonly semanticCleanup?: (request: SemanticCleanupRequest) => SemanticCleanupResult;
}

export class GovernedMemoryOperations {
  private readonly decisionProvider: (request: MemoryOperationRequest) => OperationDecision;
  private readonly semanticCleanup: (request: SemanticCleanupRequest) => SemanticCleanupResult;

  constructor(
    private readonly store: GovernedMemoryOperationStore,
    options: GovernedMemoryOperationsOptions = {},
  ) {
    this.decisionProvider = options.decisionProvider ?? evaluateMemoryOperation;
    this.semanticCleanup = options.semanticCleanup ?? ((request) => cleanupSemanticEntries(request));
  }

  export(input: ExportMemoryInput): ExportMemoryResult {
    const request = createMemoryOperationRequest({
      operationId: input.operationId,
      operationType: "export",
      actor: input.actor,
      purpose: input.purpose,
      targetMemoryIds: input.targetMemoryIds,
      requestedAt: input.requestedAt,
      includeProvenance: true,
    });
    const decision = this.decisionProvider(request);

    if (decision.outcome !== "allowed") {
      return { outcome: decision.outcome, decision };
    }

    const recordsById = new Map(
      this.store.listProjections().map((record) => [record.memoryId, record]),
    );
    const missingIds = request.targetMemoryIds.filter((memoryId) => !recordsById.has(memoryId));
    if (missingIds.length > 0) {
      throw new Error(`Export target memory IDs were not found: ${missingIds.join(", ")}`);
    }

    const document: MemoryExportDocument = {
      schemaVersion: "1.0",
      exportedAt: input.requestedAt,
      operation: { request, decision },
      records: request.targetMemoryIds.map((memoryId) =>
        exportRecord(recordsById.get(memoryId) as ProjectedMemoryRecord, input.actor),
      ),
    };

    writeFileSync(input.outputPath, `${JSON.stringify(document, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });

    return { outcome: "completed", outputPath: input.outputPath, document };
  }

  delete(input: DeleteMemoryInput): DeleteMemoryResult {
    const request = createMemoryOperationRequest({
      operationId: input.operationId,
      operationType: "delete",
      actor: input.actor,
      purpose: input.purpose,
      targetMemoryIds: input.targetMemoryIds,
      requestedAt: input.requestedAt,
      includeProvenance: false,
    });
    const decision = this.decisionProvider(request);

    if (decision.outcome !== "allowed") {
      return { outcome: decision.outcome, retryable: false, decision };
    }

    const recordsById = new Map(
      this.store.listProjections().map((record) => [record.memoryId, record]),
    );
    const records = request.targetMemoryIds.map((memoryId) => recordsById.get(memoryId));
    const missingIds = request.targetMemoryIds.filter((_, index) => !records[index]);
    if (missingIds.length > 0) {
      throw new Error(`Delete target memory IDs were not found: ${missingIds.join(", ")}`);
    }

    const targets: CleanupTargetResult[] = [];
    this.store.recordDeletionTombstones(
      records as readonly ProjectedMemoryRecord[],
      request.operationId,
      input.purpose,
    );
    targets.push({
      target: "durable-record",
      outcome: "completed",
      reason: "A deliberate deletion tombstone was appended; the Markdown source was left untouched.",
    });

    let localIndexIncomplete = false;
    try {
      for (const memoryId of request.targetMemoryIds) this.store.removeProjection(memoryId);
      targets.push({
        target: "local-index",
        outcome: "completed",
        reason: "Target memories were removed from the active SQLite projection.",
      });
    } catch (error) {
      localIndexIncomplete = true;
      targets.push({
        target: "local-index",
        outcome: "incomplete",
        reason: `Projection cleanup failed: ${errorMessage(error)}`,
      });
    }

    targets.push({
      target: "lifecycle-edges",
      outcome: "not_applicable",
      reason: "Lifecycle-edge cleanup is vacuous until US-003 edge extraction and persistence are implemented.",
    });

    const semanticCleanup = this.semanticCleanup({
      operationId: request.operationId,
      memoryIds: request.targetMemoryIds,
      requestedAt: request.requestedAt,
    });
    targets.push({
      target: "future-vector-index",
      outcome: semanticCleanup.outcome,
      reason: semanticCleanup.reason,
    });

    const incomplete = localIndexIncomplete || semanticCleanup.outcome === "incomplete";
    return {
      outcome: incomplete ? "incomplete" : "completed",
      retryable: incomplete,
      decision,
      deletedMemoryIds: [...request.targetMemoryIds],
      sourceFilesModified: false,
      cleanupTargets: targets,
      semanticCleanup,
    };
  }
}

function exportRecord(record: ProjectedMemoryRecord, actor: string): ExportedMemoryRecord {
  return {
    memoryId: record.memoryId,
    workspacePath: record.workspacePath,
    category: record.category,
    phase: record.phase,
    text: record.text,
    provenance: createProvenanceStamp({
      source: record.workspacePath,
      actor,
      timestamp: record.observedAt,
      approvalStatus: record.approvalStatus,
      visibility: record.visibility,
      retention: {
        policyId: record.retentionPolicy,
        memoryClass: "approved_lifecycle_memory",
        disposalAction: "retain",
      },
      artifactLink: record.workspacePath,
    }),
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}