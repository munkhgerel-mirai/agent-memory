import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  createMemoryEventRecord,
  ensureWorkspaceLayout,
  MemoryEventLog,
  type MemoryEventRecord,
} from "../../src/index.js";

export const PREVIEW_TIMESTAMP = "2026-09-22T00:00:00.000Z";
export const PREVIEW_NFR_PATH = "docs/01-inception/03-nfrs/nfrs.md";

export interface ScaleWorkspaceFixture {
  readonly lifecycleArtifactCount: number;
  readonly eventRecordCount: number;
  readonly eventTypeCounts: Readonly<Record<MemoryEventRecord["eventType"], number>>;
}

export function seedPreviewWorkspace(root: string): void {
  writeWorkspaceFile(
    root,
    "PROJECT_STATUS.md",
    [
      "# Agent-memory Project Status",
      "",
      "## Project Goal",
      "",
      "Provide persistent, framework-agnostic AI-DLC context.",
      "",
      "## Current Status",
      "",
      "BOLT-14 preview release-readiness verification is active.",
      "",
      "## Next Steps",
      "",
      "1. Verify the MCP and CLI preview.",
      "2. Report release gaps honestly.",
      "",
    ].join("\n"),
  );
  writeWorkspaceFile(
    root,
    PREVIEW_NFR_PATH,
    [
      "# Non-Functional Requirements",
      "",
      "## Approval Status",
      "",
      "Approved by user on 2026-09-22.",
      "",
      "## Performance",
      "",
      "NFR-001 requires startup retrieval within ten seconds.",
      "",
    ].join("\n"),
  );
  writeWorkspaceFile(
    root,
    "docs/02-construction/02-design-plan/preview_plan.md",
    [
      "# Preview Plan",
      "",
      "## Approval Status",
      "",
      "Approved by user on 2026-09-22.",
      "",
      "## Purpose",
      "",
      "Verify Agent-memory through real files, CLI, and MCP.",
      "",
    ].join("\n"),
  );
  writeWorkspaceFile(
    root,
    "docs/01-inception/04-risks/risk_register.md",
    [
      "# Risk Register",
      "",
      "## Approval Status",
      "",
      "Approved by user on 2026-09-22.",
      "",
      "## Risks",
      "",
      "- R-005: deleted memory must not return after rebuild.",
      "",
    ].join("\n"),
  );
}

export function seedScaleWorkspace(
  root: string,
  lifecycleArtifactCount = 1_000,
  eventRecordCount = 10_000,
): ScaleWorkspaceFixture {
  if (lifecycleArtifactCount < 1) throw new Error("Scale fixture needs at least one lifecycle artifact.");
  if (eventRecordCount < 2) throw new Error("Scale fixture needs at least two event records.");

  seedPreviewWorkspace(root);

  // seedPreviewWorkspace creates four lifecycle artifacts. Add approved plan artifacts until the
  // requested count is exact, keeping each document small and deterministic.
  for (let index = 4; index < lifecycleArtifactCount; index += 1) {
    const id = index.toString().padStart(4, "0");
    writeWorkspaceFile(
      root,
      `docs/02-construction/02-design-plan/scale_plan_${id}.md`,
      [
        `# Scale Plan ${id}`,
        "",
        "## Approval Status",
        "",
        "Approved by user on 2026-09-22.",
        "",
        "## Purpose",
        "",
        `Representative lifecycle plan ${id} for NFR-009 verification.`,
        "",
      ].join("\n"),
    );
  }

  const indexedCount = Math.floor(eventRecordCount * 0.8);
  const removedCount = Math.floor((eventRecordCount - indexedCount) / 2);
  const deletedCount = eventRecordCount - indexedCount - removedCount;
  const events: MemoryEventRecord[] = [];

  for (let index = 0; index < indexedCount; index += 1) {
    events.push(
      createMemoryEventRecord({
        eventId: `scale-indexed-${index}`,
        eventType: "memory_indexed",
        workspaceId: "bolt14-scale",
        occurredAt: PREVIEW_TIMESTAMP,
        actor: "bolt14-fixture",
        sourcePath: `event-history/scale-${index}.md`,
        memoryId: `scale-memory-${index}`,
        category: "VerificationMemory",
        approvalStatus: "approved",
        visibility: "workspace",
        retentionPolicy: "approved-lifecycle-memory",
        observedVersion: `sha256:scale-${index}`,
        text: `Verification history ${index} for representative scale testing.`,
      }),
    );
  }

  for (let index = 0; index < removedCount; index += 1) {
    events.push(
      createMemoryEventRecord({
        eventId: `scale-removed-${index}`,
        eventType: "memory_removed",
        workspaceId: "bolt14-scale",
        occurredAt: PREVIEW_TIMESTAMP,
        actor: "bolt14-fixture",
        sourcePath: `event-history/scale-${index}.md`,
        memoryId: `scale-memory-${index}`,
        reason: "Representative historical removal.",
      }),
    );
  }

  for (let index = 0; index < deletedCount; index += 1) {
    const target = removedCount + index;
    events.push(
      createMemoryEventRecord({
        eventId: `scale-deleted-${index}`,
        eventType: "memory_deleted",
        workspaceId: "bolt14-scale",
        occurredAt: PREVIEW_TIMESTAMP,
        actor: "bolt14-fixture",
        sourcePath: `event-history/scale-${target}.md`,
        memoryId: `scale-memory-${target}`,
        reason: "Representative governed deletion.",
      }),
    );
  }

  new MemoryEventLog(ensureWorkspaceLayout(root)).append(events);

  return {
    lifecycleArtifactCount,
    eventRecordCount: events.length,
    eventTypeCounts: {
      memory_indexed: indexedCount,
      memory_removed: removedCount,
      memory_deleted: deletedCount,
    },
  };
}

export function writeWorkspaceFile(root: string, relativePath: string, content: string): void {
  const absolutePath = join(root, ...relativePath.split("/"));
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
}
