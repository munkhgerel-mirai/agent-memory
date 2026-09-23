import { basename } from "node:path";
import { randomUUID } from "node:crypto";

import { McpServer } from "@modelcontextprotocol/server";

import { createLocalCapabilityRouter } from "../application/local-capability-router.js";
import {
  MCP_TOOL_DESCRIPTORS,
  createCapabilityRequest,
  createInvocationContext,
  type CapabilityPayload,
  type CapabilityResponse,
} from "../domain/framework-agnostic-integration.js";
import { WorkspaceMemoryStore } from "../storage/workspace-memory-store.js";
import { mcpInputSchema } from "./tool-schema.js";

export interface CreateAgentMemoryMcpServerOptions {
  readonly workspaceRoot: string;
  readonly now?: () => string;
  readonly requestId?: () => string;
}

export function createAgentMemoryMcpServer(
  options: CreateAgentMemoryMcpServerOptions,
): McpServer {
  const now = options.now ?? (() => new Date().toISOString());
  const requestId = options.requestId ?? randomUUID;
  const store = WorkspaceMemoryStore.open({
    workspaceRoot: options.workspaceRoot,
    actor: "mcp",
    now,
  });
  const router = createLocalCapabilityRouter(store, now);
  const server = new McpServer({ name: "agent-memory", version: "0.1.0" });

  for (const descriptor of MCP_TOOL_DESCRIPTORS) {
    server.registerTool(
      descriptor.toolName,
      {
        title: descriptor.title,
        description: descriptor.summary,
        inputSchema: mcpInputSchema(descriptor),
        annotations: {
          readOnlyHint: ["get_context", "query_memory", "inspect_memory"].includes(
            descriptor.capabilityName,
          ),
          destructiveHint: descriptor.capabilityName === "delete_memory",
          idempotentHint: ["get_context", "query_memory", "inspect_memory", "rebuild_index"].includes(
            descriptor.capabilityName,
          ),
        },
      },
      async (payload) => {
        try {
          const response = router.invokeCapability(
            createCapabilityRequest({
              requestId: `mcp:${descriptor.toolName}:${requestId()}`,
              capabilityName: descriptor.capabilityName,
              context: createInvocationContext({
                actor: "mcp-client",
                workspaceId: basename(store.layout.workspaceRoot),
                requestedSurface: "mcp",
                purpose: `MCP client invoked ${descriptor.toolName}.`,
                requestedAt: now(),
                workspacePath: store.layout.workspaceRoot,
              }),
              payload: payload as CapabilityPayload,
            }),
          );
          return capabilityToolResult(response);
        } catch (error) {
          return {
            content: [{ type: "text", text: safeErrorMessage(error) }],
            isError: true,
          };
        }
      },
    );
  }

  server.server.onclose = () => store.close();
  return server;
}

export function capabilityToolResult(response: CapabilityResponse) {
  const incomplete =
    response.status === "completed" &&
    typeof response.payload === "object" &&
    response.payload !== null &&
    "outcome" in response.payload &&
    response.payload.outcome === "incomplete";
  const document = JSON.parse(JSON.stringify(response)) as Record<string, unknown>;

  return {
    content: [{ type: "text" as const, text: JSON.stringify(document) }],
    structuredContent: document,
    isError: response.status !== "completed" || incomplete,
  };
}

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.name === "WorkspaceMutationLockError"
      ? error.message
      : `Agent-memory tool execution failed: ${error.message}`;
  }
  return "Agent-memory tool execution failed.";
}