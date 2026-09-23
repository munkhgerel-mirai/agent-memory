import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
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

import {
  AGENT_MEMORY_DIRECTORY,
  CLI_EXIT_CODES,
  CapabilityRouter,
  UNAVAILABLE_COMMANDS,
  exitCodeForStatus,
  helpText,
  missingRequiredFields,
  runCli,
  type CliResult,
} from "../src/index.js";

const timestamp = "2026-07-27T00:00:00.000Z";
const cliEntrypoint = new URL("../src/cli/main.js", import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/u,
  "$1",
);

const NFRS_PATH = "docs/01-inception/03-nfrs/nfrs.md";
const PLAN_PATH = "docs/02-construction/02-design-plan/example_plan.md";

describe("BOLT-10 CLI operator surface", () => {
  it("prints help generated from the approved command descriptors", () => {
    const result = run([], {});

    assert.equal(result.exitCode, CLI_EXIT_CODES.success);
    for (const command of ["context", "query", "inspect", "rebuild", "export", "delete", "write"]) {
      assert.ok(result.stdout.includes(command), `help must list ${command}`);
    }

    // Q2: unavailable commands stay visible with an honest marker.
    for (const command of Object.keys(UNAVAILABLE_COMMANDS)) {
      const line = helpText().split("\n").find((row) => row.trim().startsWith(command));
      assert.match(line ?? "", /not available yet/u, `${command} must be marked unavailable`);
    }
    assert.equal(helpText().includes("Exit codes:"), true);
    assert.deepEqual(run(["--help"], {}).exitCode, CLI_EXIT_CODES.success);
  });

  it("rejects an unknown command and an unknown flag with a usage error", () => {
    const unknownCommand = run(["exprot"], {});
    assert.equal(unknownCommand.exitCode, CLI_EXIT_CODES.usage);
    assert.match(unknownCommand.stderr, /Unknown command: exprot/u);
    assert.match(unknownCommand.stderr, /Usage: agent-memory/u);

    const unknownFlag = run(["query", "--nope"], {});
    assert.equal(unknownFlag.exitCode, CLI_EXIT_CODES.usage);
    assert.equal(unknownFlag.stdout, "");
  });

  it("refuses unavailable commands without pretending to succeed", () => {
    for (const command of Object.keys(UNAVAILABLE_COMMANDS)) {
      const result = run([command], {});

      assert.equal(result.exitCode, CLI_EXIT_CODES.unavailable, `${command} must exit 3`);
      assert.equal(result.stdout, "", `${command} must print nothing to stdout`);
      assert.match(result.stderr, /not available yet/u);
      assert.match(result.stderr, /Nothing was changed/u);
      assert.equal(/succeeded|completed|done/iu.test(result.stderr), false);
    }

  });

  it("exports selected memory to only the caller-named JSON path", () => {
    withWorkspace((root) => {
      seedWorkspace(root);
      run(["rebuild", "--workspace", root], {});
      const memoryId = jsonData<{ payload: readonly { record: { memoryId: string } }[] }>(
        run(["query", "NFR-001", "--workspace", root, "--json"], {}),
      ).payload[0]?.record.memoryId ?? "";
      const before = treeSnapshot(root);

      const result = run(
        [
          "export",
          memoryId,
          "--workspace",
          root,
          "--output",
          "portable.json",
          "--reason",
          "Round-trip test",
        ],
        { cwd: root },
      );

      assert.equal(result.exitCode, CLI_EXIT_CODES.success);
      assert.match(result.stdout, /Exported 1 memory record/u);
      const after = treeSnapshot(root);
      assert.deepEqual(after.filter((path) => !before.includes(path)), ["portable.json"]);
      const document = JSON.parse(readFileSync(join(root, "portable.json"), "utf8")) as {
        records: readonly { memoryId: string; provenance: { source: string } }[];
      };
      assert.equal(document.records[0]?.memoryId, memoryId);
      assert.equal(document.records[0]?.provenance.source, NFRS_PATH);
    });
  });

  it("requires confirmation, deletes memory, preserves the source, and survives rebuild", () => {
    withWorkspace((root) => {
      seedWorkspace(root);
      run(["rebuild", "--workspace", root], {});
      const memoryId = jsonData<{ payload: readonly { record: { memoryId: string } }[] }>(
        run(["query", "NFR-001", "--workspace", root, "--json"], {}),
      ).payload[0]?.record.memoryId ?? "";
      const sourcePath = join(root, ...NFRS_PATH.split("/"));
      const sourceBefore = readFileSync(sourcePath, "utf8");

      const refused = run(
        ["delete", memoryId, "--workspace", root, "--reason", "Obsolete memory"],
        {},
      );
      assert.equal(refused.exitCode, CLI_EXIT_CODES.usage);
      assert.match(refused.stderr, /requires --confirm/u);

      const deleted = run(
        [
          "delete",
          memoryId,
          "--workspace",
          root,
          "--reason",
          "Obsolete memory",
          "--confirm",
        ],
        {},
      );
      assert.equal(deleted.exitCode, CLI_EXIT_CODES.success);
      assert.match(deleted.stdout, /Source files were not modified or removed/u);
      assert.equal(readFileSync(sourcePath, "utf8"), sourceBefore);

      run(["rebuild", "--workspace", root], {});
      const query = run(["query", "NFR-001", "--workspace", root], {});
      assert.doesNotMatch(query.stdout, new RegExp(escapeRegExp(NFRS_PATH), "u"));
      assert.equal(readFileSync(sourcePath, "utf8"), sourceBefore);
    });
  });

  it("tells the operator to rebuild instead of building silently", () => {
    withWorkspace((root) => {
      seedWorkspace(root);

      for (const command of ["context", "query", "inspect"]) {
        const result = run([command, "--workspace", root], {});

        assert.equal(result.exitCode, CLI_EXIT_CODES.unavailable);
        assert.match(result.stderr, /has not been built yet/u);
        assert.match(result.stderr, /agent-memory rebuild/u);
      }

      // Q1: a read command must not create the state directory as a side effect.
      assert.equal(
        existsSync(join(root, AGENT_MEMORY_DIRECTORY)),
        false,
        "a read command must not create .agent-memory/",
      );
    });
  });

  it("rebuilds, then serves context, query, and inspect from the persisted index", () => {
    withWorkspace((root) => {
      seedWorkspace(root);

      const rebuilt = run(["rebuild", "--workspace", root], {});
      assert.equal(rebuilt.exitCode, CLI_EXIT_CODES.success);
      assert.match(rebuilt.stdout, /Rebuilt workspace memory/u);
      assert.match(rebuilt.stdout, /indexed 2/u);
      assert.match(rebuilt.stdout, /status: completed/u);

      const context = run(["context", "--workspace", root, "--goal", "NFR"], {});
      assert.equal(context.exitCode, CLI_EXIT_CODES.success);
      assert.match(context.stdout, /Startup context \(startup mode\)/u);
      assert.match(context.stdout, /NFR-001 content/u);

      const query = run(["query", "NFR-001", "--workspace", root], {});
      assert.equal(query.exitCode, CLI_EXIT_CODES.success);
      assert.match(query.stdout, /result/u);
      assert.match(query.stdout, new RegExp(escapeRegExp(NFRS_PATH), "u"));

      const queryJson = jsonData<{ payload: readonly { record: { memoryId: string } }[] }>(
        run(["query", "NFR-001", "--workspace", root, "--json"], {}),
      );
      const memoryId = queryJson.payload[0]?.record.memoryId ?? "";
      const inspect = run(["inspect", memoryId, "--workspace", root], {});
      assert.equal(inspect.exitCode, CLI_EXIT_CODES.success);
      assert.match(inspect.stdout, /Category: NfrMemory/u);
      assert.match(inspect.stdout, /Approval: approved/u);
    });
  });

  it("keeps the context pack within the startup token budget", () => {
    withWorkspace((root) => {
      seedWorkspace(root);
      run(["rebuild", "--workspace", root], {});

      const pack = jsonData(run(["context", "--workspace", root, "--json"], {})).payload as {
        estimatedTokens: number;
        tokenBudget: { maximumTokens: number };
      };

      assert.equal(pack.tokenBudget.maximumTokens, 2000);
      assert.ok(pack.estimatedTokens <= 2000, `context used ${pack.estimatedTokens} tokens`);
    });
  });

  it("emits a single parseable JSON document per command with --json", () => {
    withWorkspace((root) => {
      seedWorkspace(root);
      run(["rebuild", "--workspace", root], {});
      const memoryId = jsonData<{ payload: readonly { record: { memoryId: string } }[] }>(
        run(["query", "NFR-001", "--workspace", root, "--json"], {}),
      ).payload[0]?.record.memoryId ?? "";

      for (const argv of [
        ["rebuild", "--workspace", root, "--json"],
        ["context", "--workspace", root, "--json"],
        ["query", "NFR", "--workspace", root, "--json"],
        [
          "export",
          memoryId,
          "--workspace",
          root,
          "--output",
          join(root, "json-export.json"),
          "--reason",
          "JSON smoke test",
          "--json",
        ],
      ]) {
        const result = run(argv, {});
        assert.equal(result.stderr, "", `${argv[0]} --json must keep stdout clean`);

        const document = JSON.parse(result.stdout) as Record<string, unknown>;
        assert.equal(document.command, argv[0]);
        assert.equal(document.exitCode, result.exitCode);
        assert.ok(typeof document.status === "string");
      }
    });
  });

  it("builds memory before a read only when --rebuild is given", () => {
    withWorkspace((root) => {
      seedWorkspace(root);

      const result = run(["context", "--workspace", root, "--rebuild"], {});

      assert.equal(result.exitCode, CLI_EXIT_CODES.success);
      assert.equal(existsSync(join(root, AGENT_MEMORY_DIRECTORY)), true);
      assert.match(result.stdout, /Startup context/u);
    });
  });

  it("writes nothing outside the state directory when reading", () => {
    withWorkspace((root) => {
      seedWorkspace(root);
      run(["rebuild", "--workspace", root], {});

      const before = treeSnapshot(root);
      run(["context", "--workspace", root], {});
      run(["query", "NFR", "--workspace", root], {});
      const after = treeSnapshot(root);

      const added = after.filter((path) => !before.includes(path));
      const removed = before.filter((path) => !after.includes(path));

      assert.deepEqual(removed, [], "a read command must not delete anything");
      assert.deepEqual(
        added.filter((path) => !path.startsWith(`${AGENT_MEMORY_DIRECTORY}/`)),
        [],
        "a read command must not write outside the state directory",
      );
    });
  });

  it("maps every capability status onto a distinct exit code", () => {
    assert.equal(exitCodeForStatus("completed"), CLI_EXIT_CODES.success);
    assert.equal(exitCodeForStatus("validation_error"), CLI_EXIT_CODES.usage);
    assert.equal(exitCodeForStatus("denied"), CLI_EXIT_CODES.denied);
    assert.equal(exitCodeForStatus("approval_required"), CLI_EXIT_CODES.approvalRequired);

    // Both mean "validated but nothing ran", so neither may exit zero.
    assert.equal(exitCodeForStatus("accepted"), CLI_EXIT_CODES.unavailable);
    assert.equal(exitCodeForStatus("not_implemented"), CLI_EXIT_CODES.unavailable);
  });

  it("treats a missing required argument as a usage error, not an unsupported feature", () => {
    withWorkspace((root) => {
      seedWorkspace(root);
      run(["rebuild", "--workspace", root], {});

      // Required arguments are derived from the approved BOLT-05 input fields.
      assert.deepEqual(missingRequiredFields("inspect", {}), ["memoryId"]);
      assert.deepEqual(missingRequiredFields("query", {}), ["query"]);
      assert.deepEqual(missingRequiredFields("context", {}), []);
      assert.deepEqual(missingRequiredFields("rebuild", {}), []);

      const inspect = run(["inspect", "--workspace", root], {});
      assert.equal(inspect.exitCode, CLI_EXIT_CODES.usage);
      assert.match(inspect.stderr, /inspect requires --memoryId/u);

      const query = run(["query", "--workspace", root], {});
      assert.equal(query.exitCode, CLI_EXIT_CODES.usage);
      assert.match(query.stderr, /query requires --query/u);

      const badLimit = run(["query", "NFR", "--workspace", root, "--limit", "zero"], {});
      assert.equal(badLimit.exitCode, CLI_EXIT_CODES.unexpected);
      assert.match(badLimit.stderr, /positive integer/u);
    });
  });

  it("wires get_context and rebuild_index so neither reports an unexecuted status", () => {
    withWorkspace((root) => {
      seedWorkspace(root);
      run(["rebuild", "--workspace", root], {});

      // Without handlers the router returns not_implemented for get_context and an
      // unexecuted accepted for rebuild_index. The CLI must no longer see either.
      const unwired = new CapabilityRouter({ now: () => timestamp });
      assert.equal(capabilityStatus(unwired, "get_context"), "not_implemented");
      assert.equal(capabilityStatus(unwired, "rebuild_index"), "accepted");

      assert.equal(jsonData(run(["context", "--workspace", root, "--json"], {})) !== undefined, true);
      assert.equal(
        JSON.parse(run(["context", "--workspace", root, "--json"], {}).stdout).status,
        "completed",
      );
      assert.equal(
        JSON.parse(run(["rebuild", "--workspace", root, "--json"], {}).stdout).status,
        "completed",
      );
    });
  });

  it("runs as an installed binary through the package bin entrypoint", () => {
    withWorkspace((root) => {
      seedWorkspace(root);

      const rebuilt = execFileSync(process.execPath, [cliEntrypoint, "rebuild", "--workspace", root], {
        encoding: "utf8",
      });
      assert.match(rebuilt, /Rebuilt workspace memory/u);

      const context = execFileSync(process.execPath, [cliEntrypoint, "context", "--workspace", root], {
        encoding: "utf8",
      });
      assert.match(context, /Startup context/u);

      // A real export with missing required arguments must surface a usage status to the shell.
      let exitCode = 0;
      try {
        execFileSync(process.execPath, [cliEntrypoint, "export"], { encoding: "utf8", stdio: "pipe" });
      } catch (error) {
        exitCode = (error as { status?: number }).status ?? 0;
      }
      assert.equal(exitCode, CLI_EXIT_CODES.usage);
    });
  });
});

function run(argv: readonly string[], options: { readonly cwd?: string }): CliResult {
  return runCli(argv, { cwd: options.cwd ?? process.cwd(), now: () => timestamp });
}

function jsonData<T = Record<string, unknown>>(result: CliResult): T {
  return (JSON.parse(result.stdout) as { data: T }).data;
}

function capabilityStatus(router: CapabilityRouter, capabilityName: "get_context" | "rebuild_index") {
  return router.invokeCapability({
    requestId: "probe",
    capabilityName,
    context: {
      actor: "probe",
      workspaceId: "probe",
      requestedSurface: "internal",
      purpose: "Probe unwired router behaviour.",
      requestedAt: timestamp,
    },
    payload: {},
  }).status;
}

function withWorkspace(runTest: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "agent-memory-bolt10-"));
  try {
    runTest(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function seedWorkspace(root: string): void {
  writeWorkspaceFile(
    root,
    NFRS_PATH,
    "# NFRs\n\n## Approval Status\n\nApproved by user on 2026-06-04.\n\n## Body\n\nNFR-001 content about startup retrieval.\n",
  );
  writeWorkspaceFile(
    root,
    PLAN_PATH,
    "# Example Plan\n\n## Approval Status\n\nPending human review.\n\n## Purpose\n\nPlan body.\n",
  );
}

function writeWorkspaceFile(root: string, relativePath: string, content: string): void {
  const absolutePath = join(root, ...relativePath.split("/"));
  mkdirSync(join(absolutePath, ".."), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
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

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
