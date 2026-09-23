# AI-DLC V1 Release Plan - Remaining Work To A Usable Agent-memory

**Project:** Agent-memory
**Date:** 2026-07-27
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-07-27

## Purpose

Define the remaining work required to release a usable Agent-memory v1, and propose the additional bolts needed to get there.

BOLT-07 is the final bolt in the approved `docs/01-inception/06-bolts/bolts_plan.md`. All seven bolts are implemented, but the package has no executable entrypoint, no filesystem access, and no durable persistence, so no approved user story is deliverable end to end. The remaining work therefore has no pre-approved bolt definition and needs this planning gate.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, a bolts plan addendum, or per-bolt follow-up plans until this plan is explicitly approved by the human reviewer.

## Gap Evidence

Verified against the current repository on 2026-07-27.

| Finding | Evidence | Consequence |
|---------|----------|-------------|
| No filesystem access in the shipped library | A search for `node:fs`, `readFileSync`, `readdirSync`, `readFile`, and `writeFile` across `src/` returns no matches. | Agent-memory cannot read a workspace. Memory can only be populated by handing it objects from TypeScript. |
| Derived index defaults to memory | `LocalWorkspaceIndexProjection` is constructed as `constructor(databasePath = ":memory:")`. A path is supported, but no code chooses, creates, or resolves one. | Nothing survives process exit. |
| Rebuild does not read durable sources | `WorkspaceIndexRebuilder.rebuild()` consumes `observations` and `events` arrays supplied by the caller. | NFR-003 "rebuildable from durable sources" is contract-shaped, but the sources are not files. |
| No JSONL event log on disk | JSONL handling validates event record shape only. | The append-only durable source in ADR-003 does not physically exist. |
| No executable entrypoint | `package.json` has no `bin` field; `main` is `dist/src/index.js`. | There is no way to run Agent-memory as a tool. |
| Router not wired to existing services | `CapabilityRouter.invokeBuiltInPort` handles only `query_memory` and `inspect_memory`. `get_context` returns `not_implemented` and `rebuild_index` returns `accepted` with no execution, although `StartupContextRetriever` and `WorkspaceIndexRebuilder` both exist. | Two working services are unreachable through the approved capability surface. |
| No integration or performance evidence | All 51 tests are contract tests. There is no file-to-context-pack test and no timing or scale measurement. | NFR-001 and NFR-009 are marked Applicable but have never been measured. |

## V1 Definition

V1 is met when every **Must** user story is demonstrable end to end on a local AI-DLC workspace, and the applicable performance, cost, and compliance NFRs have measured evidence.

| Story | Priority | Domain logic today | Deliverable today | Required for V1 |
|-------|----------|--------------------|-------------------|-----------------|
| US-001 Restore AI-DLC Startup Context | Must | Present | No | Yes |
| US-002 Index AI-DLC Artifact-Aware Memory | Must | Present | No | Yes |
| US-003 Trace Lifecycle Relationships | Must | Present | No | Yes |
| US-004 Search Workspace Memory Locally | Must | Present | No | Yes |
| US-005 Provide Framework-Agnostic Interfaces | Must | Descriptors and router only | No | Yes, all three AC surfaces |
| US-006 Protect Sensitive Memory | Must | Decisions only | No | Yes, including execution |
| US-007 Support Runtime Triggers Through iii-engine | Should | Boundary present | No | No, deferred past v1 |
| US-008 Add Optional Semantic Retrieval Later | Nice | Boundary present, disabled | Disabled by design | No, stays disabled |

US-005 AC-003 names the local API explicitly, and NFR-005 and NFR-019 both list local API alongside MCP and CLI. The local HTTP API is therefore inside approved v1 Must scope and is planned here rather than deferred. See "Scope Options For The Reviewer" if that should change.

## Proposed Bolts Plan Addendum

Per NFR-004, the approved `bolts_plan.md` must not be rewritten. If this plan is approved, a new addendum file `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` will record BOLT-08 through BOLT-14 while leaving the original approved plan intact.

| Bolt | Unit | Goal | Stories | Duration |
|------|------|------|---------|----------|
| BOLT-08 | UNIT-02 | Workspace durable source reader: scan a workspace, read Markdown artifacts, classify them through UNIT-01, and produce durable source observations. Read-only filesystem access. | US-002, US-003 | 2-3 days |
| BOLT-09 | UNIT-02 | Durable event log and index persistence: append-only JSONL event log, resolved `.agent-memory/` workspace layout, SQLite file path wiring, and deterministic rebuild from real durable sources. | US-004, US-002 | 2-3 days |
| BOLT-10 | UNIT-03 | CLI operator surface: `bin` entry, `node:util` `parseArgs`, `context` / `query` / `inspect` / `rebuild` commands, `--json` output, exit codes, and router wiring for `get_context` and `rebuild_index`. | US-001, US-004, US-005 AC-002 | 2-3 days |
| BOLT-11 | UNIT-04 | Governed delete and export execution: real purge across durable record, event log, SQLite projection, lifecycle edges, and the BOLT-07 semantic cleanup contract; export package with provenance; CLI `delete` and `export` enabled. | US-006 | 2-3 days |
| BOLT-12 | UNIT-03 | MCP server surface: stdio transport, `tools/list` and `tools/call` generated from the approved BOLT-05 descriptors, JSON Schema generation from `CapabilityPayloadField`, and error mapping. | US-001, US-005 AC-001 | 2-3 days |
| BOLT-13 | UNIT-03 | Local HTTP API surface: `node:http` server bound to loopback, the seven approved endpoints, JSON body handling, and `CapabilityResponseStatus` to HTTP status mapping. | US-005 AC-003 | 1-2 days |
| BOLT-14 | Cross-unit | V1 verification and release readiness: file-to-context-pack integration test, NFR-001 and NFR-009 measurement at v1 scale, end-to-end delete verification for R-005, and a project-specific README. | All Must stories | 2-3 days |

### Sequencing And Dependencies

```
BOLT-08  Durable source reader        (read-only fs)
   |
BOLT-09  Event log + persistence      (first writes to disk)
   |
   +---> BOLT-10  CLI surface
   |         |
   |         +---> BOLT-11  Delete/export execution
   |
   +---> BOLT-12  MCP server          (needs ADR-006, can run parallel to BOLT-11)
   |
   +---> BOLT-13  Local HTTP API      (can run parallel to BOLT-12)
                     |
                  BOLT-14  V1 verification and README   (last)
```

BOLT-08 and BOLT-09 are strictly sequential and block everything else: no surface is worth exposing before the tool can read a workspace and persist what it read.

BOLT-11 follows BOLT-10 so that destructive commands ship only once a surface exists to confirm them through. BOLT-10 must present `delete` and `export` as not-yet-executing until BOLT-11 lands, because a `delete` command that silently does nothing is worse than no command.

### Prerequisite Decision Gate

BOLT-12 introduces `@modelcontextprotocol/sdk`, which would be the project's first runtime dependency. ADR-001's downstream authorization requires an approved plan for dependency changes, and no current ADR covers an MCP SDK choice.

If this plan is approved, BOLT-12 is additionally gated behind a technology decision producing **ADR-006: MCP server implementation approach**, comparing the official SDK against a dependency-free stdio JSON-RPC implementation. BOLT-12 execution is blocked until ADR-006 is selected and approved.

### Known Consequence For The Boundary Tests

The BOLT-06 and BOLT-07 boundary tests scan every file under `src/**/*.ts` and require each import to be relative or `node:`-prefixed. BOLT-12 would break that test if the MCP adapter lives under `src/`.

The planned resolution is to place transport adapters outside `src/domain/` and narrow the scan to the domain layer, so NFR-015 stays machine-enforced where it matters instead of being weakened. This refinement belongs to BOLT-12 and must be recorded as a deliberate change, not a silent test edit.

## V1 Exit Criteria

- [ ] A fresh clone can run the CLI against a real AI-DLC workspace with no manual data seeding.
- [ ] `rebuild` reads Markdown artifacts and the JSONL event log from disk and produces a persisted index.
- [ ] The index survives process exit and is rebuildable after deletion, satisfying NFR-003.
- [ ] A fresh agent session obtains startup context through MCP within the 2000-token budget, satisfying US-001, NFR-002, and NFR-020.
- [ ] All three US-005 acceptance criteria are demonstrable: MCP tools, CLI commands, local API endpoints.
- [ ] Delete removes memory from durable record, event log, active index, lifecycle edges, and the semantic cleanup path, verified end to end for R-005 and NFR-011.
- [ ] Export produces a portable package including provenance, satisfying US-006 AC-004.
- [ ] Startup retrieval measured at or below 10 seconds with at least 1,000 lifecycle and 10,000 raw records, satisfying NFR-001 and NFR-009.
- [ ] No paid or hosted service is required, satisfying NFR-005 and NFR-019.
- [ ] README is project-specific, closing R-014.
- [ ] Full test suite passes with build and typecheck clean.

## Scope Options For The Reviewer

These are genuine cut points. Each states what is lost.

| Option | Effect | Consequence |
|--------|--------|-------------|
| Drop BOLT-13 local HTTP API | Removes 1-2 days | US-005 AC-003 is not met, and NFR-005 and NFR-019 list local API explicitly. V1 would ship with a documented Must gap. Lowest real user cost of the three surfaces. |
| Drop BOLT-12 MCP server | Removes 2-3 days and the first dependency | US-005 AC-001 is not met and US-001 is only reachable by a human at a terminal, not by an agent. This removes the product's central purpose; not recommended. |
| Defer BOLT-11 delete/export execution | Removes 2-3 days | US-006 AC-003 and AC-004 are not met and NFR-011 has no evidence. CLI and MCP would have to hide `delete` and `export` entirely. |
| Ship a CLI-only preview before full v1 | BOLT-08 to BOLT-10 only | Delivers a usable operator tool in roughly a third of the work, at the cost of calling it a preview rather than v1. |

The recommendation is to keep BOLT-08 through BOLT-14 intact and, if speed matters, tag the BOLT-10 completion point as a `0.x` preview rather than cutting scope from v1.

## Out Of Scope For V1

- Concrete iii SDK dependency, iii worker, trigger, console, or hosted runtime; US-007 stays at the approved BOLT-06 boundary.
- Embedding provider or vector index selection; US-008 stays disabled at the approved BOLT-07 boundary.
- Memory consolidation, background scheduling, or daemon behavior.
- Hosted or server storage profile, Postgres, or pgvector.
- Multi-user access control, team tenancy, or an authenticated remote API.
- Graph UI or memory viewer.
- Deployment, release packaging, or npm publication, which require their own `ai-dlc-deployment` gate.

## Risk Impact

| Risk | Current State | Effect Of This Plan |
|------|---------------|---------------------|
| R-005 delete misses derived indexes | Open, unverified | BOLT-11 and BOLT-14 provide end-to-end verification. |
| R-010 Markdown, JSONL, and SQLite diverge | Open, untestable today because only SQLite exists | BOLT-09 makes divergence detectable and BOLT-14 tests deterministic rebuild. |
| R-014 README and skeletons remain template-oriented | Open, probability High | BOLT-14 closes it. |
| R-006 iii becomes a hard dependency | Mitigated by BOLT-06 | Unchanged; iii stays out of v1. |
| R-003 semantic returns lifecycle-incorrect memory | Mitigated by BOLT-07 | Unchanged; semantic stays disabled. |
| New: first runtime dependency introduces supply-chain and lock-in exposure | Not yet present | Gated behind ADR-006 before BOLT-12. |

## Execution Checklist

- [x] Record explicit human approval of this V1 release plan.
- [x] Confirm the reviewer's decisions on the scope options above. (No option cut; full BOLT-08 to BOLT-14 scope retained per the plan's recommendation.)
- [x] Create `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` recording BOLT-08 through BOLT-14 without modifying the approved `bolts_plan.md`.
- [x] Update `PROJECT_STATUS.md` with the v1 release track.
- [x] Create the BOLT-08 Code Generation follow-up plan for human review.
- [ ] Execute BOLT-08 through BOLT-14 one bolt at a time, each behind its own approved follow-up plan, report, and test results.
- [ ] Run the `ai-dlc-technology-decision` gate for ADR-006 before BOLT-12.
- [ ] Verify every V1 exit criterion before declaring v1 complete.
- [ ] Write a session log in `session-logs/`.

## Approval Gate

- Approved by user on 2026-07-27. No scope option was cut, so the plan's recommendation stands: BOLT-08 through BOLT-14 remain intact.
- Approval of this plan authorizes only the bolts plan addendum, the `PROJECT_STATUS.md` update, and the creation of the BOLT-08 follow-up plan for review.
- Each of BOLT-08 through BOLT-14 still requires its own approved Code Generation follow-up plan before any implementation.
- Adding `@modelcontextprotocol/sdk` or any other dependency requires ADR-006 or an equivalent approved decision first.
- Deployment, packaging, and npm publication remain outside this plan and require an `ai-dlc-deployment` gate.

## Execution Notes

- 2026-07-27: Plan created after BOLT-07 implementation, following a repository gap review that found no filesystem access, no durable persistence, and no executable entrypoint in the current package. No implementation, tests, dependency changes, bolts plan addendum, or per-bolt follow-up plans were created.
