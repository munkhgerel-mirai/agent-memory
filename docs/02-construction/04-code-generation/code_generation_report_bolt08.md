# Code Generation Report - BOLT-08 / UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27

## Approval Status

Approved by user on 2026-07-27. Generated from approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08.md` (approved by user on 2026-07-27).

## Summary

- Implemented the first v1-release slice: BOLT-08 / UNIT-02 Read Workspace Durable Sources. This is the first filesystem access in the package.
- Added `WorkspaceSourceReader` with a read-only recursive walk that never follows symlinks, so a link cycle cannot hang the scan.
- Added `DEFAULT_WORKSPACE_SCAN_RULES` as declarative include and exclude data, tested to contain no functions. Exclusions are evaluated before inclusions, and excluded directories are never descended into.
- Excluded `node_modules/`, `dist/`, `.git/`, `.agent-memory/`, and `src/docs/`. The `src/docs/` exclusion enforces the approved repository content boundary.
- Added `deriveObservedVersion`, a `sha256:`-prefixed content hash over CRLF-normalized content, so the version is identical across platforms and clones and rebuild stays reproducible under NFR-003.
- Added `extractApprovalMetadata`, which reads the artifact's `## Approval Status` section, uses only its first verdict paragraph, and extracts approver and decision date.
- Added `DurableSourceObservation` production feeding the existing BOLT-02 pipeline, with no parallel observation type introduced.
- Added a scan result that reports every skip with a typed reason: `unclassified_artifact`, `unreadable_file`, `empty_artifact`, or `file_too_large`, plus the list of excluded directories and the applied rule set.
- Added `DEFAULT_ARTIFACT_TYPE_RULES` and `deriveArtifactType` so the reader declares the artifact type it discovered, instead of relying on the classifier's path inference. See the deviations table for why this was necessary.
- Added BOLT-08 tests, including a scan of this repository's real tree with no hand-written fixtures, and a test asserting the reader references no filesystem write API.
- Did not write, create, modify, move, or delete any file; did not resolve workspace configuration; did not add any dependency.

## Approved Inputs

- **Units:** UNIT-02, with UNIT-01 classification
- **Bolts:** BOLT-08
- **User Stories:** US-002, US-003
- **Domain Designs:** `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core.md`, `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md`
- **NFRs:** NFR-003, NFR-004, NFR-005, NFR-006, NFR-012, NFR-016
- **Risks:** R-010, R-014
- **Technology Decisions:** ADR-001, ADR-003, ADR-004

## Changed Files

| File | Change Type | Related Unit / Story | Notes |
|------|-------------|----------------------|-------|
| `package.json` | Updated | UNIT-02 / verification | Updated `npm test` to run the new BOLT-08 compiled test file. |
| `src/index.ts` | Updated | UNIT-02 | Exported the workspace source reader from the public package entrypoint. |
| `src/storage/workspace-source-reader.ts` | Added | UNIT-02 / US-002 | Scan rules, artifact type rules, content versioning, approval extraction, observation production, and the read-only reader. |
| `tests/workspace-source-reader.test.ts` | Added | UNIT-02 / US-002 | BOLT-08 tests for rules, determinism, approval extraction, tree scanning, resilience, size limits, the real-tree scan, and the no-write guarantee. |
| `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08.md` | Updated | AI-DLC gate | Recorded approval, execution progress, verification, and report creation status. |
| `docs/02-construction/04-code-generation/code_generation_report_bolt08.md` | Added | AI-DLC gate | This BOLT-08 Code Generation Report. |
| `docs/02-construction/04-code-generation/test_results_bolt08.md` | Added | AI-DLC gate | BOLT-08 verification evidence. |

## Real-Tree Scan Results

Measured against this repository on 2026-07-27.

| Metric | Value |
|--------|-------|
| Candidate files discovered | 152 |
| Observations produced | 100 |
| Skipped | 52, all `unclassified_artifact` |
| Unreadable, empty, or oversized | 0 |
| Excluded directories | `.git/`, `dist/`, `node_modules/`, `src/docs/` |
| Classification coverage | 66 percent of candidates |

| Artifact type | Count | | Approval status | Count |
|---------------|-------|---|-----------------|-------|
| plan | 29 | | approved | 22 |
| session-log | 28 | | pending_review | 2 |
| verification | 20 | | draft | 76 |
| bolt | 4 | | | |
| intent, user-story, nfr, risk, unit | 3 each | | Templates observed | 15, all draft |
| architecture, decision | 2 each | | | |

## Findings That Need A Later Decision

These are recorded, not fixed, because changing the BOLT-01 classifier is outside BOLT-08's approved scope.

| Finding | Evidence | Impact |
|---------|----------|--------|
| `PROJECT_STATUS.md` has no classification rule | Reported as `unclassified_artifact` in the real-tree scan, and asserted as a tripwire in the BOLT-08 tests. | This file holds the current goal, phase, blockers, and next steps that US-001 must return. Startup context will be materially incomplete until a rule exists. |
| All ten UNIT domain-design and logical-design documents are unclassified | `docs/02-construction/03-domain-design/*.md` all appear in the skip list. | Approved architecture rationale cannot enter memory, weakening US-003 traceability. |
| Methodology, operations, and README-style documents are unclassified | 52 skips include `docs/00-methodology/**`, `docs/03-operations/**`, `README.md`, `AGENTS.md`, and `ai-dlc-paper.md`. | Some of these are legitimately out of scope as project memory; the boundary should be decided explicitly rather than by classifier silence. |
| Classifier directory rules assume nesting | `matchCategoryRule` tests `/session-logs/` with a leading slash, so root-level `session-logs/` never matches by path. | Worked around in BOLT-08 by declaring the artifact type. A classifier fix would remove the workaround. |

A follow-up decision should choose between extending the BOLT-01 classifier rules and defining an explicit non-memory allowlist. Either path needs its own approved plan.

## Traceability Mapping

| Implementation Task | Unit | Story / AC | Domain Element | Logical Decision | NFR / Risk |
|---------------------|------|------------|----------------|------------------|------------|
| Workspace scanning and declarative rules | UNIT-02 / BOLT-08 | US-002 AC-001 | Durable source discovery | Read-only durable source adapter | NFR-005, NFR-016, R-010 |
| Exclusion of product templates and derived output | UNIT-02 / BOLT-08 | US-002 AC-004 | Repository content boundary | src/docs/ is not project memory | NFR-016, R-014 |
| Approval-status extraction | UNIT-02 / BOLT-08 | US-002 AC-001, US-003 | DurableSourceApprovalMetadata, ApprovalState | Artifacts declare their own approval | NFR-004, NFR-006, NFR-012 |
| Template approval suppression | UNIT-02 / BOLT-08 | US-002 AC-004 | ArtifactSource.isTemplate | Templates never carry project approval | NFR-016, R-014 |
| Deterministic observed version | UNIT-02 / BOLT-08 | US-004 AC-003 | Rebuild determinism | Content hash over normalized content | NFR-003, R-010 |
| Observation production | UNIT-02 / BOLT-08 | US-002, US-003 | DurableSourceObservation, ArtifactClassification | Feed the existing BOLT-02 pipeline | NFR-016 |
| Typed skip reporting | UNIT-02 / BOLT-08 | US-002 | Rebuild warnings | Unmatched files are data, not failures | NFR-006, R-010 |
| BOLT-08 tests | UNIT-02 / BOLT-08 | US-002, US-003 | UNIT-02 validation checklist | Real-tree verification | NFR-003, NFR-005, NFR-016, R-010 |

## Assumptions And Deviations

| Type | Description | Approval Status |
|------|-------------|-----------------|
| Assumption | Root-level Markdown files are candidates, so files like `PROJECT_STATUS.md` surface as reported skips rather than being invisible. | Approved by the plan's discovery-rule scope |
| Assumption | Content is CRLF-normalized before hashing and before storage, so the version and downstream token estimates are stable across platforms. | Approved by the plan's determinism guardrail |
| Assumption | Symlinks are not followed, to avoid cycles and to keep the scan inside the workspace. | Approved by the plan's read-only scope |
| Assumption | A default 1 MiB artifact size limit skips oversized files with a typed reason instead of loading them. | Approved by the plan's resilience scope |
| Assumption | `readArtifact` throws for a named file that cannot be read, while `scan` skips and reports, because a caller who names a file expects an answer. | Approved by `code_generation_followup_plan_bolt08.md` |
| Deviation | The reader declares `artifactType` through `DEFAULT_ARTIFACT_TYPE_RULES` rather than letting the classifier infer it. Required because `matchCategoryRule` tests directory rules with a leading slash, so root-level `session-logs/` would otherwise be unclassifiable. This uses the classifier's existing type-matching path and leaves BOLT-01 unmodified. | Within the plan's discovery-rule scope; recorded here for review. |
| Deviation | Approval extraction reads only the first verdict paragraph of the approval section, not the whole section. Required because `nfrs.md` places its NFR table directly under the approval heading with no intervening heading, and NFR-004's row contains the word "Historical". | Correctness fix found by the real-tree scan; recorded for review. |
| Deviation | A template's declared approval is forced to `draft` regardless of content, and an angle-bracket placeholder verdict resolves to `draft`. Required because ten `*_TEMPLATE.md` files carry the placeholder `<Pending review / Approved by <APPROVER> on <DATE> / Changes requested / Deferred>`, which a naive reading resolved to `changes_requested`. | Directly implements US-002 AC-004; recorded for review. |
| Deviation | `node:sqlite` continues to emit Node's experimental feature warning during tests inherited from BOLT-02. | Accepted by prior BOLT guardrails; final verification passes. |

## Verification Results

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | `tsc -p tsconfig.json` completed successfully. |
| TypeScript typecheck | `npm run typecheck` | Pass | `tsc -p tsconfig.json --noEmit` completed successfully. |
| Full tests | `npm test` | Pass | 59 tests passed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, and 8 BOLT-08 tests. |
| Discovery tests | BOLT-08 test suite | Pass | Include and exclude rules behave as data; `src/docs/`, `node_modules/`, `dist/`, and `.git/` are never scanned. |
| Approval extraction tests | BOLT-08 test suite | Pass | Approved, pending, changes-requested, superseded, placeholder, and absent sections all map correctly, with `draft` as the safe default. |
| Determinism tests | BOLT-08 test suite | Pass | Identical content yields an identical version, CRLF and LF agree, and changed content differs. |
| Resilience tests | BOLT-08 test suite | Pass | Unclassified, empty, oversized, and unreadable entries are reported and skipped rather than throwing. |
| Real-tree test | BOLT-08 test suite | Pass | 100 observations from this repository with no hand-written fixtures. |
| Read-only test | BOLT-08 test suite | Pass | The reader source references no write, create, delete, rename, or chmod API. |
| Boundary tests | BOLT-06 and BOLT-07 suites | Pass | `node:fs` and `node:crypto` are `node:`-prefixed, so the domain import boundary holds unchanged and no dependency was added. |

## Follow-Ups

- BOLT-08 Code Generation Report and Test Results approved on 2026-07-27; no BOLT-08 review artifacts remain pending.
- The 52 unclassified candidates are addressed by the approved `code_generation_followup_plan_bolt08a.md`, which classifies the ten domain-design documents and `PROJECT_STATUS.md` and adds explicit non-memory rules for the remainder.
- BOLT-09 will consume `WorkspaceScanResult` to write the JSONL event log and the file-backed SQLite index, and will own workspace-root and `.agent-memory/` resolution.
- If the BOLT-01 classifier is later fixed to match root-level directories, `DEFAULT_ARTIFACT_TYPE_RULES` can be reduced or removed.
