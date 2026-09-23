# Agent-memory

Agent-memory is a local-first lifecycle memory system for AI-Driven Development Lifecycle (AI-DLC) workspaces. It indexes durable project artifacts, preserves provenance and approval state, and returns compact context to human operators and MCP-capable agents.

## Release Status

The current target is a **0.1 MCP/CLI preview**.

- The preview is evidence-ready in the current working tree; it is not packaged, tagged, published, or distributed.
- CLI and stdio MCP surfaces are implemented.
- Markdown artifacts and the JSONL event log are durable sources; SQLite is a rebuildable local projection.
- Governed export and confirmation-gated memory deletion are implemented.
- The BOLT-13 local HTTP API is deferred until a named consumer requires it.
- US-003 lifecycle relationships and US-005 AC-003 local API access are deferred from the preview but remain required for full V1.
- This repository is not yet published to npm and has no approved deployment scope.

## Requirements

- Node.js 22.5.0 or newer
- npm
- A local AI-DLC workspace containing Markdown lifecycle artifacts

## Build And Verify

From the repository root:

```powershell
npm ci
npm run build
npm run typecheck
npm test
```

BOLT-14 focused checks are explicit because the scale fixture is intentionally larger than the ordinary regression suite:

```powershell
npm run test:v1-readiness
npm run test:v1-scale
```

The scale check generates an isolated temporary workspace with at least 1,000 lifecycle artifacts and 10,000 valid event records. It reports fixture generation, rebuild, CLI retrieval, and MCP retrieval timings separately.

## CLI

Build first, then invoke the local entrypoint:

```powershell
node dist/src/cli/main.js --help
node dist/src/cli/main.js rebuild --workspace D:\path\to\workspace
node dist/src/cli/main.js context --workspace D:\path\to\workspace
node dist/src/cli/main.js query "search terms" --workspace D:\path\to\workspace
```

Use `--json` for a single machine-readable response.

### Commands

| Command | Purpose |
|---------|---------|
| `rebuild` | Scan durable sources and rebuild the local SQLite projection. |
| `context` | Return a bounded, provenance-aware startup context pack. |
| `query` | Search lifecycle memory by text and optional filters. |
| `inspect` | Inspect one memory record and its metadata. |
| `export` | Write selected governed memories and provenance to a caller-selected JSON file. |
| `delete` | Append deletion tombstones and remove selected memories from active retrieval after confirmation. |
| `write` | Reserved in the shared capability contract; governed write execution is not implemented in this preview. |

Example export:

```powershell
node dist/src/cli/main.js export MEMORY_ID `
  --workspace D:\path\to\workspace `
  --output memory-export.json `
  --reason "Portable review copy"
```

Example deletion:

```powershell
node dist/src/cli/main.js delete MEMORY_ID `
  --workspace D:\path\to\workspace `
  --reason "No longer active memory" `
  --confirm
```

Deletion removes Agent-memory state; it does **not** modify or remove the source Markdown file. A durable tombstone prevents the deleted memory from returning on rebuild.

## MCP

The stdio MCP executable is built at `dist/src/mcp/main.js`. Start it with a workspace root:

```powershell
node dist/src/mcp/main.js --workspace D:\path\to\workspace
```

The server exposes seven descriptor-generated tools:

- `get_context`
- `query_memory`
- `inspect_memory`
- `rebuild_index`
- `export_memory`
- `delete_memory`
- `write_memory` — advertised honestly but remains approval-required/unimplemented

The checked-in `.vscode/mcp.json` runs the server against the open repository. After `npm run build`, use **MCP: List Servers** in VS Code, start and trust `agent-memory`, then approve tool calls from Copilot Chat Agent mode.

The server writes protocol messages only to stdout. Runtime diagnostics, including Node's current `node:sqlite` experimental warning, use stderr.

## Storage Model

Each workspace stores derived local state under `.agent-memory/`:

```text
.agent-memory/
  events.jsonl   append-only memory history and deletion tombstones
  index.sqlite   rebuildable search/retrieval projection
```

Authority is split deliberately:

- Markdown holds current lifecycle content authority.
- JSONL holds history authority, including deliberate deletion.
- SQLite is derived and may be deleted and rebuilt.

The state directory is excluded from workspace scanning and should remain ignored by version control.

## Governance And Safety

- Context and search results preserve source path, memory category, approval status, and provenance.
- Export and delete route through the shared governance policy.
- Delete requires explicit confirmation evidence on CLI and MCP surfaces.
- Secret-like durable content is blocked or redacted by the governance layer.
- Semantic retrieval remains disabled by default and cannot outrank lifecycle-authoritative memory.
- CLI and MCP mutations share a cross-process workspace lock.

## Known Limitations

- Local HTTP and gRPC APIs are not implemented. BOLT-13 is deferred until a concrete consumer defines the transport and trust-boundary requirements.
- US-003 lifecycle relationships are explicitly deferred from the preview. Types exist, but there is no extractor, persisted edge repository, or trace query; edge cleanup is therefore reported as `not_applicable` rather than falsely successful. US-003 remains required for full V1.
- Governed `write_memory` execution is not implemented.
- The `node:sqlite` experimental warning is visible on stderr.
- The CLI has no `--version` flag.
- Event-log compaction and tombstone restore/undo are not implemented.
- iii-engine remains an optional boundary without a concrete runtime dependency.
- Embedding providers and vector indexes remain deferred.
- No remote authentication, multi-user tenancy, hosted storage, deployment, or npm publication is included.

## Project Documentation

- Current state: [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
- User stories: [`docs/01-inception/02-user-stories/all_user_stories.md`](docs/01-inception/02-user-stories/all_user_stories.md)
- NFRs: [`docs/01-inception/03-nfrs/nfrs.md`](docs/01-inception/03-nfrs/nfrs.md)
- Risk register: [`docs/01-inception/04-risks/risk_register.md`](docs/01-inception/04-risks/risk_register.md)
- Architecture: [`docs/02-construction/01-architecture/system_architecture.md`](docs/02-construction/01-architecture/system_architecture.md)
- Technology decisions: [`docs/02-construction/01-architecture/technology_decisions.md`](docs/02-construction/01-architecture/technology_decisions.md)
- BOLT-14 plan: [`docs/02-construction/02-design-plan/code_generation_followup_plan_bolt14.md`](docs/02-construction/02-design-plan/code_generation_followup_plan_bolt14.md)

## Preview Boundary

The BOLT-14 automated evidence and report pair are approved, and Amendment 5 defers US-003 from the preview, so the `0.1 MCP/CLI preview` is evidence-ready in this working tree. It is not released or distributable until the repository history and any chosen packaging/release workflow are handled separately. Full V1 remains blocked by US-003 and the deferred local API criterion.
