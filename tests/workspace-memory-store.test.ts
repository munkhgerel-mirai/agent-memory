import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  AGENT_MEMORY_DIRECTORY,
  MemoryEventLog,
  WorkspaceLayoutError,
  WorkspaceMemoryStore,
  ensureWorkspaceLayout,
  isInsideStateDirectory,
  resolveWorkspaceLayout,
  type ProjectedMemoryRecord,
} from "../src/index.js";

const timestamp = "2026-07-27T00:00:00.000Z";
const packageIndexUrl = new URL("../src/index.js", import.meta.url).href;

const NFRS_PATH = "docs/01-inception/03-nfrs/nfrs.md";
const PLAN_PATH = "docs/02-construction/02-design-plan/example_plan.md";

describe("BOLT-09 durable workspace memory", () => {
  it("resolves the state directory under the workspace root and guards writes", () => {
    withWorkspace((root) => {
      const layout = resolveWorkspaceLayout(root);

      assert.equal(layout.stateDirectory, join(root, AGENT_MEMORY_DIRECTORY));
      assert.equal(layout.eventLogPath, join(layout.stateDirectory, "events.jsonl"));
      assert.equal(layout.indexPath, join(layout.stateDirectory, "index.sqlite"));

      assert.equal(isInsideStateDirectory(layout, layout.eventLogPath), true);
      assert.equal(isInsideStateDirectory(layout, join(root, "docs/01-inception/03-nfrs/nfrs.md")), false);
      assert.equal(isInsideStateDirectory(layout, join(root, "..", "escape.md")), false);
      assert.equal(isInsideStateDirectory(layout, layout.stateDirectory), false, "the directory itself is not a write target");

      // The state directory is created; the workspace root must already exist.
      assert.equal(readdirSync(root).includes(AGENT_MEMORY_DIRECTORY), false);
      ensureWorkspaceLayout(root);
      assert.equal(readdirSync(root).includes(AGENT_MEMORY_DIRECTORY), true);

      assert.throws(() => ensureWorkspaceLayout(join(root, "does-not-exist")), WorkspaceLayoutError);
      assert.throws(() => resolveWorkspaceLayout("  "), WorkspaceLayoutError);
    });
  });

  it("appends to the event log without rewriting earlier lines", () => {
    withWorkspace((root) => {
      const log = new MemoryEventLog(ensureWorkspaceLayout(root));
      assert.equal(log.exists(), false);
      assert.deepEqual(log.read().events, []);

      log.append([removalEvent("evt-1", "docs/a.md")]);
      const afterFirst = readFileSync(log.path, "utf8");

      log.append([removalEvent("evt-2", "docs/b.md")]);
      const afterSecond = readFileSync(log.path, "utf8");

      assert.equal(afterSecond.startsWith(afterFirst), true, "the first line must be byte-identical");
      assert.equal(afterSecond.trimEnd().split("\n").length, 2);

      const read = log.read();
      assert.deepEqual(read.events.map((event) => event.eventId), ["evt-1", "evt-2"]);
      assert.deepEqual(read.warnings, []);
      assert.equal(log.append([]), 0);
    });
  });

  it("skips a malformed event log line with a warning instead of throwing", () => {
    withWorkspace((root) => {
      const log = new MemoryEventLog(ensureWorkspaceLayout(root));
      log.append([removalEvent("evt-good-1", "docs/a.md")]);

      appendFileSync(log.path, '{"eventId":"evt-truncated","eventTy\n', "utf8");
      appendFileSync(log.path, '"just a string"\n', "utf8");
      appendFileSync(log.path, '{"eventId":"evt-bad","eventType":"memory_archived","workspaceId":"w"}\n', "utf8");
      log.append([removalEvent("evt-good-2", "docs/b.md")]);

      const read = log.read();

      assert.deepEqual(read.events.map((event) => event.eventId), ["evt-good-1", "evt-good-2"]);
      assert.deepEqual(read.skippedLineNumbers, [2, 3, 4]);
      assert.equal(read.totalLines, 5);
      assert.equal(read.warnings.length, 3);
      assert.match(read.warnings[0]?.message ?? "", /not valid JSON/u);
      assert.match(read.warnings[1]?.message ?? "", /not a JSON object/u);
      assert.match(read.warnings[2]?.message ?? "", /not a valid memory event/u);
    });
  });

  it("persists a projection that a second process can read", () => {
    withWorkspace((root) => {
      seedWorkspace(root);

      const store = WorkspaceMemoryStore.open({ workspaceRoot: root, now: () => timestamp });
      try {
        const result = store.rebuild({ rebuildId: "rebuild-1" });
        assert.equal(result.run.outcome?.status, "completed");
        assert.equal(store.countProjections(), 2);
      } finally {
        store.close();
      }

      // A genuinely separate Node process, which is the property v1 actually needs.
      const output = execFileSync(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `import { WorkspaceMemoryStore } from ${JSON.stringify(packageIndexUrl)};
           const store = WorkspaceMemoryStore.open({ workspaceRoot: ${JSON.stringify(root)} });
           process.stdout.write(store.listProjections().map((r) => r.workspacePath).sort().join(","));
           store.close();`,
        ],
        { encoding: "utf8" },
      );

      assert.deepEqual(output.split(","), [NFRS_PATH, PLAN_PATH]);
    });
  });

  it("rebuilds an identical projection after the index file is deleted", () => {
    withWorkspace((root) => {
      seedWorkspace(root);

      const before = withStore(root, (store) => {
        store.rebuild({ rebuildId: "rebuild-1" });
        return snapshot(store.listProjections());
      });

      rmSync(resolveWorkspaceLayout(root).indexPath, { force: true });

      const after = withStore(root, (store) => {
        const result = store.rebuild({ rebuildId: "rebuild-2" });
        assert.equal(result.run.outcome?.createdCount, 2, "a deleted index rebuilds from durable sources");
        return snapshot(store.listProjections());
      });

      assert.deepEqual(after, before);
    });
  });

  it("records a removal event when an artifact disappears and keeps it removed", () => {
    withWorkspace((root) => {
      seedWorkspace(root);

      withStore(root, (store) => store.rebuild({ rebuildId: "rebuild-1" }));
      rmSync(join(root, ...PLAN_PATH.split("/")));

      const removed = withStore(root, (store) => {
        const result = store.rebuild({ rebuildId: "rebuild-2" });
        assert.equal(result.run.outcome?.removedCount, 1);
        assert.equal(result.appendedEvents.length, 1);
        assert.equal(result.appendedEvents[0]?.eventType, "memory_removed");
        assert.equal(result.appendedEvents[0]?.sourcePath, PLAN_PATH);
        assert.equal(store.countProjections(), 1);
        return result;
      });

      assert.equal(removed.run.outcome?.status, "completed");

      // A later rebuild must neither resurrect it nor append a duplicate event.
      withStore(root, (store) => {
        const result = store.rebuild({ rebuildId: "rebuild-3" });
        assert.equal(store.countProjections(), 1);
        assert.deepEqual(result.appendedEvents, []);
        assert.equal(store.readEventLog().length, 1);
      });
    });
  });

  it("lets a restored artifact override an earlier removal event", () => {
    withWorkspace((root) => {
      seedWorkspace(root);
      withStore(root, (store) => store.rebuild({ rebuildId: "rebuild-1" }));
      rmSync(join(root, ...PLAN_PATH.split("/")));
      withStore(root, (store) => store.rebuild({ rebuildId: "rebuild-2" }));

      // Markdown holds content authority, so putting the file back must win over history.
      writeWorkspaceFile(root, PLAN_PATH, planArtifact());

      withStore(root, (store) => {
        const result = store.rebuild({ rebuildId: "rebuild-3" });

        assert.equal(store.countProjections(), 2);
        assert.equal(result.supersededEventCount, 1, "the stale removal is not replayed");
        assert.equal(result.replayedEventCount, 0);
        assert.equal(
          store.readEventLog().length,
          1,
          "the log is append-only, so the superseded event is retained",
        );
      });
    });
  });

  it("honours a governed deletion tombstone while leaving the Markdown source untouched", () => {
    withWorkspace((root) => {
      seedWorkspace(root);
      const sourcePath = join(root, ...PLAN_PATH.split("/"));
      const sourceBefore = readFileSync(sourcePath, "utf8");

      withStore(root, (store) => {
        store.rebuild({ rebuildId: "rebuild-1" });
        const record = store.listProjections().find((candidate) => candidate.workspacePath === PLAN_PATH);
        assert.ok(record);

        const events = store.recordDeletionTombstones(
          [record],
          "delete:1",
          "Governed deletion test.",
        );
        store.removeProjection(record.memoryId);

        assert.equal(events[0]?.eventType, "memory_deleted");
        assert.equal(store.countProjections(), 1);
      });

      withStore(root, (store) => {
        const rebuilt = store.rebuild({ rebuildId: "rebuild-2" });
        assert.equal(rebuilt.replayedEventCount, 1);
        assert.equal(rebuilt.supersededEventCount, 0);
        assert.equal(store.countProjections(), 1, "the visible Markdown must not resurrect memory");
        assert.equal(
          store.listProjections().some((record) => record.workspacePath === PLAN_PATH),
          false,
        );
      });

      assert.equal(readFileSync(sourcePath, "utf8"), sourceBefore);
    });
  });

  it("reports completed_with_warnings when the event log has a malformed line", () => {
    withWorkspace((root) => {
      seedWorkspace(root);
      const layout = ensureWorkspaceLayout(root);
      appendFileSync(layout.eventLogPath, "{ not json\n", "utf8");

      withStore(root, (store) => {
        const result = store.rebuild({ rebuildId: "rebuild-1" });

        assert.equal(result.run.outcome?.status, "completed_with_warnings");
        assert.ok(result.run.outcome!.warningCount >= 1);
        assert.ok(result.run.warnings.some((warning) => /not valid JSON/u.test(warning.message)));
        assert.equal(store.countProjections(), 2, "a corrupt line must not block the rebuild");
      });
    });
  });

  it("writes nothing outside the state directory", () => {
    withWorkspace((root) => {
      seedWorkspace(root);
      const before = treeSnapshot(root);

      withStore(root, (store) => store.rebuild({ rebuildId: "rebuild-1" }));

      const after = treeSnapshot(root);
      const added = after.filter((path) => !before.includes(path));
      const removedPaths = before.filter((path) => !after.includes(path));

      assert.deepEqual(removedPaths, [], "no durable source may be modified or deleted");
      assert.ok(added.length > 0);
      assert.ok(
        added.every((path) => path.startsWith(`${AGENT_MEMORY_DIRECTORY}/`)),
        `unexpected writes: ${added.filter((p) => !p.startsWith(`${AGENT_MEMORY_DIRECTORY}/`)).join(", ")}`,
      );
    });
  });

  it("keeps the state directory out of its own scan and out of version control", () => {
    withWorkspace((root) => {
      seedWorkspace(root);

      withStore(root, (store) => {
        store.rebuild({ rebuildId: "rebuild-1" });
        const result = store.rebuild({ rebuildId: "rebuild-2" });

        assert.equal(
          result.scan.observations.some((observation) =>
            observation.workspacePath.startsWith(`${AGENT_MEMORY_DIRECTORY}/`),
          ),
          false,
          "derived state must never be indexed as a durable source",
        );
        assert.ok(result.scan.excludedPaths.includes(`${AGENT_MEMORY_DIRECTORY}/`));
      });

      const gitignore = readFileSync(new URL("../../.gitignore", import.meta.url), "utf8");
      assert.ok(gitignore.includes(`${AGENT_MEMORY_DIRECTORY}/`), "the derived directory must be gitignored");
    });
  });
});

function withWorkspace(run: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "agent-memory-bolt09-"));
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function withStore<T>(root: string, run: (store: WorkspaceMemoryStore) => T): T {
  const store = WorkspaceMemoryStore.open({ workspaceRoot: root, now: () => timestamp });
  try {
    return run(store);
  } finally {
    store.close();
  }
}

function seedWorkspace(root: string): void {
  writeWorkspaceFile(
    root,
    NFRS_PATH,
    "# NFRs\n\n## Approval Status\n\nApproved by user on 2026-06-04.\n\n## Body\n\nNFR-001 content.\n",
  );
  writeWorkspaceFile(root, PLAN_PATH, planArtifact());
}

function planArtifact(): string {
  return "# Example Plan\n\n## Approval Status\n\nPending human review.\n\n## Purpose\n\nPlan body.\n";
}

function writeWorkspaceFile(root: string, relativePath: string, content: string): void {
  const absolutePath = join(root, ...relativePath.split("/"));
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
}

function removalEvent(eventId: string, sourcePath: string) {
  return {
    eventId,
    eventType: "memory_removed" as const,
    workspaceId: "test-workspace",
    occurredAt: timestamp,
    actor: "test",
    sourcePath,
    reason: "Artifact removed during test.",
  };
}

function snapshot(records: readonly ProjectedMemoryRecord[]): readonly string[] {
  return records
    .map((record) => `${record.memoryId}|${record.workspacePath}|${record.category}|${record.approvalStatus}|${record.observedVersion}`)
    .sort();
}

function treeSnapshot(root: string, relativeDir = ""): readonly string[] {
  const absoluteDir = relativeDir ? join(root, relativeDir) : root;
  const paths: string[] = [];

  for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
    const childPath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      paths.push(...treeSnapshot(root, childPath));
    } else {
      paths.push(childPath);
    }
  }

  return paths.sort();
}
