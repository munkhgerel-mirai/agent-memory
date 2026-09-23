import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

import { PREVIEW_NFR_PATH, seedPreviewWorkspace } from "./support/v1-workspace-fixture.js";

const cliEntrypoint = executablePath("../src/cli/main.js");
const mcpEntrypoint = executablePath("../src/mcp/main.js");

describe("BOLT-14 MCP/CLI preview release readiness", () => {
  it("runs a fresh-process CLI flow from files through export and durable deletion", () => {
    withWorkspace((root) => {
      seedPreviewWorkspace(root);
      const sourcePath = join(root, ...PREVIEW_NFR_PATH.split("/"));
      const sourceBefore = readFileSync(sourcePath, "utf8");

      const rebuilt = runCli(["rebuild", "--workspace", root, "--json"]);
      assert.equal(rebuilt.status, "completed");

      const context = runCli(["context", "--workspace", root, "--json"]);
      const contextPayload = payloadOf<{
        estimatedTokens: number;
        tokenBudget: { maximumTokens: number };
        items: readonly { sourcePath: string; content: string }[];
      }>(context);
      assert.equal(contextPayload.tokenBudget.maximumTokens, 2000);
      assert.ok(contextPayload.estimatedTokens <= 2000);
      assert.ok(contextPayload.items.some((item) => item.sourcePath === "PROJECT_STATUS.md"));
      assert.match(contextPayload.items.map((item) => item.content).join("\n"), /Project Goal/u);
      assert.match(contextPayload.items.map((item) => item.content).join("\n"), /Current Status/u);
      assert.match(contextPayload.items.map((item) => item.content).join("\n"), /Next Steps/u);

      const query = runCli(["query", "NFR-001", "--workspace", root, "--json"]);
      const queryPayload = payloadOf<readonly { record: { memoryId: string; workspacePath: string } }[]>(query);
      const record = queryPayload.find((item) => item.record.workspacePath === PREVIEW_NFR_PATH)?.record;
      assert.ok(record, "the NFR artifact must be queryable");

      const inspected = runCli([
        "inspect",
        record.memoryId,
        "--workspace",
        root,
        "--json",
      ]);
      assert.equal(payloadOf<{ memoryId: string }>(inspected).memoryId, record.memoryId);

      const exportPath = join(root, "portable-preview-export.json");
      const exported = runCli([
        "export",
        record.memoryId,
        "--workspace",
        root,
        "--output",
        exportPath,
        "--reason",
        "BOLT-14 preview verification",
        "--json",
      ]);
      assert.equal(exported.status, "completed");
      const exportDocument = JSON.parse(readFileSync(exportPath, "utf8")) as {
        schemaVersion: string;
        exportedAt: string;
        operation: { request: { targetMemoryIds: readonly string[] }; decision: { outcome: string } };
        records: readonly { memoryId: string; provenance: { source: string } }[];
      };
      assert.equal(exportDocument.schemaVersion, "1.0");
      assert.ok(exportDocument.exportedAt.length > 0);
      assert.deepEqual(exportDocument.operation.request.targetMemoryIds, [record.memoryId]);
      assert.equal(exportDocument.operation.decision.outcome, "allowed");
      assert.equal(exportDocument.records[0]?.provenance.source, PREVIEW_NFR_PATH);

      const refused = spawnCli([
        "delete",
        record.memoryId,
        "--workspace",
        root,
        "--reason",
        "BOLT-14 preview verification",
        "--json",
      ]);
      assert.equal(refused.status, 2);
      assert.match(refused.stderr, /requires --confirm/u);

      const deleted = runCli([
        "delete",
        record.memoryId,
        "--workspace",
        root,
        "--reason",
        "BOLT-14 preview verification",
        "--confirm",
        "--json",
      ]);
      const deletePayload = payloadOf<{
        deletedMemoryIds: readonly string[];
        sourceFilesModified: boolean;
        cleanupTargets: readonly { target: string; outcome: string }[];
      }>(deleted);
      assert.deepEqual(deletePayload.deletedMemoryIds, [record.memoryId]);
      assert.equal(deletePayload.sourceFilesModified, false);
      assert.deepEqual(
        deletePayload.cleanupTargets.map((target) => [target.target, target.outcome]),
        [
          ["durable-record", "completed"],
          ["local-index", "completed"],
          ["lifecycle-edges", "not_applicable"],
          ["future-vector-index", "not_applicable"],
        ],
      );
      assert.equal(readFileSync(sourcePath, "utf8"), sourceBefore);

      // A fresh process and full rebuild must continue to honour the deliberate tombstone even
      // while the source Markdown remains present.
      runCli(["rebuild", "--workspace", root, "--json"]);
      const afterDelete = payloadOf<readonly { record: { memoryId: string } }[]>(
        runCli(["query", "NFR-001", "--workspace", root, "--json"]),
      );
      assert.equal(afterDelete.some((item) => item.record.memoryId === record.memoryId), false);
      assert.equal(readFileSync(sourcePath, "utf8"), sourceBefore);
    });
  });

  it("serves file-backed startup context to a fresh official MCP client", async () => {
    await withAsyncWorkspace(async (root) => {
      seedPreviewWorkspace(root);
      runCli(["rebuild", "--workspace", root, "--json"]);

      const client = new Client(
        { name: "bolt14-preview-readiness", version: "1.0.0" },
        { versionNegotiation: { mode: "auto" } },
      );
      const transport = new StdioClientTransport({
        command: process.execPath,
        args: [mcpEntrypoint, "--workspace", root],
        stderr: "pipe",
      });

      try {
        await client.connect(transport);
        const tools = await client.listTools();
        assert.equal(tools.tools.length, 7);

        const response = await client.callTool({
          name: "get_context",
          arguments: { goal: "preview release readiness" },
        });
        assert.equal(response.isError, false);
        const content = response.structuredContent as {
          status: string;
          payload: {
            estimatedTokens: number;
            tokenBudget: { maximumTokens: number };
            items: readonly { sourcePath: string; content: string }[];
          };
        };
        assert.equal(content.status, "completed");
        assert.equal(content.payload.tokenBudget.maximumTokens, 2000);
        assert.ok(content.payload.estimatedTokens <= 2000);
        assert.ok(content.payload.items.some((item) => item.sourcePath === "PROJECT_STATUS.md"));
        assert.match(content.payload.items.map((item) => item.content).join("\n"), /Next Steps/u);
      } finally {
        await client.close();
      }
    });
  });
});

function runCli(args: readonly string[]): CliDocument {
  const stdout = execFileSync(process.execPath, [cliEntrypoint, ...args], { encoding: "utf8" });
  return JSON.parse(stdout) as CliDocument;
}

function spawnCli(args: readonly string[]) {
  return spawnSync(process.execPath, [cliEntrypoint, ...args], { encoding: "utf8" });
}

interface CliDocument {
  readonly status: string;
  readonly exitCode: number;
  readonly data: unknown;
}

function payloadOf<T>(document: CliDocument): T {
  assert.equal(document.exitCode, 0);
  return (document.data as { payload: T }).payload;
}

function executablePath(relativePath: string): string {
  return new URL(relativePath, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/u, "$1");
}

function withWorkspace(runTest: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "agent-memory-bolt14-preview-"));
  try {
    runTest(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

async function withAsyncWorkspace(runTest: (root: string) => Promise<void>): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), "agent-memory-bolt14-mcp-"));
  try {
    await runTest(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
