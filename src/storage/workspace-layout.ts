import { mkdirSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

export class WorkspaceLayoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceLayoutError";
  }
}

/** Derived state lives beside the workspace it describes, per the BOLT-09-Q1 decision. */
export const AGENT_MEMORY_DIRECTORY = ".agent-memory";
export const MEMORY_EVENT_LOG_FILENAME = "events.jsonl";
export const MEMORY_INDEX_FILENAME = "index.sqlite";

export interface WorkspaceLayout {
  readonly workspaceRoot: string;
  readonly stateDirectory: string;
  readonly eventLogPath: string;
  readonly indexPath: string;
}

export function resolveWorkspaceLayout(workspaceRoot: string): WorkspaceLayout {
  if (typeof workspaceRoot !== "string" || workspaceRoot.trim().length === 0) {
    throw new WorkspaceLayoutError("Workspace root is required.");
  }

  const root = resolve(workspaceRoot.trim());
  const stateDirectory = join(root, AGENT_MEMORY_DIRECTORY);

  return {
    workspaceRoot: root,
    stateDirectory,
    eventLogPath: join(stateDirectory, MEMORY_EVENT_LOG_FILENAME),
    indexPath: join(stateDirectory, MEMORY_INDEX_FILENAME),
  };
}

/**
 * Creates the state directory if it is missing. The workspace root itself must already exist:
 * this slice writes derived state, it does not conjure a workspace.
 */
export function ensureWorkspaceLayout(workspaceRoot: string): WorkspaceLayout {
  const layout = resolveWorkspaceLayout(workspaceRoot);

  let rootStats;
  try {
    rootStats = statSync(layout.workspaceRoot);
  } catch (error) {
    throw new WorkspaceLayoutError(
      `Workspace root is not readable: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!rootStats.isDirectory()) {
    throw new WorkspaceLayoutError(`Workspace root is not a directory: ${layout.workspaceRoot}`);
  }

  mkdirSync(layout.stateDirectory, { recursive: true });

  return layout;
}

/**
 * Guard used before every write. Persistence must never touch a durable source artifact, so
 * each target path is checked against the state directory rather than trusted by construction.
 */
export function isInsideStateDirectory(layout: WorkspaceLayout, targetPath: string): boolean {
  const target = isAbsolute(targetPath) ? resolve(targetPath) : resolve(layout.workspaceRoot, targetPath);
  const relativePath = relative(layout.stateDirectory, target);

  return (
    relativePath.length > 0 &&
    !relativePath.startsWith("..") &&
    !relativePath.startsWith(`..${sep}`) &&
    !isAbsolute(relativePath)
  );
}

export function assertInsideStateDirectory(layout: WorkspaceLayout, targetPath: string): void {
  if (!isInsideStateDirectory(layout, targetPath)) {
    throw new WorkspaceLayoutError(
      `Refusing to write outside ${AGENT_MEMORY_DIRECTORY}/: ${targetPath}`,
    );
  }
}
