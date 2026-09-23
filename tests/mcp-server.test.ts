import assert from "node:assert/strict";
import {
  existsSync,
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
import * as z from "zod/v4";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

import {
  MCP_TOOL_DESCRIPTORS,
  type CapabilityPayloadField,
  type McpToolDescriptor,
} from "../src/domain/framework-agnostic-integration.js";
import { mcpInputSchema } from "../src/mcp/tool-schema.js";
import {
  WorkspaceMutationLock,
  WorkspaceMutationLockError,
} from "../src/storage/workspace-mutation-lock.js";
import { ensureWorkspaceLayout } from "../src/storage/workspace-layout.js";

describe("BOLT-12 MCP server surface", () => {
  it("maps every capability field type into a strict, described Zod schema", () => {
    const descriptor = testDescriptor([
      field("name", "string", true, "Required name."),
      field("tags", "string_array", false, "Optional tags."),
      field("enabled", "boolean", true, "Enabled flag."),
      field("limit", "number", false, "Optional limit."),
      field("metadata", "object", true, "Metadata object."),
    ]);
    const schema = mcpInputSchema(descriptor);

    assert.deepEqual(schema.parse({ name: "memory", enabled: true, metadata: { source: "test" } }), {
      name: "memory",
      enabled: true,
      metadata: { source: "test" },
    });
    const jsonSchema = z.toJSONSchema(schema) as {
      properties?: Record<string, { description?: string }>;
    };
    assert.equal(jsonSchema.properties?.name?.description, "Required name.");
    assert.equal(jsonSchema.properties?.tags?.description, "Optional tags.");
    assert.equal(schema.safeParse({ enabled: true, metadata: {} }).success, false);
    assert.equal(schema.safeParse({ name: "memory", enabled: "yes", metadata: {} }).success, false);
    assert.equal(schema.safeParse({ name: "memory", enabled: true, metadata: {}, extra: true }).success, false);
  });

  it("builds a valid strict schema for every approved MCP descriptor", () => {
    assert.equal(MCP_TOOL_DESCRIPTORS.length, 7);

    for (const descriptor of MCP_TOOL_DESCRIPTORS) {
      const schema = mcpInputSchema(descriptor);
      const requiredFields = descriptor.inputFields.filter((field_) => field_.required);

      assert.equal(schema.safeParse({}).success, requiredFields.length === 0, descriptor.toolName);
      assert.equal(schema.safeParse({ unexpected: true }).success, false, descriptor.toolName);
    }
  });

  it("serializes workspace mutations and releases the lock after success or failure", () => {
    withWorkspace((root) => {
      const lock = testLock(root, { token: () => "owner-1" });
      let nestedError: unknown;

      assert.equal(
        lock.runExclusive("rebuild:1", () => {
          assert.equal(existsSync(lock.path), true);
          try {
            testLock(root, { token: () => "owner-2" }).runExclusive("delete:2", () => undefined);
          } catch (error) {
            nestedError = error;
          }
          return "completed";
        }),
        "completed",
      );
      assert.ok(nestedError instanceof WorkspaceMutationLockError);
      assert.equal(nestedError.retryable, true);
      assert.equal(existsSync(lock.path), false);

      assert.throws(
        () => lock.runExclusive("rebuild:failure", () => { throw new Error("failed"); }),
        /failed/u,
      );
      assert.equal(existsSync(lock.path), false);
    });
  });

  it("recovers only an old local lock whose owner process is no longer running", () => {
    withWorkspace((root) => {
      const lock = testLock(root, {
        token: () => "replacement",
        now: () => new Date("2026-08-26T00:20:00.000Z"),
        isProcessRunning: () => false,
      });
      writeFileSync(
        lock.path,
        `${JSON.stringify({
          token: "stale",
          pid: 404,
          hostname: "test-host",
          operationId: "rebuild:stale",
          acquiredAt: "2026-08-26T00:00:00.000Z",
        })}\n`,
        "utf8",
      );

      lock.runExclusive("delete:replacement", () => {
        const owner = JSON.parse(readFileSync(lock.path, "utf8")) as { token: string };
        assert.equal(owner.token, "replacement");
      });
      assert.equal(existsSync(lock.path), false);
    });
  });

  for (const mode of ["legacy", "modern"] as const) {
    it(`serves deterministic tools and startup context to a ${mode} stdio client`, async () => {
      await withAsyncWorkspace(async (root) => {
        seedWorkspace(root);
        const client = new Client(
          { name: `agent-memory-${mode}-test`, version: "1.0.0" },
          mode === "modern" ? { versionNegotiation: { mode: "auto" } } : {},
        );
        const transport = new StdioClientTransport({
          command: process.execPath,
          args: [mcpEntrypoint, "--workspace", root],
          stderr: "pipe",
        });

        try {
          await client.connect(transport);
          const childPid = transport.pid;
          assert.ok(childPid);
          const listed = await client.listTools();
          assert.deepEqual(
            listed.tools.map((tool) => tool.name),
            MCP_TOOL_DESCRIPTORS.map((descriptor) => descriptor.toolName),
          );
          const rebuildTool = listed.tools.find((tool) => tool.name === "rebuild_index");
          const deleteTool = listed.tools.find((tool) => tool.name === "delete_memory");
          assert.equal(rebuildTool?.annotations?.readOnlyHint, false);
          assert.equal(rebuildTool?.annotations?.idempotentHint, true);
          assert.equal(deleteTool?.annotations?.destructiveHint, true);
          assert.equal(deleteTool?.annotations?.idempotentHint, false);

          const rebuilt = await client.callTool({ name: "rebuild_index", arguments: {} });
          assert.equal(rebuilt.isError, false);

          const context = await client.callTool({
            name: "get_context",
            arguments: { goal: "project goal" },
          });
          assert.equal(context.isError, false);
          const response = context.structuredContent as {
            status: string;
            payload: {
              estimatedTokens: number;
              tokenBudget: { maximumTokens: number };
              items: readonly { sourcePath: string }[];
            };
          };
          assert.equal(response.status, "completed");
          assert.ok(response.payload.estimatedTokens <= 2000);
          assert.equal(response.payload.tokenBudget.maximumTokens, 2000);
          assert.ok(response.payload.items.some((item) => item.sourcePath === "PROJECT_STATUS.md"));

          const rejected = await client.callTool({
            name: "query_memory",
            arguments: { query: 42 },
          });
          assert.equal(rejected.isError, true);

          const write = await client.callTool({
            name: "write_memory",
            arguments: {
              candidateId: "candidate:1",
              content: "Approved content",
              provenance: { source: "test" },
              approvalEvidence: "none",
            },
          });
          assert.equal(write.isError, true);
          assert.equal(
            (write.structuredContent as { status: string }).status,
            "approval_required",
          );

          const query = await client.callTool({
            name: "query_memory",
            arguments: { query: "NFR-001" },
          });
          const queryResponse = query.structuredContent as {
            payload: readonly { record: { memoryId: string } }[];
          };
          const memoryId = queryResponse.payload[0]?.record.memoryId ?? "";
          const unconfirmedDelete = await client.callTool({
            name: "delete_memory",
            arguments: { targetMemoryIds: [memoryId], reason: "Test confirmation" },
          });
          assert.equal(unconfirmedDelete.isError, true);

          const confirmedDelete = await client.callTool({
            name: "delete_memory",
            arguments: {
              targetMemoryIds: [memoryId],
              reason: "Test confirmed deletion",
              confirmationEvidence: "mcp-host:user-confirmed",
            },
          });
          assert.equal(confirmedDelete.isError, false);

          await assert.rejects(
            client.callTool({ name: "unknown_tool", arguments: {} }),
            /unknown|not found|invalid/iu,
          );

          const controller = new AbortController();
          controller.abort("cancelled by test");
          await assert.rejects(
            client.callTool(
              { name: "get_context", arguments: {} },
              { signal: controller.signal },
            ),
            /cancel/iu,
          );
        } finally {
          await client.close();
        }
        assert.equal(transport.pid, null, "client close must reap the MCP child process");
      });
    });
  }

  it("reports cross-process mutation contention as a retryable tool error", async () => {
    await withAsyncWorkspace(async (root) => {
      seedWorkspace(root);
      const layout = ensureWorkspaceLayout(root);
      const lock = new WorkspaceMutationLock(layout);
      const owner = lock.acquire("cli:rebuild:held");
      const client = new Client({ name: "lock-contention-test", version: "1.0.0" });
      const transport = new StdioClientTransport({
        command: process.execPath,
        args: [mcpEntrypoint, "--workspace", root],
        stderr: "pipe",
      });

      try {
        await client.connect(transport);
        const result = await client.callTool({ name: "rebuild_index", arguments: {} });
        assert.equal(result.isError, true);
        assert.match(textContent(result.content), /already in progress|retry/iu);
      } finally {
        await client.close();
        lock.release(owner);
      }
    });
  });

  it("keeps MCP and Zod dependencies out of domain modules", () => {
    const domainRoot = new URL("../src/domain/", import.meta.url);
    for (const relativePath of listTypeScriptSources(domainRoot)) {
      const source = readFileSync(new URL(relativePath, domainRoot), "utf8");
      assert.doesNotMatch(source, /from\s+["'](?:@modelcontextprotocol|zod)/u);
    }

    const mcpRoot = new URL("../src/mcp/", import.meta.url);
    const externalImports = listTypeScriptSources(mcpRoot).flatMap((relativePath) => {
      const source = readFileSync(new URL(relativePath, mcpRoot), "utf8");
      return [...source.matchAll(/from\s+["']([^"']+)["']/gu)]
        .map((match) => match[1] ?? "")
        .filter((target) => !target.startsWith(".") && !target.startsWith("node:"));
    });
    assert.ok(externalImports.every((target) => target.startsWith("@modelcontextprotocol/") || target === "zod/v4"));
  });
});

const mcpEntrypoint = new URL("../src/mcp/main.js", import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/u,
  "$1",
);

function field(
  name: string,
  valueType: CapabilityPayloadField["valueType"],
  required: boolean,
  description: string,
): CapabilityPayloadField {
  return { name, valueType, required, description };
}

function testDescriptor(inputFields: readonly CapabilityPayloadField[]): McpToolDescriptor {
  return {
    surface: "mcp",
    capabilityName: "get_context",
    toolName: "test_tool",
    title: "Test Tool",
    summary: "Test schema conversion.",
    governanceRequired: false,
    inputFields,
    trace: { stories: [], nfrs: [], risks: [] },
  };
}

function testLock(
  root: string,
  overrides: {
    readonly token: () => string;
    readonly now?: () => Date;
    readonly isProcessRunning?: (pid: number) => boolean;
  },
): WorkspaceMutationLock {
  return new WorkspaceMutationLock(ensureWorkspaceLayout(root), {
    host: "test-host",
    processId: 101,
    staleAfterMs: 10 * 60 * 1000,
    ...overrides,
  });
}

function withWorkspace(run: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "agent-memory-bolt12-lock-"));
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

async function withAsyncWorkspace(run: (root: string) => Promise<void>): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), "agent-memory-bolt12-mcp-"));
  try {
    await run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function seedWorkspace(root: string): void {
  writeWorkspaceFile(
    root,
    "PROJECT_STATUS.md",
    "# Project Status\n\n## Current Status\n\nConstruction.\n\n## Project Goal\n\nShip agent memory.\n\n## Next Steps\n\nComplete BOLT-12.\n",
  );
  writeWorkspaceFile(
    root,
    "docs/01-inception/03-nfrs/nfrs.md",
    "# NFRs\n\n## Approval Status\n\nApproved by user on 2026-06-04.\n\n## Body\n\nNFR-001 startup retrieval.\n",
  );
}

function writeWorkspaceFile(root: string, relativePath: string, content: string): void {
  const absolutePath = join(root, ...relativePath.split("/"));
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
}

function listTypeScriptSources(root: URL): readonly string[] {
  const paths: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      paths.push(
        ...listTypeScriptSources(new URL(`${entry.name}/`, root)).map(
          (child) => `${entry.name}/${child}`,
        ),
      );
    } else if (entry.name.endsWith(".ts")) {
      paths.push(entry.name);
    }
  }
  return paths;
}

function textContent(content: readonly { type: string; text?: string }[]): string {
  return content
    .filter((item): item is { type: "text"; text: string } => item.type === "text")
    .map((item) => item.text)
    .join("\n");
}