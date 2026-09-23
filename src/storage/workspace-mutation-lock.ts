import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { hostname } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import {
  assertInsideStateDirectory,
  type WorkspaceLayout,
} from "./workspace-layout.js";

export const WORKSPACE_MUTATION_LOCK_FILENAME = "mutation.lock";
export const DEFAULT_STALE_LOCK_AGE_MS = 10 * 60 * 1000;

export class WorkspaceMutationLockError extends Error {
  readonly retryable = true;

  constructor(message: string) {
    super(message);
    this.name = "WorkspaceMutationLockError";
  }
}

export interface WorkspaceMutationLockOwner {
  readonly token: string;
  readonly pid: number;
  readonly hostname: string;
  readonly operationId: string;
  readonly acquiredAt: string;
}

export interface WorkspaceMutationLockOptions {
  readonly now?: () => Date;
  readonly processId?: number;
  readonly host?: string;
  readonly token?: () => string;
  readonly staleAfterMs?: number;
  readonly isProcessRunning?: (pid: number) => boolean;
}

export class WorkspaceMutationLock {
  readonly path: string;
  private readonly now: () => Date;
  private readonly processId: number;
  private readonly host: string;
  private readonly token: () => string;
  private readonly staleAfterMs: number;
  private readonly isProcessRunning: (pid: number) => boolean;

  constructor(
    private readonly layout: WorkspaceLayout,
    options: WorkspaceMutationLockOptions = {},
  ) {
    this.path = join(layout.stateDirectory, WORKSPACE_MUTATION_LOCK_FILENAME);
    assertInsideStateDirectory(layout, this.path);
    this.now = options.now ?? (() => new Date());
    this.processId = options.processId ?? process.pid;
    this.host = options.host ?? hostname();
    this.token = options.token ?? randomUUID;
    this.staleAfterMs = options.staleAfterMs ?? DEFAULT_STALE_LOCK_AGE_MS;
    this.isProcessRunning = options.isProcessRunning ?? processIsRunning;
  }

  runExclusive<T>(operationId: string, operation: () => T): T {
    const owner = this.acquire(operationId);
    try {
      return operation();
    } finally {
      this.release(owner);
    }
  }

  acquire(operationId: string): WorkspaceMutationLockOwner {
    const owner = this.createOwner(operationId);

    try {
      this.createLockFile(owner);
      return owner;
    } catch (error) {
      if (!isAlreadyExistsError(error)) throw error;
    }

    if (this.removeStaleLock()) {
      try {
        this.createLockFile(owner);
        return owner;
      } catch (error) {
        if (!isAlreadyExistsError(error)) throw error;
      }
    }

    const current = this.readOwner();
    const currentLabel = current
      ? `${current.operationId} by PID ${current.pid} on ${current.hostname}`
      : "an unreadable owner";
    throw new WorkspaceMutationLockError(
      `Workspace mutation is already in progress (${currentLabel}). Retry after it completes.`,
    );
  }

  release(owner: WorkspaceMutationLockOwner): void {
    const current = this.readOwner();
    if (!current || current.token !== owner.token) return;
    unlinkSync(this.path);
  }

  private createOwner(operationId: string): WorkspaceMutationLockOwner {
    if (!operationId.trim()) {
      throw new WorkspaceMutationLockError("Workspace mutation operation ID is required.");
    }

    return {
      token: this.token(),
      pid: this.processId,
      hostname: this.host,
      operationId: operationId.trim(),
      acquiredAt: this.now().toISOString(),
    };
  }

  private createLockFile(owner: WorkspaceMutationLockOwner): void {
    assertInsideStateDirectory(this.layout, this.path);
    const descriptor = openSync(this.path, "wx");
    try {
      writeFileSync(descriptor, `${JSON.stringify(owner)}\n`, "utf8");
    } finally {
      closeSync(descriptor);
    }
  }

  private removeStaleLock(): boolean {
    const owner = this.readOwner();
    if (!owner) return false;

    const ageMs = this.now().getTime() - Date.parse(owner.acquiredAt);
    if (
      !Number.isFinite(ageMs) ||
      ageMs < this.staleAfterMs ||
      owner.hostname !== this.host ||
      this.isProcessRunning(owner.pid)
    ) {
      return false;
    }

    const current = this.readOwner();
    if (!current || current.token !== owner.token) return false;
    unlinkSync(this.path);
    return true;
  }

  private readOwner(): WorkspaceMutationLockOwner | undefined {
    if (!existsSync(this.path)) return undefined;
    try {
      const value = JSON.parse(readFileSync(this.path, "utf8")) as Partial<WorkspaceMutationLockOwner>;
      if (
        typeof value.token !== "string" ||
        typeof value.pid !== "number" ||
        typeof value.hostname !== "string" ||
        typeof value.operationId !== "string" ||
        typeof value.acquiredAt !== "string"
      ) {
        return undefined;
      }
      return value as WorkspaceMutationLockOwner;
    } catch {
      return undefined;
    }
  }
}

function processIsRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

function isAlreadyExistsError(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === "EEXIST";
}