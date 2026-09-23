# Bolts Plan Addendum - V1 Release Track

**Project:** Agent-memory
**Date:** 2026-07-27
**Extends:** `docs/01-inception/06-bolts/bolts_plan.md`

## Approval Status

Approved by user on 2026-07-27. Generated from the approved `docs/02-construction/02-design-plan/v1_release_plan.md`.

## Why This Addendum Exists

The approved Bolts plan defines BOLT-01 through BOLT-07, all of which are implemented. Those bolts produced validated domain contracts, but the package has no filesystem access, no durable persistence, and no executable entrypoint, so no Must user story is deliverable end to end.

Workspace ingestion and durable persistence were never assigned to any of the seven approved bolts. This addendum records BOLT-08 through BOLT-14, which close that gap and complete v1.

Per NFR-004, the approved `bolts_plan.md` is left unmodified. This file is the addendum that carries the new state.

## Bolt BOLT-08 - Read Workspace Durable Sources

- **Unit:** UNIT-02
- **Goal:** Give Agent-memory read-only filesystem access so it can discover AI-DLC Markdown artifacts in a workspace, derive their approval metadata and version, and produce durable source observations.
- **Duration:** 2-3 days
- **Included Stories:** US-002, US-003
- **Expected Artifact / Output:** Workspace scanner, artifact discovery rules, approval-status extraction, content-derived observed version, and `DurableSourceObservation` production for the existing classifier.
- **Parallel / Sequential Status:** Sequential after BOLT-07
- **Reasoning:** Every other v1 bolt depends on the tool being able to see a workspace. Without this, memory can only be populated by handing the library objects from TypeScript.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-01 | Sequential | Provides `classifyArtifactSource` and the lifecycle categories the scanner must target. |
| BOLT-02 | Sequential | Provides `DurableSourceObservation` and `ProjectedMemoryRecord` as the output contracts. |
| Repository content boundary | Data | Root `docs/` holds AI-DLC lifecycle artifacts; `src/docs/` holds product templates and fixtures and must not be classified as project memory. |

### Validation Method

- Verify the scanner produces observations from a real AI-DLC `docs/` tree without any hand-written fixtures.
- Verify an unmatched file is skipped and reported rather than throwing, since `classifyArtifactSource` raises on unmatched paths.
- Verify approval status is derived from artifact content rather than assumed.
- Verify US-002 and US-003 coverage and that no write occurs in this bolt.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-09 - Persist Event Log And Derived Index

- **Unit:** UNIT-02
- **Goal:** Make memory survive process exit through an append-only JSONL event log and a file-backed SQLite index, with deterministic rebuild from those real durable sources.
- **Duration:** 2-3 days
- **Included Stories:** US-004, US-002
- **Expected Artifact / Output:** Resolved `.agent-memory/` workspace layout, JSONL append and read, SQLite database path wiring, workspace configuration resolution, and rebuild driven by files rather than caller-supplied arrays.
- **Parallel / Sequential Status:** Sequential after BOLT-08
- **Reasoning:** Rebuild-from-durable-sources cannot be proven until the durable sources physically exist. This is the first bolt that writes to disk.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-08 | Sequential | Supplies observations read from the workspace. |
| BOLT-02 | Sequential | Supplies event, rebuild, and projection contracts. |
| ADR-003 | Sequential | Storage posture: Markdown and JSONL are durable, SQLite is derived. |

### Validation Method

- Verify the index rebuilds identically after the SQLite file is deleted, satisfying NFR-003.
- Verify the JSONL log is append-only and readable across process restarts.
- Verify no managed service is required, satisfying NFR-005 and NFR-019.
- Verify divergence between durable sources and the derived index is detectable, addressing R-010.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-10 - Ship The CLI Operator Surface

- **Unit:** UNIT-03
- **Goal:** Make Agent-memory runnable as a command-line tool for the read and rebuild capabilities, and connect the existing retriever and rebuilder to the approved Capability Router.
- **Duration:** 2-3 days
- **Included Stories:** US-001, US-004, US-005 AC-002
- **Expected Artifact / Output:** `bin` entrypoint, `node:util` `parseArgs` command parsing, `context` / `query` / `inspect` / `rebuild` commands, human and `--json` output, exit codes, `--help`, and router handlers for `get_context` and `rebuild_index`.
- **Parallel / Sequential Status:** Sequential after BOLT-09
- **Reasoning:** The CLI is the cheapest surface, needs no dependency, and is required outright by NFR-013. It also forces the two unreachable services onto the capability surface.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-09 | Sequential | The CLI needs persisted memory to be useful. |
| BOLT-05 | Sequential | Provides `CLI_COMMAND_DESCRIPTORS` and the Capability Router. |
| BOLT-03 | Sequential | Provides `StartupContextRetriever` for the `context` command. |

### Validation Method

- Verify US-001 is demonstrable from a terminal against a real workspace.
- Verify NFR-013 operator commands exist and NFR-002 keeps `context` within 2000 tokens.
- Verify `delete` and `export` are presented as not-yet-executing rather than silently accepting, since execution lands in BOLT-11.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-11 - Execute Governed Delete And Export

- **Unit:** UNIT-04
- **Goal:** Turn the approved delete and export decisions into real, verifiable effects across every durable and derived store.
- **Duration:** 2-3 days
- **Included Stories:** US-006
- **Expected Artifact / Output:** Purge across durable record, event log, SQLite projection, lifecycle edges, and the BOLT-07 semantic cleanup contract; portable export package including provenance; CLI `delete` and `export` enabled.
- **Parallel / Sequential Status:** Sequential after BOLT-10
- **Reasoning:** Destructive behaviour should ship only once there is a surface to confirm it through and durable stores to purge from.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-09 | Sequential | Provides the durable stores that must be purged. |
| BOLT-10 | Sequential | Provides the operator surface and confirmation path. |
| BOLT-04 | Sequential | Provides the governance decisions that authorise the operation. |
| BOLT-07 | Integration | Provides `cleanupSemanticEntries`, currently defined but unwired. |

### Validation Method

- Verify deleted memory is absent from retrieval, index, lifecycle edges, and semantic cleanup, closing R-005 and satisfying NFR-011.
- Verify export output is portable and carries provenance, satisfying US-006 AC-004.
- Verify partial cleanup reports incomplete rather than succeeding quietly.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-12 - Ship The MCP Server Surface

- **Unit:** UNIT-03
- **Goal:** Let any MCP-capable agent runtime reach Agent-memory's approved capabilities over stdio.
- **Duration:** 2-3 days
- **Included Stories:** US-001, US-005 AC-001
- **Expected Artifact / Output:** stdio MCP server, `tools/list` and `tools/call` generated from the approved BOLT-05 descriptors, JSON Schema generated from `CapabilityPayloadField`, error mapping, and a domain-scoped import boundary test.
- **Parallel / Sequential Status:** Sequential after BOLT-09; parallel-safe with BOLT-11 and BOLT-13
- **Reasoning:** MCP is how the product's primary outcome, fresh-session context restoration for an agent, is actually delivered.
- **Status:** Planned; blocked on ADR-006

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-09 | Sequential | The server needs persisted memory. |
| BOLT-05 | Sequential | Provides `MCP_TOOL_DESCRIPTORS` and the Capability Router. |
| ADR-006 | Sequential | MCP implementation approach must be selected before any dependency is added. |

### Validation Method

- Verify a real MCP client can list tools and request startup context, satisfying US-005 AC-001 and US-001.
- Verify NFR-015 stays machine-enforced: the transport adapter lives outside `src/domain/` and the import boundary test is narrowed deliberately, not weakened silently.
- Verify governance-required tools still route through the Capability Router.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-13 - Ship The Local HTTP API Surface

- **Unit:** UNIT-03
- **Goal:** Provide the documented local API endpoints for local tools and a future viewer.
- **Duration:** 1-2 days
- **Included Stories:** US-005 AC-003
- **Expected Artifact / Output:** `node:http` server bound to loopback, the seven approved endpoints, JSON body handling, and `CapabilityResponseStatus` to HTTP status mapping.
- **Parallel / Sequential Status:** Sequential after BOLT-09; parallel-safe with BOLT-11 and BOLT-12
- **Reasoning:** US-005 AC-003, NFR-005, and NFR-019 all name the local API, so it is inside v1 Must scope even though it carries the least user value of the three surfaces.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-09 | Sequential | The server needs persisted memory. |
| BOLT-05 | Sequential | Provides `LOCAL_API_ENDPOINT_DESCRIPTORS`. |
| BOLT-04 | Integration | Governance must apply to endpoint-triggered operations. |

### Validation Method

- Verify US-005 AC-003 endpoints respond with correct status mapping.
- Verify the server binds to loopback only and does not expose workspace memory on an external interface, addressing R-013.
- Verify no dependency is added, keeping NFR-019 intact.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-14 - Verify V1 Release Readiness

- **Unit:** Cross-unit
- **Goal:** Produce the measured evidence v1 claims require, and make the repository presentable to a new contributor.
- **Duration:** 2-3 days
- **Included Stories:** US-001, US-002, US-003, US-004, US-005, US-006
- **Expected Artifact / Output:** File-to-context-pack integration test, NFR-001 and NFR-009 measurement at v1 scale, end-to-end delete verification, and a project-specific README.
- **Parallel / Sequential Status:** Sequential after BOLT-11, BOLT-12, and BOLT-13
- **Reasoning:** NFR-001 and NFR-009 are marked Applicable but have never been measured, and every current test is a contract test. V1 cannot be claimed on contract tests alone.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-11 | Sequential | Delete verification needs real delete execution. |
| BOLT-12 | Sequential | Agent-facing acceptance needs the MCP surface. |
| BOLT-13 | Sequential | Local API acceptance needs the endpoints. |

### Validation Method

- Verify every V1 exit criterion in `docs/02-construction/02-design-plan/v1_release_plan.md`.
- Verify startup retrieval at or below 10 seconds with at least 1,000 lifecycle and 10,000 raw records, satisfying NFR-001 and NFR-009.
- Verify README is project-specific, closing R-014.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Parallelization Summary

| Bolt | Parallel / Sequential Status | Reasoning |
|------|------------------------------|-----------|
| BOLT-08 | Sequential after BOLT-07 | Nothing else can proceed until the tool can read a workspace. |
| BOLT-09 | Sequential after BOLT-08 | Persistence needs observations to persist. |
| BOLT-10 | Sequential after BOLT-09 | The CLI needs persisted memory to be useful. |
| BOLT-11 | Sequential after BOLT-10 | Destructive execution needs a confirmation surface. |
| BOLT-12 | Sequential after BOLT-09; parallel-safe with BOLT-11 and BOLT-13; blocked on ADR-006 | Independent transport; dependency choice must be decided first. |
| BOLT-13 | Sequential after BOLT-09; parallel-safe with BOLT-11 and BOLT-12 | Independent transport with no dependency. |
| BOLT-14 | Sequential after BOLT-11, BOLT-12, BOLT-13 | Release evidence needs every surface and effect in place. |

## Amendment 1 - BOLT-08a Classification Coverage

**Date:** 2026-07-27
**Basis:** Approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08a.md`

Appended after the original BOLT-08 through BOLT-14 entries were approved. No entry above is modified.

### Bolt BOLT-08a - Close Classification Coverage

- **Unit:** UNIT-01 and UNIT-02
- **Goal:** Ensure every Markdown file discovered in an AI-DLC workspace is either classified into a lifecycle memory category or excluded by an explicit rule.
- **Duration:** 1 day
- **Included Stories:** US-001, US-002, US-003
- **Expected Artifact / Output:** Classifier rules for domain-design documents and the project status file, leading-slash path anchoring, a `non_memory` scan rule kind with an `excluded_by_rule` skip reason, and a machine-enforced coverage test.
- **Parallel / Sequential Status:** Sequential after BOLT-08; blocks BOLT-09
- **Reasoning:** The BOLT-08 real-tree scan measured 52 unclassified candidates, including `PROJECT_STATUS.md` and all ten UNIT domain-design documents. Persisting a memory set that cannot answer US-001 would only fail at BOLT-14 acceptance, three bolts later.
- **Status:** Implemented; review artifacts pending

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-08 | Sequential | Supplies the measured coverage gap and the reader this bolt extends. |
| BOLT-01 | Sequential | Owns the classifier this bolt extends without adding a memory category. |

### Validation Method

- Verify zero `unclassified_artifact` skips when scanning a real AI-DLC workspace.
- Verify every artifact classified before this bolt keeps its exact primary and secondary categories.
- Verify `V1_MEMORY_CATEGORY_NAMES` still has exactly 13 entries.
- Verify `PROJECT_STATUS.md` and the ten domain-design documents are present as observations.

### Exit Criteria

- [x] Expected output is produced.
- [x] Included stories are covered.
- [x] Dependencies are satisfied or documented.
- [x] Validation method is completed or scheduled.

### Revised Sequencing

```
BOLT-08  Durable source reader
   |
BOLT-08a Classification coverage
   |
BOLT-09  Event log + persistence
   |
   +---> BOLT-10 -> BOLT-11
   +---> BOLT-12 (needs ADR-006)
   +---> BOLT-13
                  |
               BOLT-14
```

## Amendment 2 - BOLT-08b Non-Memory Rule Precedence

**Date:** 2026-07-27
**Basis:** Approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08b.md`

Appended after Amendment 1. No entry above is modified.

### Bolt BOLT-08b - Give Selected Non-Memory Rules Precedence

- **Unit:** UNIT-02
- **Goal:** Act on the reviewer's decision that directory READMEs and reusable templates are not project memory, by letting selected non-memory rules win over classification.
- **Duration:** 1 day
- **Included Stories:** US-002
- **Expected Artifact / Output:** An opt-in `overridesClassification` rule flag honoured before a file is opened, a `fileName` exact base-name matcher, precedence on the README and template rules only, and a no-collateral-loss test pinning per-rule exclusion tallies.
- **Parallel / Sequential Status:** Sequential after BOLT-08a; blocks BOLT-09
- **Reasoning:** BOLT-08a made non-memory rules yield to classification so it could guarantee no existing classification changed. Reversing that for two rules is the change BOLT-08a's approval gate reserved for a later plan. Doing it before persistence avoids indexing 25 navigation and placeholder artifacts.
- **Status:** Implemented; review artifacts pending

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-08a | Sequential | Supplies the `non_memory` rule kind and the measured finding this bolt acts on. |
| BOLT-08 | Sequential | Supplies the reader whose discovery order this bolt changes. |

### Validation Method

- Verify no README and no template remains in memory.
- Verify `docs/00-methodology/setup_validation.md` is retained, proving non-overriding rules still yield to classification.
- Verify precedence is limited to exactly two rules.
- Verify zero unclassified candidates and that observations plus skips equal the candidate count.

### Exit Criteria

- [x] Expected output is produced.
- [x] Included stories are covered.
- [x] Dependencies are satisfied or documented.
- [x] Validation method is completed or scheduled.

### Revised Sequencing

```
BOLT-08  Durable source reader
   |
BOLT-08a Classification coverage
   |
BOLT-08b Non-memory rule precedence
   |
BOLT-09  Event log + persistence
   |
   +---> BOLT-10 -> BOLT-11
   +---> BOLT-12 (needs ADR-006)
   +---> BOLT-13
                  |
               BOLT-14
```

## Amendment 3 - BOLT-10a Section-Level Context Packing

**Date:** 2026-07-27
**Basis:** Approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt10a.md`

Appended after Amendment 2. No entry above is modified.

### Bolt BOLT-10a - Pack Context By Section

- **Unit:** UNIT-02, with UNIT-01 approval extraction
- **Goal:** Make US-001 achievable by changing the unit of context packing from the whole document to the Markdown section.
- **Duration:** 1 day
- **Included Stories:** US-001, US-002
- **Expected Artifact / Output:** Section splitting, a per-item token cap with direction-aware truncation, category reservations with spill-over, heading-level ranking signals, a continuity ranking fix, expanded budgets for `handoff` and `audit`, and a widened approval extractor.
- **Parallel / Sequential Status:** Sequential after BOLT-10; blocks BOLT-12
- **Reasoning:** BOLT-10 shipped a working CLI and proved the mechanism, then showed the outcome still did not arrive: the pack held one artifact and omitted 99. AI-DLC artifacts run to thousands of tokens, so whole-document packing cannot satisfy a 2000-token budget. Shipping BOLT-12 first would have handed agents the same unmet outcome through MCP.
- **Status:** Implemented; review artifacts pending

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-10 | Sequential | Supplies the CLI that exposed the gap and the measurement that scoped it. |
| BOLT-03 | Sequential | Owns the ranking and packing this bolt changes. |
| BOLT-09 | Sequential | Supplies the persisted projection the acceptance test reads. |

### Validation Method

- Verify the startup pack carries `PROJECT_STATUS.md § Project Goal`, `§ Current Status`, and `§ Next Steps` within 2000 tokens, against a real workspace.
- Verify the four original BOLT-03 tests pass unmodified.
- Verify the startup budget still rejects an explicit value above 2000.
- Verify an approved artifact still outranks a conflicting draft.

### Exit Criteria

- [x] Expected output is produced.
- [x] Included stories are covered.
- [x] Dependencies are satisfied or documented.
- [x] Validation method is completed or scheduled.

### Revised Sequencing

```
BOLT-08 -> BOLT-08a -> BOLT-08b -> BOLT-09 -> BOLT-10 -> BOLT-10a
                                                            |
                                    +-----------------------+
                                    |
                                 BOLT-11
                                 BOLT-12 (needs ADR-006)
                                 BOLT-13
                                    |
                                 BOLT-14
```

## Out Of Scope For This Addendum

- Concrete iii SDK dependency, worker, trigger, or console; US-007 stays at the BOLT-06 boundary.
- Embedding provider or vector index selection; US-008 stays disabled at the BOLT-07 boundary.
- Memory consolidation, background scheduling, or daemon behaviour.
- Hosted or server storage profile, multi-user access control, or graph UI.
- Deployment, release packaging, and npm publication, which require an `ai-dlc-deployment` gate.

## Amendment 4 - Defer BOLT-13 And Rebaseline BOLT-14 To MCP/CLI Preview Readiness

**Date:** 2026-09-22  
**Basis:** Approved `docs/02-construction/02-design-plan/v1_release_scope_addendum_bolt13_defer_bolt14.md` and `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt14.md`

Appended after the original BOLT-08 through BOLT-14 entries and Amendments 1 through 3 were approved. No earlier entry is modified.

### BOLT-13 Disposition

- **Status:** Deferred
- **Deferred acceptance:** US-005 AC-003 local API read/write access
- **Release consequence:** Full V1 is not declared while this Must criterion remains deferred.
- **Re-entry trigger:** A named dashboard, IDE extension, local service, or other concrete consumer with documented operations and trust boundaries.
- **Transport decision on re-entry:** Re-evaluate HTTP versus gRPC from the named consumer's needs; neither transport is authorized by this amendment.
- **Preserved boundary:** Existing local API descriptors remain as framework-agnostic contract metadata; no HTTP listener, executable, route mapping, or network dependency is added.

### BOLT-14 Rebaseline

- **Release target:** `0.1 MCP/CLI preview`
- **Goal:** Produce measured end-to-end evidence for the implemented MCP and CLI surfaces without representing the deferred local API criterion as passed.
- **Dependencies:** BOLT-11 and BOLT-12 are complete and reviewed. BOLT-13 is no longer a prerequisite for the preview target.
- **Scale decision:** Generate at least 1,000 lifecycle artifacts and 10,000 valid `MemoryEventRecord` JSONL entries.
- **Latency decision:** Measure multiple fresh process/client retrievals from an already persisted index against the ten-second NFR target; report rebuild timing separately.
- **Gap rule:** Stop and report each product-capability gap and require a separate approved fix plan; do not expand BOLT-14 silently.
- **Required outputs:** Release-gap audit, file-to-context integration evidence, CLI/MCP acceptance, export/delete restart-and-rebuild verification, scale/latency results, project-specific README, BOLT-14 report, and BOLT-14 test results.

### Revised Sequencing

```text
BOLT-11 (complete) ----+
                       +--> BOLT-14 preview readiness
BOLT-12 (complete) ----+

BOLT-13 (deferred until a named consumer)
```

### Preview Exit Boundary

- Preview readiness may be declared only after the BOLT-14 report pair is separately reviewed and approved.
- Full V1 remains blocked until an approved later slice satisfies US-005 AC-003 or an approved scope decision supersedes that criterion.
- Deployment, npm publication, release upload, signing, and tagging remain outside this amendment.

## Amendment 5 - Defer US-003 From The 0.1 MCP/CLI Preview

**Date:** 2026-09-23  
**Basis:** Approved `docs/02-construction/02-design-plan/preview_scope_addendum_us003_defer.md`

Appended after Amendment 4. No original bolt, prior amendment, approved report, or test result is modified.

### Scope Decision

- **US-003 preview status:** Deferred from the `0.1 MCP/CLI preview`.
- **US-003 full-V1 status:** Still required.
- **Current implementation:** Lifecycle edge types exist; extraction, persistence, relationship queries, and non-vacuous edge cleanup do not.
- **Preview behavior:** Delete continues to report lifecycle-edge cleanup as `not_applicable`; the preview does not claim structured supersession or relationship traversal.
- **Re-entry trigger:** Before full V1, or when a named consumer requires lifecycle relationship traceability.
- **Implementation authorization:** None. A separate approved plan is required.

### Preview Verdict Effect

- The approved BOLT-14 Code Generation Report and Test Results remain unchanged historical evidence from the pre-deferral scope.
- Their automated evidence is accepted and all retained MCP/CLI preview criteria pass after US-003 is removed from the preview acceptance boundary.
- Current verdict: **`0.1 MCP/CLI preview` evidence-ready in the present working tree.**
- This is not a release, package, publication, tag, deployment, or portability claim. The working tree remains uncommitted and the preview has not been distributed.
- Full V1 remains not ready because both US-003 and BOLT-13 / US-005 AC-003 remain outstanding.
