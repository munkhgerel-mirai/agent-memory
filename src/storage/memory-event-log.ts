import { appendFileSync, existsSync, readFileSync } from "node:fs";

import {
  createMemoryEventRecord,
  type MemoryEventRecord,
  type RebuildWarning,
} from "../domain/local-workspace-storage.js";
import { assertInsideStateDirectory, type WorkspaceLayout } from "./workspace-layout.js";

export class MemoryEventLogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MemoryEventLogError";
  }
}

export interface MemoryEventLogReadResult {
  readonly events: readonly MemoryEventRecord[];
  readonly warnings: readonly RebuildWarning[];
  readonly totalLines: number;
  readonly skippedLineNumbers: readonly number[];
}

/**
 * Append-only JSONL log of memory history. Per the BOLT-09-Q5 decision this file is never
 * rewritten or truncated, and per BOLT-09-Q3 a malformed line is reported and skipped rather
 * than throwing, so one corrupt line cannot make a workspace unreadable.
 */
export class MemoryEventLog {
  constructor(private readonly layout: WorkspaceLayout) {
    assertInsideStateDirectory(layout, layout.eventLogPath);
  }

  get path(): string {
    return this.layout.eventLogPath;
  }

  exists(): boolean {
    return existsSync(this.layout.eventLogPath);
  }

  append(records: readonly MemoryEventRecord[]): number {
    if (records.length === 0) return 0;

    assertInsideStateDirectory(this.layout, this.layout.eventLogPath);
    const payload = records.map((record) => `${JSON.stringify(record)}\n`).join("");
    appendFileSync(this.layout.eventLogPath, payload, "utf8");

    return records.length;
  }

  read(): MemoryEventLogReadResult {
    if (!this.exists()) {
      return { events: [], warnings: [], totalLines: 0, skippedLineNumbers: [] };
    }

    let raw: string;
    try {
      raw = readFileSync(this.layout.eventLogPath, "utf8");
    } catch (error) {
      throw new MemoryEventLogError(
        `Event log is not readable: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const events: MemoryEventRecord[] = [];
    const warnings: RebuildWarning[] = [];
    const skippedLineNumbers: number[] = [];
    const lines = raw.replaceAll("\r\n", "\n").split("\n");
    let totalLines = 0;

    for (const [index, line] of lines.entries()) {
      const trimmed = line.trim();
      if (trimmed.length === 0) continue;

      totalLines += 1;
      const lineNumber = index + 1;
      const event = this.parseLine(trimmed, lineNumber, warnings);

      if (event) {
        events.push(event);
      } else {
        skippedLineNumbers.push(lineNumber);
      }
    }

    return { events, warnings, totalLines, skippedLineNumbers };
  }

  private parseLine(
    line: string,
    lineNumber: number,
    warnings: RebuildWarning[],
  ): MemoryEventRecord | undefined {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch (error) {
      warnings.push({
        message: `Event log line ${lineNumber} is not valid JSON and was skipped: ${errorMessage(error)}`,
      });
      return undefined;
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      warnings.push({
        message: `Event log line ${lineNumber} is not a JSON object and was skipped.`,
      });
      return undefined;
    }

    try {
      // Validated through the approved factory, so a structurally valid but contract-invalid
      // record is caught here rather than corrupting the projection later.
      return createMemoryEventRecord(parsed as Parameters<typeof createMemoryEventRecord>[0]);
    } catch (error) {
      warnings.push({
        sourcePath: readOptionalString(parsed, "sourcePath"),
        message: `Event log line ${lineNumber} is not a valid memory event and was skipped: ${errorMessage(error)}`,
      });
      return undefined;
    }
  }
}

function readOptionalString(value: object, key: string): string | undefined {
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" && candidate.trim().length > 0 ? candidate : undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
