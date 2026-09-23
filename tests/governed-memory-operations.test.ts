import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  GovernedMemoryOperations,
  createProjectedMemoryRecord,
  type MemoryExportDocument,
  type OperationDecision,
} from "../src/index.js";

const timestamp = "2026-08-26T00:00:00.000Z";
const record = createProjectedMemoryRecord({
  memoryId: "memory:plan",
  workspacePath: "docs/02-construction/02-design-plan/plan.md",
  category: "PlanMemory",
  approvalStatus: "approved",
  visibility: "workspace",
  retentionPolicy: "approved-lifecycle-memory",
  observedVersion: "sha256:plan",
  observedAt: "2026-07-27T00:00:00.000Z",
  sourceKind: "lifecycle_artifact",
  text: "# Approved plan",
  lastProjectedAt: timestamp,
});

function operationStore() {
  const records = new Map([[record.memoryId, record]]);
  const tombstones: string[] = [];
  return {
    records,
    tombstones,
    store: {
      listProjections: () => [...records.values()],
      recordDeletionTombstones: (deleted: readonly typeof record[]) => {
        tombstones.push(...deleted.map((item) => item.memoryId));
        return deleted;
      },
      removeProjection: (memoryId: string) => {
        records.delete(memoryId);
      },
    },
  };
}

describe("BOLT-11 governed memory operations", () => {
  it("exports a round-trippable JSON document with provenance", () => {
    withTempDirectory((root) => {
      const outputPath = join(root, "memory-export.json");
      const operations = new GovernedMemoryOperations(operationStore().store);

      const result = operations.export({
        operationId: "export:1",
        actor: "cli",
        purpose: "Portable backup",
        requestedAt: timestamp,
        targetMemoryIds: [record.memoryId],
        outputPath,
      });

      assert.equal(result.outcome, "completed");
      const document = JSON.parse(readFileSync(outputPath, "utf8")) as MemoryExportDocument;
      assert.deepEqual(document, result.document);
      assert.equal(document.exportedAt, timestamp);
      assert.equal(document.operation.decision.outcome, "allowed");
      assert.equal(document.records[0]?.text, record.text);
      assert.equal(document.records[0]?.provenance.source, record.workspacePath);
      assert.equal(document.records[0]?.provenance.approvalStatus, "approved");
    });
  });

  it("writes nothing when governance denies the export", () => {
    withTempDirectory((root) => {
      const outputPath = join(root, "denied.json");
      const denied: OperationDecision = {
        operationId: "export:denied",
        outcome: "denied",
        reason: "Policy denied export.",
        requiredCleanupTargets: [],
        includeProvenance: true,
      };
      const operations = new GovernedMemoryOperations(
        operationStore().store,
        { decisionProvider: () => denied },
      );

      const result = operations.export({
        operationId: denied.operationId,
        actor: "cli",
        purpose: "Denied export",
        requestedAt: timestamp,
        targetMemoryIds: [record.memoryId],
        outputPath,
      });

      assert.equal(result.outcome, "denied");
      assert.equal(existsSync(outputPath), false);
    });
  });

  it("deletes from derived state, wires disabled semantic cleanup, and names vacuous edge cleanup", () => {
    const fixture = operationStore();
    const operations = new GovernedMemoryOperations(fixture.store);

    const result = operations.delete({
      operationId: "delete:1",
      actor: "cli",
      purpose: "Remove obsolete memory",
      requestedAt: timestamp,
      targetMemoryIds: [record.memoryId],
    });

    assert.equal(result.outcome, "completed");
    if (result.outcome === "completed") {
      assert.deepEqual(fixture.tombstones, [record.memoryId]);
      assert.equal(fixture.records.has(record.memoryId), false);
      assert.equal(result.sourceFilesModified, false);
      assert.equal(result.semanticCleanup.outcome, "not_applicable");
      assert.match(
        result.cleanupTargets.find((target) => target.target === "lifecycle-edges")?.reason ?? "",
        /vacuous until US-003/u,
      );
    }
  });

  it("reports incomplete and retryable when semantic cleanup cannot be proven", () => {
    const fixture = operationStore();
    const operations = new GovernedMemoryOperations(fixture.store, {
      semanticCleanup: (request) => ({
        operationId: request.operationId,
        outcome: "incomplete",
        removedMemoryIds: [],
        remainingMemoryIds: [...request.memoryIds],
        reason: "Semantic index unavailable.",
        retryable: true,
      }),
    });

    const result = operations.delete({
      operationId: "delete:partial",
      actor: "cli",
      purpose: "Exercise partial cleanup",
      requestedAt: timestamp,
      targetMemoryIds: [record.memoryId],
    });

    assert.equal(result.outcome, "incomplete");
    if (result.outcome === "incomplete") {
      assert.equal(result.retryable, true);
      assert.equal(
        result.cleanupTargets.find((target) => target.target === "future-vector-index")?.outcome,
        "incomplete",
      );
    }
  });
});

function withTempDirectory(run: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "agent-memory-bolt11-export-"));
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}