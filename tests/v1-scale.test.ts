import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { it } from "node:test";

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

import { WorkspaceMemoryStore } from "../src/index.js";
import { seedScaleWorkspace } from "./support/v1-workspace-fixture.js";

const cliEntrypoint = executablePath("../src/cli/main.js");
const mcpEntrypoint = executablePath("../src/mcp/main.js");
const startupLimitMs = 10_000;

it("meets the BOLT-14 1,000/10,000 local scale and fresh-session target", async () => {
  const root = mkdtempSync(join(tmpdir(), "agent-memory-bolt14-scale-"));

  try {
    const fixtureStartedAt = performance.now();
    const fixture = seedScaleWorkspace(root);
    const fixtureDurationMs = performance.now() - fixtureStartedAt;
    assert.equal(fixture.lifecycleArtifactCount, 1_000);
    assert.equal(fixture.eventRecordCount, 10_000);

    const store = WorkspaceMemoryStore.open({ workspaceRoot: root });
    const rebuildStartedAt = performance.now();
    const rebuilt = store.rebuild({ rebuildId: "bolt14-scale-rebuild" });
    const rebuildDurationMs = performance.now() - rebuildStartedAt;
    const projectionCount = store.countProjections();
    const eventLogCount = store.readEventLog().length;
    store.close();

    assert.equal(rebuilt.scan.observations.length, 1_000);
    assert.equal(eventLogCount, 10_000);
    assert.equal(rebuilt.replayedEventCount, 10_000);
    assert.equal(rebuilt.supersededEventCount, 0);
    assert.equal(projectionCount, 7_000);

    const cliSamplesMs: number[] = [];
    for (let sample = 0; sample < 3; sample += 1) {
      const startedAt = performance.now();
      const document = runCliContext(root);
      cliSamplesMs.push(performance.now() - startedAt);
      assertContext(document);
    }

    const mcpStartedAt = performance.now();
    const mcp = await runMcpContext(root);
    const mcpSampleMs = performance.now() - mcpStartedAt;
    assertContext(mcp);

    const retrievalSamplesMs = [...cliSamplesMs, mcpSampleMs];
    for (const durationMs of retrievalSamplesMs) {
      assert.ok(
        durationMs <= startupLimitMs,
        `fresh-session retrieval took ${durationMs.toFixed(2)}ms, above ${startupLimitMs}ms`,
      );
    }

    const result = {
      lifecycleArtifactCount: rebuilt.scan.observations.length,
      eventRecordCount: eventLogCount,
      eventTypeCounts: fixture.eventTypeCounts,
      replayedEventCount: rebuilt.replayedEventCount,
      supersededEventCount: rebuilt.supersededEventCount,
      projectionCount,
      fixtureDurationMs: round(fixtureDurationMs),
      rebuildDurationMs: round(rebuildDurationMs),
      cliRetrievalSamplesMs: cliSamplesMs.map(round),
      mcpRetrievalSampleMs: round(mcpSampleMs),
      maximumRetrievalMs: round(Math.max(...retrievalSamplesMs)),
      startupLimitMs,
    };
    process.stdout.write(`BOLT14_SCALE_RESULT ${JSON.stringify(result)}\n`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

interface ContextPayload {
  readonly estimatedTokens: number;
  readonly tokenBudget: { readonly maximumTokens: number };
  readonly items: readonly { readonly sourcePath: string; readonly content: string }[];
}

function runCliContext(root: string): ContextPayload {
  const stdout = execFileSync(
    process.execPath,
    [cliEntrypoint, "context", "--workspace", root, "--goal", "preview release readiness", "--json"],
    { encoding: "utf8" },
  );
  const document = JSON.parse(stdout) as { exitCode: number; data: { payload: ContextPayload } };
  assert.equal(document.exitCode, 0);
  return document.data.payload;
}

async function runMcpContext(root: string): Promise<ContextPayload> {
  const client = new Client(
    { name: "bolt14-scale", version: "1.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [mcpEntrypoint, "--workspace", root],
    stderr: "pipe",
  });

  try {
    await client.connect(transport);
    const response = await client.callTool({
      name: "get_context",
      arguments: { goal: "preview release readiness" },
    });
    assert.equal(response.isError, false);
    const content = response.structuredContent as { status: string; payload: ContextPayload };
    assert.equal(content.status, "completed");
    return content.payload;
  } finally {
    await client.close();
  }
}

function assertContext(payload: ContextPayload): void {
  assert.equal(payload.tokenBudget.maximumTokens, 2000);
  assert.ok(payload.estimatedTokens <= 2000);
  const text = payload.items.map((item) => item.content).join("\n");
  assert.ok(payload.items.some((item) => item.sourcePath === "PROJECT_STATUS.md"));
  assert.match(text, /Project Goal/u);
  assert.match(text, /Current Status/u);
  assert.match(text, /Next Steps/u);
  assert.match(text, /Source: PROJECT_STATUS\.md/u);
}

function executablePath(relativePath: string): string {
  return new URL(relativePath, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, "$1");
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
