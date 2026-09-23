# AI-DLC Code Generation Follow-Up Plan - BOLT-08 / UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-07-27

## Purpose

Plan the first v1-release implementation slice: giving Agent-memory read-only filesystem access so it can discover AI-DLC Markdown artifacts in a real workspace and produce durable source observations.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-08 code-generation reports, or BOLT-08 test-results reports until this plan is explicitly approved by the human reviewer.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | The V1 release plan is approved; each of its bolts still requires its own follow-up plan. |
| Next implementation slice | BOLT-08 / UNIT-02 Read Workspace Durable Sources | `bolts_plan_addendum_v1_release.md` marks BOLT-08 as the first v1 bolt and a strict blocker for every other v1 bolt. |

## Approved Inputs

| Input | Status | Path |
|-------|--------|------|
| User stories | Approved | `docs/01-inception/02-user-stories/all_user_stories.md` |
| NFRs | Approved | `docs/01-inception/03-nfrs/nfrs.md` |
| Risk register | Approved | `docs/01-inception/04-risks/risk_register.md` |
| Units composition | Approved | `docs/01-inception/05-units/units_composition.md` |
| Bolts plan | Approved | `docs/01-inception/06-bolts/bolts_plan.md` |
| Bolts plan addendum (v1 release track) | Approved | `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` |
| V1 release plan | Approved | `docs/02-construction/02-design-plan/v1_release_plan.md` |
| Technology Decisions | Approved | `docs/02-construction/01-architecture/technology_decisions.md` |
| System Architecture | Approved | `docs/02-construction/01-architecture/system_architecture.md` |
| UNIT-01 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core.md` |
| UNIT-02 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md` |
| BOLT-07 Code Generation Report | Approved | `docs/02-construction/04-code-generation/code_generation_report_bolt07.md` |
| BOLT-07 Test Results | Approved | `docs/02-construction/04-code-generation/test_results_bolt07.md` |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Filesystem access | No `node:fs` usage anywhere in `src/`. | BOLT-08 introduces the first filesystem reads in the package. |
| Classifier | `classifyArtifactSource(source: ArtifactSource)` maps a workspace path and artifact type onto a lifecycle category, and **throws** `LifecycleMemoryValidationError` when no rule matches. | The scanner must handle unmatched files as a reported skip, never as a crash. |
| Observation contract | `DurableSourceObservation` requires `workspacePath`, `sourceKind`, `observedVersion`, `observedAt`, `content`, `isTemplate`, and approval metadata, with optional `artifactType`. | This is BOLT-08's output contract; no new storage type is needed. |
| Projection pipeline | `LocalWorkspaceIndexProjection` and `WorkspaceIndexRebuilder` already turn observations into projected records. | BOLT-08 feeds the existing pipeline rather than replacing it. |
| Content boundary | Root `docs/` holds AI-DLC lifecycle artifacts; `src/docs/` holds product templates and fixtures. | The scanner must not classify `src/docs/` content as project memory. |
| Current tests | UNIT-01 through BOLT-07 tests pass, 51 total, all contract tests with no filesystem access. | BOLT-08 adds the first tests that touch the filesystem. |

## Implementation Authorization Requested By This Plan

If this plan is approved, the following implementation authorizations are included for BOLT-08 only:

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Add read-only workspace scanning | Add a scanner that walks a workspace root, applies include and exclude rules, and returns discovered artifact paths. | Read-only. No file may be created, modified, moved, or deleted in this slice. |
| Add artifact discovery rules | Define which paths are candidate lifecycle artifacts, including the root `docs/` boundary and exclusion of `src/docs/`, `node_modules`, `dist`, and `.git`. | Rules must be data-driven and inspectable, not hard-coded inside the walk. |
| Add approval-status extraction | Parse the `## Approval Status` section of an AI-DLC Markdown artifact to derive `ApprovalStatus`, approver, and decision date. | An artifact with no recognisable approval section must default to `draft`, never to `approved`. |
| Add content-derived observed version | Derive `observedVersion` from file content using `node:crypto`. | Must be deterministic for identical content so rebuild stays reproducible under NFR-003. |
| Add durable source observation production | Convert each discovered artifact into a `DurableSourceObservation` ready for the existing projection pipeline. | Reuse the approved BOLT-02 contract; do not introduce a parallel observation type. |
| Add unmatched and unreadable file reporting | Return a scan result that separates observations from skipped entries with a reason. | An unmatched or unreadable file must be reported and skipped, never crash the scan. |
| Add BOLT-08 tests | Add tests covering discovery, exclusion rules, approval extraction, version determinism, template detection, unmatched-file skipping, unreadable-file handling, and a real-tree scan of this repository's `docs/`. | Keep tests traceable to US-002, US-003, NFR-003, NFR-005, NFR-016, and R-010. |
| Produce BOLT-08 Code Generation artifacts | Create `docs/02-construction/04-code-generation/code_generation_report_bolt08.md` and `docs/02-construction/04-code-generation/test_results_bolt08.md`. | Do not rewrite approved BOLT-01 through BOLT-07 report/test artifacts. |

## Scope For BOLT-08

### In Scope

- Read-only workspace scanning from a caller-supplied workspace root.
- Data-driven include and exclude rules, with the root `docs/` versus `src/docs/` boundary enforced.
- Markdown artifact reading and template detection.
- Approval-status extraction from artifact content, defaulting to `draft` when absent.
- Deterministic content-derived `observedVersion`.
- `DurableSourceObservation` production for the existing classifier and projection pipeline.
- A scan result that reports skipped entries with a reason, including unmatched classification and unreadable files.
- Tests, including one that scans this repository's real `docs/` tree with no hand-written fixtures.
- BOLT-08-specific Code Generation Report and Test Results artifacts.

### Out Of Scope

- Writing any file, including the JSONL event log, SQLite database, and `.agent-memory/` layout. All writes belong to BOLT-09.
- Workspace configuration resolution and default workspace-root discovery. BOLT-09.
- Rebuild driven by files. BOLT-09.
- CLI, MCP server, or local HTTP API. BOLT-10, BOLT-12, BOLT-13.
- Delete or export execution. BOLT-11.
- Performance measurement and README rewrite. BOLT-14.
- File watching, incremental scanning, or caching.
- Any new runtime or dev dependency.

## Open Questions Resolved Or Deferred By This Plan

| Question | Plan Position | Rationale |
|----------|---------------|-----------|
| What happens when `classifyArtifactSource` finds no rule? | The file is skipped and reported with a reason. The scan continues. | The classifier throws by design, and a real repository contains many unmatched files. A crashing scan would make the tool unusable on any real workspace. |
| What approval status does an artifact with no approval section get? | `draft`. | Defaulting to `approved` would let unreviewed content outrank real approved memory in BOLT-03 ranking, which adds +50 for approved. Failing safe matters more than convenience here. |
| How is `observedVersion` derived? | A content hash via `node:crypto`. | NFR-003 requires deterministic rebuild. File mtime is not stable across clones or checkouts, so content is the only reliable input. |
| Should the scanner read `src/docs/`? | No. | The approved repository content boundary reserves `src/docs/` for product templates and fixtures, which are not project memory. |
| Should the scanner discover the workspace root itself? | No, the root is supplied by the caller. | Root discovery is configuration, which belongs with the rest of the workspace layout in BOLT-09. |
| Should raw observations be ingested? | No. Only lifecycle artifacts in this slice. | ADR-004 sets no automatic raw observation retention by default; raw capture needs its own approved scope. |

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Workspace scanning and discovery rules | UNIT-02 / BOLT-08 | US-002 AC-001 | Durable source discovery | NFR-005, NFR-016, R-010 |
| Markdown reading and template detection | UNIT-02 / BOLT-08 | US-002 | DurableSourceObservation | NFR-016, R-014 |
| Approval-status extraction | UNIT-02 / BOLT-08 | US-002, US-003 | DurableSourceApprovalMetadata, ApprovalState | NFR-004, NFR-006, NFR-012 |
| Deterministic observed version | UNIT-02 / BOLT-08 | US-004 | Rebuild determinism | NFR-003, R-010 |
| Observation production for the classifier | UNIT-02 / BOLT-08 | US-002, US-003 | ArtifactSource, ArtifactClassification | NFR-016 |
| Unmatched and unreadable reporting | UNIT-02 / BOLT-08 | US-002 | Rebuild warnings | NFR-006, R-010 |
| BOLT-08 tests | UNIT-02 / BOLT-08 | US-002, US-003 | UNIT-02 validation checklist | NFR-003, NFR-005, NFR-016, R-010 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-08 Code Generation follow-up plan.
- [x] Reconfirm approved inputs and verify no upstream approval has changed.
- [x] Reinspect the current TypeScript package/source/test baseline.
- [x] Add read-only workspace scanning with data-driven include and exclude rules.
- [x] Add Markdown artifact reading and template detection.
- [x] Add approval-status extraction with a `draft` default.
- [x] Add deterministic content-derived `observedVersion`.
- [x] Add `DurableSourceObservation` production for the existing pipeline.
- [x] Add scan-result reporting for unmatched and unreadable entries.
- [x] Add tests, including a real-tree scan of this repository's `docs/`.
- [x] Confirm the BOLT-06 and BOLT-07 import boundary tests still pass, since `node:fs` and `node:crypto` are `node:`-prefixed.
- [x] Run available verification checks: build, typecheck, tests.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt08.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt08.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes. (Three defects were found during development and fixed within the approved scope: root-level classification, approval-section over-capture, and template placeholder verdicts. All are recorded in the report and test results; final verification has no failures.)
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01 through BOLT-08 behavior. |
| Discovery tests | BOLT-08 test suite | Verify include and exclude rules, and that `src/docs/`, `node_modules`, `dist`, and `.git` are never scanned. |
| Approval extraction tests | BOLT-08 test suite | Verify approved, pending, and absent approval sections map correctly, with `draft` as the safe default. |
| Determinism tests | BOLT-08 test suite | Verify identical content yields an identical `observedVersion` and different content does not. |
| Resilience tests | BOLT-08 test suite | Verify unmatched and unreadable files are reported and skipped rather than throwing. |
| Real-tree test | BOLT-08 test suite | Verify a scan of this repository's `docs/` produces observations with no hand-written fixtures. |
| Read-only tests | BOLT-08 test suite | Verify the scan performs no writes. |
| Boundary tests | BOLT-06 and BOLT-07 suites | Verify the domain import boundary still holds and no dependency was added. |

## Approval Gate

- Approved by user on 2026-07-27. Execution of the BOLT-08 / UNIT-02 scope described here is authorized.
- Approval of this plan authorizes only the BOLT-08 / UNIT-02 implementation described here.
- Any file write, configuration resolution, CLI, MCP server, local HTTP API, delete/export execution, new dependency, or deviation from this plan requires a new approval or approved follow-up plan.

## Execution Notes

- 2026-07-27: Plan created after approval of the V1 release plan and the v1 release bolts plan addendum. No implementation, tests, dependency changes, runtime structure changes, BOLT-08 code-generation report, or BOLT-08 test-results report were created.
- 2026-07-27: Plan approved by the user. BOLT-08 implementation executed: `src/storage/workspace-source-reader.ts` added, `src/index.ts` and `package.json` updated, and `tests/workspace-source-reader.test.ts` added. No dependency was added and no file was written by the reader. Final verification passed with `npm run build`, `npm run typecheck`, and `npm test` (59 tests, 0 failures). A real-tree scan of this repository produced 100 observations from 152 candidates, with 52 unclassified candidates recorded as a finding for a later decision. BOLT-08 Code Generation Report and Test Results created and are pending human review.
