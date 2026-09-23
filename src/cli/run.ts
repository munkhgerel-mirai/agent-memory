import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

import {
  CLI_COMMAND_DESCRIPTORS,
  createCapabilityRequest,
  createInvocationContext,
  requireCapabilityDefinition,
  type CapabilityName,
  type CapabilityResponse,
  type CapabilityResponseStatus,
} from "../domain/framework-agnostic-integration.js";
import type { ContextPack } from "../domain/retrieval-context.js";
import type {
  LocalMemorySearchResult,
  ProjectedMemoryRecord,
} from "../domain/local-workspace-storage.js";
import { resolveWorkspaceLayout } from "../storage/workspace-layout.js";
import {
  WorkspaceMemoryStore,
  type WorkspaceMemoryRebuildResult,
} from "../storage/workspace-memory-store.js";
import {
  createLocalCapabilityRouter,
  rebuildWorkspaceMemory,
} from "../application/local-capability-router.js";

export const CLI_NAME = "agent-memory";

export const CLI_EXIT_CODES = {
  success: 0,
  unexpected: 1,
  usage: 2,
  unavailable: 3,
  denied: 4,
  approvalRequired: 5,
} as const;

export type CliExitCode = (typeof CLI_EXIT_CODES)[keyof typeof CLI_EXIT_CODES];

/** Commands whose capability is defined and governed, but whose execution is a later bolt. */
export const UNAVAILABLE_COMMANDS: Readonly<Record<string, string>> = {
  write: "Governed write execution lands in a later bolt.",
};

export const COMMAND_TO_CAPABILITY: Readonly<Record<string, CapabilityName>> = {
  context: "get_context",
  query: "query_memory",
  inspect: "inspect_memory",
  rebuild: "rebuild_index",
  export: "export_memory",
  delete: "delete_memory",
  write: "write_memory",
};

export interface CliResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export interface RunCliOptions {
  readonly cwd?: string;
  readonly now?: () => string;
}

const CLI_OPTIONS = {
  workspace: { type: "string" },
  json: { type: "boolean", default: false },
  help: { type: "boolean", short: "h", default: false },
  rebuild: { type: "boolean", default: false },
  goal: { type: "string" },
  phase: { type: "string" },
  query: { type: "string" },
  category: { type: "string" },
  limit: { type: "string" },
  "memory-id": { type: "string" },
  output: { type: "string" },
  reason: { type: "string" },
  confirm: { type: "boolean", default: false },
} as const;

export function runCli(argv: readonly string[], options: RunCliOptions = {}): CliResult {
  const now = options.now ?? (() => new Date().toISOString());
  const cwd = options.cwd ?? process.cwd();

  let parsed: ReturnType<typeof parseArgs<{ options: typeof CLI_OPTIONS; allowPositionals: true }>>;
  try {
    parsed = parseArgs({
      args: [...argv],
      options: CLI_OPTIONS,
      allowPositionals: true,
      strict: true,
    });
  } catch (error) {
    return usageFailure(errorMessage(error));
  }

  const [command, ...positionals] = parsed.positionals;
  const flags = parsed.values;

  if (flags.help || command === undefined || command === "help") {
    return { exitCode: CLI_EXIT_CODES.success, stdout: `${helpText()}\n`, stderr: "" };
  }

  if (!(command in COMMAND_TO_CAPABILITY)) {
    return usageFailure(`Unknown command: ${command}`);
  }

  const unavailableReason = UNAVAILABLE_COMMANDS[command];
  if (unavailableReason) {
    return unavailable(command, unavailableReason, flags.json === true);
  }

  if (command === "delete" && flags.confirm !== true) {
    return usageFailure(
      "delete requires --confirm. This removes memory from retrieval but does not delete the source file.",
    );
  }

  try {
    return runWorkspaceCommand(command, positionals, flags, { cwd, now });
  } catch (error) {
    return {
      exitCode: CLI_EXIT_CODES.unexpected,
      stdout: "",
      stderr: `${CLI_NAME}: ${errorMessage(error)}\n`,
    };
  }
}

type CliFlags = ReturnType<
  typeof parseArgs<{ options: typeof CLI_OPTIONS; allowPositionals: true }>
>["values"];

function runWorkspaceCommand(
  command: string,
  positionals: readonly string[],
  flags: CliFlags,
  context: { readonly cwd: string; readonly now: () => string },
): CliResult {
  const workspaceRoot = flags.workspace?.trim() || context.cwd;
  const json = flags.json === true;

  if (command !== "rebuild" && !flags.rebuild) {
    // Q1: reads never build. Checked before opening the store, because opening it would
    // create `.agent-memory/` and make a read command a writer.
    const layout = resolveWorkspaceLayout(workspaceRoot);
    if (!existsSync(layout.indexPath)) {
      return notBuilt(command, json);
    }
  }

  const store = WorkspaceMemoryStore.open({ workspaceRoot, now: context.now });
  try {
    if (command === "rebuild" || flags.rebuild) {
      const result = rebuildWorkspaceMemory(store, `rebuild:${context.now()}`);
      if (command === "rebuild") {
        return renderRebuild(result, json);
      }
    }

    if (store.countProjections() === 0) {
      return notBuilt(command, json);
    }

    const payload = payloadFor(command, positionals, flags, context.cwd);
    const missing = missingRequiredFields(command, payload);
    if (missing.length > 0) {
      return usageFailure(
        `${command} requires ${missing.map((field) => `--${field}`).join(", ")}.`,
      );
    }

    const router = createLocalCapabilityRouter(store, context.now);
    const response = invoke(router, command, payload, context.now);

    return renderResponse(command, response, json);
  } finally {
    store.close();
  }
}

function invoke(
  router: ReturnType<typeof createLocalCapabilityRouter>,
  command: string,
  payload: Record<string, unknown>,
  now: () => string,
): CapabilityResponse {
  return router.invokeCapability(
    createCapabilityRequest({
      requestId: `cli:${command}:${now()}`,
      capabilityName: capabilityFor(command),
      context: createInvocationContext({
        actor: "cli",
        workspaceId: "workspace",
        requestedSurface: "cli",
        purpose: `Operator ran ${CLI_NAME} ${command}.`,
        requestedAt: now(),
      }),
      payload,
    }),
  );
}

function capabilityFor(command: string): CapabilityName {
  const capabilityName = COMMAND_TO_CAPABILITY[command];
  if (!capabilityName) {
    throw new Error(`No capability is mapped to command ${command}.`);
  }

  return capabilityName;
}

/**
 * Required arguments come from the approved BOLT-05 input fields, so the CLI cannot drift from
 * the capability contract. Without this, a missing argument reaches the router and surfaces as
 * `not_implemented`, which reads as "unsupported" when the real problem is a usage mistake.
 */
export function missingRequiredFields(
  command: string,
  payload: Readonly<Record<string, unknown>>,
): readonly string[] {
  return requireCapabilityDefinition(capabilityFor(command))
    .inputFields.filter((field) => field.required && payload[field.name] === undefined)
    .map((field) => field.name);
}

function payloadFor(
  command: string,
  positionals: readonly string[],
  flags: CliFlags,
  cwd: string,
): Record<string, unknown> {
  if (command === "context") {
    return dropUndefined({ goal: flags.goal, phase: flags.phase, query: flags.query });
  }

  if (command === "query") {
    return dropUndefined({
      query: flags.query ?? positionals[0],
      category: flags.category,
      limit: parseLimit(flags.limit),
    });
  }

  if (command === "inspect") {
    return dropUndefined({ memoryId: flags["memory-id"] ?? positionals[0] });
  }

  if (command === "export") {
    const targetMemoryIds = flags["memory-id"]
      ? [flags["memory-id"], ...positionals]
      : positionals;
    return dropUndefined({
      targetMemoryIds: targetMemoryIds.length > 0 ? targetMemoryIds : undefined,
      reason: flags.reason,
      outputPath: flags.output ? resolve(cwd, flags.output) : undefined,
      includeProvenance: true,
    });
  }

  if (command === "delete") {
    const targetMemoryIds = flags["memory-id"]
      ? [flags["memory-id"], ...positionals]
      : positionals;
    return dropUndefined({
      targetMemoryIds: targetMemoryIds.length > 0 ? targetMemoryIds : undefined,
      reason: flags.reason,
      confirmationEvidence: flags.confirm ? "cli:--confirm" : undefined,
    });
  }

  return {};
}

function renderRebuild(result: WorkspaceMemoryRebuildResult, json: boolean): CliResult {
  const outcome = result.run.outcome;
  const exitCode = CLI_EXIT_CODES.success;

  if (json) {
    return jsonResult("rebuild", outcome?.status ?? "completed", exitCode, {
      stateDirectory: result.layout.stateDirectory,
      candidates: result.scan.candidateFileCount,
      indexed: result.scan.observations.length,
      excluded: result.scan.skipped.length,
      outcome,
      appendedEvents: result.appendedEvents.length,
      supersededEvents: result.supersededEventCount,
      warnings: result.run.warnings,
    });
  }

  const lines = [
    `Rebuilt workspace memory at ${result.layout.stateDirectory}`,
    `  scanned ${result.scan.candidateFileCount} candidates, indexed ${result.scan.observations.length}, excluded ${result.scan.skipped.length}`,
    `  created ${outcome?.createdCount ?? 0}, updated ${outcome?.updatedCount ?? 0}, removed ${outcome?.removedCount ?? 0}, unchanged ${outcome?.unchangedCount ?? 0}`,
    `  status: ${outcome?.status ?? "completed"}`,
  ];

  for (const warning of result.run.warnings) {
    lines.push(`  warning: ${warning.sourcePath ? `${warning.sourcePath}: ` : ""}${warning.message}`);
  }

  return { exitCode, stdout: `${lines.join("\n")}\n`, stderr: "" };
}

function renderResponse(command: string, response: CapabilityResponse, json: boolean): CliResult {
  if (
    command === "delete" &&
    response.status === "completed" &&
    isIncompleteDeleteResult(response.payload)
  ) {
    if (json) {
      return jsonResult(command, "incomplete", CLI_EXIT_CODES.unexpected, {
        message: "Delete cleanup is incomplete and retryable.",
        governanceDecision: response.governanceDecision,
        payload: response.payload,
      });
    }

    return {
      exitCode: CLI_EXIT_CODES.unexpected,
      stdout: "",
      stderr: `${CLI_NAME}: delete cleanup is incomplete and retryable.\n`,
    };
  }

  const exitCode = exitCodeForStatus(response.status);

  if (json) {
    return jsonResult(command, response.status, exitCode, {
      message: response.message,
      governanceDecision: response.governanceDecision,
      payload: response.payload,
    });
  }

  if (response.status !== "completed") {
    return {
      exitCode,
      stdout: "",
      stderr: `${CLI_NAME}: ${command} did not complete (${response.status}). ${response.message}\n`,
    };
  }

  return { exitCode, stdout: renderPayload(command, response.payload), stderr: "" };
}

function isIncompleteDeleteResult(payload: unknown): payload is { readonly outcome: "incomplete" } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "outcome" in payload &&
    payload.outcome === "incomplete"
  );
}

function renderPayload(command: string, payload: unknown): string {
  if (command === "context") return `${renderContextPack(payload as ContextPack)}\n`;
  if (command === "query") return `${renderSearchResults(payload as readonly LocalMemorySearchResult[])}\n`;
  if (command === "inspect") return `${renderRecord(payload as ProjectedMemoryRecord | undefined)}\n`;

  if (command === "export") {
    const result = payload as { readonly outputPath: string; readonly document: { readonly records: readonly unknown[] } };
    return `Exported ${result.document.records.length} memory record${result.document.records.length === 1 ? "" : "s"} to ${result.outputPath}\n`;
  }
  if (command === "delete") {
    const result = payload as {
      readonly outcome: string;
      readonly deletedMemoryIds: readonly string[];
      readonly sourceFilesModified: false;
    };
    return [
      `Deleted ${result.deletedMemoryIds.length} memory record${result.deletedMemoryIds.length === 1 ? "" : "s"} from active retrieval.`,
      "Source files were not modified or removed.",
      `Cleanup status: ${result.outcome}`,
    ].join("\n") + "\n";
  }

  return `${JSON.stringify(payload, null, 2)}\n`;
}

function renderContextPack(pack: ContextPack): string {
  const header = [
    `Startup context (${pack.mode} mode)`,
    `  tokens ${pack.estimatedTokens} / ${pack.tokenBudget.maximumTokens}`,
    `  items ${pack.items.length}, omitted ${pack.omittedCandidateCount}`,
  ].join("\n");

  if (pack.items.length === 0) {
    return `${header}\n\nNo memory matched this request.`;
  }

  const items = pack.items.map((item, index) =>
    [
      "",
      `--- ${index + 1}. ${item.sourcePath}`,
      `    ${item.category} · ${item.approvalStatus} · ~${item.tokenEstimate} tokens`,
      `    ${item.inclusionReason}`,
      "",
      item.content,
    ].join("\n"),
  );

  return `${header}\n${items.join("\n")}`;
}

function renderSearchResults(results: readonly LocalMemorySearchResult[]): string {
  if (results.length === 0) return "No results.";

  const lines = results.map(
    (result, index) =>
      `${String(index + 1).padStart(2)}. ${result.record.workspacePath}\n` +
      `    ${result.record.category} · ${result.record.approvalStatus} · score ${result.score}`,
  );

  return `${results.length} result${results.length === 1 ? "" : "s"}\n${lines.join("\n")}`;
}

function renderRecord(record: ProjectedMemoryRecord | undefined): string {
  if (!record) return "No memory record matched that identifier.";

  return [
    `Memory:   ${record.memoryId}`,
    `Source:   ${record.workspacePath}`,
    `Category: ${record.category} (${record.phase})`,
    `Approval: ${record.approvalStatus}`,
    `Version:  ${record.observedVersion}`,
    `Template: ${record.isTemplate ? "yes" : "no"}`,
    "",
    record.text,
  ].join("\n");
}

export function exitCodeForStatus(status: CapabilityResponseStatus): number {
  switch (status) {
    case "completed":
      return CLI_EXIT_CODES.success;
    case "validation_error":
      return CLI_EXIT_CODES.usage;
    case "denied":
      return CLI_EXIT_CODES.denied;
    case "approval_required":
      return CLI_EXIT_CODES.approvalRequired;
    case "accepted":
    case "not_implemented":
      // `accepted` means validated but never executed. Exiting zero here would tell an
      // operator that an export succeeded when no file was written.
      return CLI_EXIT_CODES.unavailable;
    default:
      return CLI_EXIT_CODES.unexpected;
  }
}

function notBuilt(command: string, json: boolean): CliResult {
  const message = `Workspace memory has not been built yet. Run: ${CLI_NAME} rebuild`;

  if (json) {
    return jsonResult(command, "not_built", CLI_EXIT_CODES.unavailable, { message }, false);
  }

  return {
    exitCode: CLI_EXIT_CODES.unavailable,
    stdout: "",
    stderr: `${CLI_NAME}: ${message}\n`,
  };
}

function unavailable(command: string, reason: string, json: boolean): CliResult {
  const message = `${command} is not available yet. ${reason} Nothing was changed.`;

  if (json) {
    return jsonResult(command, "not_implemented", CLI_EXIT_CODES.unavailable, { message }, false);
  }

  return {
    exitCode: CLI_EXIT_CODES.unavailable,
    stdout: "",
    stderr: `${CLI_NAME}: ${message}\n`,
  };
}

function usageFailure(message: string): CliResult {
  return {
    exitCode: CLI_EXIT_CODES.usage,
    stdout: "",
    stderr: `${CLI_NAME}: ${message}\n\n${helpText()}\n`,
  };
}

function jsonResult(
  command: string,
  status: string,
  exitCode: number,
  data: unknown,
  toStdout = true,
): CliResult {
  const document = `${JSON.stringify({ command, status, exitCode, data }, null, 2)}\n`;

  return toStdout
    ? { exitCode, stdout: document, stderr: "" }
    : { exitCode, stdout: document, stderr: "" };
}

/** Generated from the approved BOLT-05 descriptors so the help text cannot drift from them. */
export function helpText(): string {
  const rows = CLI_COMMAND_DESCRIPTORS.map((descriptor) => {
    const name = descriptor.command.replace(`${CLI_NAME} `, "");
    const marker = UNAVAILABLE_COMMANDS[name] ? "  (not available yet)" : "";
    return `  ${name.padEnd(10)} ${descriptor.title}${marker}`;
  });

  return [
    `Usage: ${CLI_NAME} <command> [options]`,
    "",
    "Commands:",
    ...rows,
    "",
    "Options:",
    "  --workspace <path>   Workspace root (default: current directory)",
    "  --rebuild            Rebuild memory before running a read command",
    "  --json               Emit a single JSON document",
    "  --goal <text>        Goal framing for context retrieval",
    "  --phase <phase>      Lifecycle phase filter",
    "  --query <text>       Search text",
    "  --category <name>    Lifecycle memory category filter",
    "  --limit <n>          Maximum results",
    "  --memory-id <id>     Memory identifier to inspect",
    "  --output <path>       Caller-selected export path",
    "  --reason <text>       Reason for a governed operation",
    "  --confirm             Confirm a destructive memory deletion",
    "  -h, --help           Show this help",
    "",
    "Exit codes:",
    "  0 success   2 usage error   3 not available yet   4 denied   5 approval required",
  ].join("\n");
}

function parseLimit(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;

  const limit = Number.parseInt(value, 10);
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error(`--limit must be a positive integer, received "${value}".`);
  }

  return limit;
}

function stringField(payload: Readonly<Record<string, unknown>>, key: string): string | undefined {
  const value = payload[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function dropUndefined(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
