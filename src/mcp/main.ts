#!/usr/bin/env node
import { parseArgs } from "node:util";

import { serveStdio } from "@modelcontextprotocol/server/stdio";

import { createAgentMemoryMcpServer } from "./server.js";

const parsed = parseArgs({
  args: process.argv.slice(2),
  options: { workspace: { type: "string" } },
  strict: true,
});
const workspaceRoot = parsed.values.workspace?.trim() || process.cwd();

const handle = serveStdio(() => createAgentMemoryMcpServer({ workspaceRoot }), {
  onerror: (error) => process.stderr.write(`agent-memory-mcp: ${error.message}\n`),
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void handle.close().finally(() => {
      process.exitCode = 0;
    });
  });
}