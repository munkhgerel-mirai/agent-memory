# AI-DLC Code Generation Follow-Up Plan - BOLT-14 Preview Release Readiness

**Project:** Agent-memory  
**Date:** 2026-09-22  
**Skill:** `ai-dlc-code-generation`  
**Approval Status:** Approved by the user on 2026-09-22 with BOLT-14 A/A/A

## Purpose

Produce measured, end-to-end evidence for an Agent-memory `0.1 MCP/CLI preview`, close contributor-facing documentation debt, and report every retained release criterion honestly after BOLT-13 is explicitly deferred.

This is a verification and release-readiness bolt, not an open-ended feature bolt. If the initial gap audit finds a missing product capability, BOLT-14 must record the gap and stop that criterion. Fixing it requires a separately approved follow-up plan.

No implementation, test, package-script, README replacement, report, or release-state transition is authorized until the scope addendum and this plan are explicitly approved. `PROJECT_STATUS.md` may record only that these plans exist and remain pending review.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Construction workflow | `ai-dlc-code-generation` follow-up | BOLT-14 adds tests, benchmark tooling, documentation, and verification reports against the implemented product. |
| Release target | `0.1 MCP/CLI preview` | Recommended scope-addendum choice; full V1 remains blocked by deferred US-005 AC-003. |
| Product surfaces under acceptance | CLI and MCP | Both are implemented and reviewed; local HTTP API is explicitly excluded and documented as deferred. |
| Dependency posture | No new dependency | Existing Node/TypeScript test tooling is sufficient for fixtures, subprocesses, timing, and assertions. |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Runtime | TypeScript 5.9, ESM, Node >=22.5.0. | Use Node built-ins and existing project patterns only. |
| Automated baseline | BOLT-12 recorded clean build/typecheck, 120 passing tests, and zero audit vulnerabilities. | Re-run rather than assume this evidence remains current. |
| Durable pipeline | Workspace scan, JSONL event log, SQLite projection, deterministic rebuild, tombstones, export, and delete exist. | Build real temporary-workspace acceptance flows across these components. |
| CLI | Context, query, inspect, rebuild, export, and delete are executable. | Use real child processes for fresh-session/operator evidence. |
| MCP | Official client integration and VS Code smoke are approved. | Add release-level file-to-MCP-context evidence without duplicating adapter tests. |
| Context packing | Section-level 2000-token startup pack works on this repository. | Measure representative scale and required-content presence. |
| Performance | NFR-001 and NFR-009 remain unmeasured. | Add a dedicated reproducible benchmark command and recorded results. |
| Delete | Tombstone-based governed delete exists; lifecycle-edge persistence is currently absent. | Verify all implemented cleanup targets and report `not_applicable` honestly for absent stores; do not invent edge persistence in this bolt. |
| README | Root README still describes the template. | Replace it with project-specific preview documentation. |
| Local API | Descriptors exist, server does not. | Document BOLT-13 as deferred; do not start a listener or claim US-005 AC-003. |

## BOLT-14 Scope

### In Scope

- Perform a release-gap audit mapping every retained preview criterion to executable evidence or an explicit unresolved gap.
- Add deterministic test-support code that creates isolated AI-DLC workspaces under the OS temporary directory.
- Add a file-to-index-to-context integration test using real Markdown artifacts, a real file-backed SQLite projection, and provenance-aware startup context.
- Add a fresh-process CLI acceptance flow covering rebuild, context, query, inspect, export, and confirmation-gated delete.
- Add a release-level MCP acceptance flow using the official client over stdio and the real workspace pipeline.
- Verify delete remains effective after process restart and rebuild while source Markdown remains unchanged.
- Verify export is portable JSON and contains target records, provenance, request/decision evidence, and timestamp metadata.
- Add a generated representative scale fixture with at least 1,000 lifecycle memory records and 10,000 valid event records.
- Measure startup-context retrieval only, separately from fixture generation and rebuild, against the NFR-001/NFR-009 ten-second target.
- Preserve the 2000-token startup budget and assert goal/status/next-step/provenance presence at scale.
- Replace the root template README with Agent-memory preview documentation: purpose, prerequisites, install/build, rebuild, CLI, MCP/VS Code, governance, storage layout, limitations, deferred local API, verification, and non-goals.
- Add explicit package scripts for release-readiness and scale checks if needed, using existing dependencies only.
- Run build, strict typecheck, full regression, focused release-readiness checks, scale measurement, and dependency audits.
- Create `code_generation_report_bolt14.md` and `test_results_bolt14.md` with commands, environment, timings, counts, pass/fail results, and remaining gaps.
- Update `PROJECT_STATUS.md` and write the BOLT-14 execution session log.

### Out Of Scope

- BOLT-13 implementation, any HTTP/gRPC listener, route/status mapping, CORS, authentication, or local API executable.
- Claiming US-005 AC-003 or full V1 complete.
- Implementing governed `write_memory` execution.
- Adding lifecycle-edge extraction/persistence if the gap audit confirms it is absent.
- Changing semantic retrieval from its approved disabled-by-default extension posture.
- Fixing unrelated product gaps discovered by the audit without a new approved plan.
- New runtime/dev dependencies, test frameworks, databases, hosted services, or infrastructure.
- npm publication, packaging/release upload, deployment, signing, or release tagging.
- Rewriting prior approved plans or historical reports.

## Human Decision Points

These decisions inherit the companion scope plan and must be approved together.

### BOLT-14-Q1 - Performance Dataset Interpretation

| Option | Trade-Off |
|--------|-----------|
| **A. 1,000 lifecycle artifacts plus 10,000 valid `MemoryEventRecord` JSONL entries (recommended)** | Directly exercises the implemented durable-source and event-log pipeline and matches NFR-009's “raw/event records” wording without enabling raw-observation retention. |
| B. 1,000 lifecycle artifacts plus 10,000 synthetic raw observations outside the product pipeline | Measures an unimplemented storage path and could produce misleading evidence. |

**Recommendation:** Option A. Record event-type distribution and replay/supersession counts in Test Results.

**Decision:** Option A selected by the user on 2026-09-22. Use 1,000 lifecycle artifacts and 10,000 valid `MemoryEventRecord` JSONL entries.

### BOLT-14-Q2 - Ten-Second Measurement Boundary

| Option | Trade-Off |
|--------|-----------|
| **A. Fresh process/client retrieval from an already persisted index (recommended)** | Measures the stated fresh-session startup outcome and excludes one-time fixture generation/rebuild cost. Rebuild timing is reported separately. |
| B. Include full scan and rebuild in the ten-second target | Tests a stronger but different requirement and may conflate maintenance work with startup retrieval. |

**Recommendation:** Option A. Run multiple fresh-process samples, report every sample and the maximum, and require every measured retrieval to remain within ten seconds on the recorded machine.

**Decision:** Option A selected by the user on 2026-09-22. Measure fresh process/client retrieval from an already persisted index and report rebuild timing separately.

### BOLT-14-Q3 - Discovered Capability Gaps

| Option | Trade-Off |
|--------|-----------|
| **A. Stop and report per criterion; require a new approved fix plan (recommended)** | Keeps verification honest and bounded. Passing criteria continue; the release verdict remains not ready until required gaps are resolved or explicitly deferred. |
| B. Implement fixes inside BOLT-14 | Risks uncontrolled feature expansion and weakens the approval boundary. |

**Recommendation:** Option A.

**Decision:** Option A selected by the user on 2026-09-22. Stop and report per failed criterion; require a separate approved fix plan for product-capability gaps.

## Planned Test Assets

| Proposed Asset | Responsibility |
|----------------|----------------|
| `tests/support/v1-workspace-fixture.ts` | Deterministically generate small acceptance and 1,000/10,000 scale workspaces under a temporary root. |
| `tests/v1-release-readiness.test.ts` | Exercise file-to-index-to-CLI/MCP context, provenance, export, delete, restart, and rebuild behavior. |
| `tests/v1-scale.test.ts` | Generate/validate scale data, measure fresh-process retrieval separately from rebuild, and emit machine-readable timing/count evidence. |
| `npm run test:v1-readiness` | Build and run the focused functional release-readiness suite. |
| `npm run test:v1-scale` | Build and run the explicit scale/latency check outside the ordinary fast regression path. |

Exact filenames may be adjusted to existing repository naming conventions without changing responsibilities or adding dependencies.

## Traceability Map

| Planned Task | Story / AC | NFR / Risk | Evidence |
|--------------|------------|------------|----------|
| File-to-index-to-context acceptance | US-001, US-002, US-004 | NFR-001, NFR-002, NFR-003, NFR-006, R-010 | Real temporary workspace integration test |
| CLI fresh-process workflow | US-004, US-005 AC-002, US-006 | NFR-005, NFR-011, NFR-013, NFR-019 | CLI subprocess acceptance |
| MCP fresh-session context | US-001, US-005 AC-001 | NFR-001, NFR-002, NFR-006 | Official-client stdio acceptance |
| 1,000/10,000 scale measurement | US-001, US-004 | NFR-001, NFR-009, NFR-020 | Dedicated scale command and recorded timings |
| Delete after restart/rebuild | US-006 AC-003 | NFR-003, NFR-011, R-005, R-010 | Tombstone/source/index/retrieval assertions |
| Portable export | US-006 AC-004 | NFR-006, NFR-011 | JSON schema/content assertions |
| Project README | Contributor readiness | NFR-005, NFR-019, R-014 | Fresh-clone walkthrough review |
| Deferred local API disclosure | US-005 AC-003 deferred | NFR-004, NFR-005, NFR-019 | Scope addendum, README, status, final verdict |

## Execution Checklist

- [x] Record reviewer selections for SCOPE-Q1 through SCOPE-Q3. (A/A/A selected by user / 2026-09-22.)
- [x] Record reviewer selections for BOLT-14-Q1 through BOLT-14-Q3. (A/A/A selected by user / 2026-09-22.)
- [x] Record explicit human execution approval of both the scope addendum plan and this BOLT-14 follow-up plan. (User / 2026-09-22.)
- [x] Append Amendment 4 to the bolts addendum without editing any prior approved entry. (Appended 2026-09-22.)
- [x] Capture current build, typecheck, test-count, audit, and real-workspace baseline before BOLT-14 edits. (Build/typecheck pass; 120 tests pass with child-process permission; audits 0 vulnerabilities; real context 1977/2000 tokens.)
- [x] Produce a criterion-by-criterion gap audit and stop any criterion that needs unapproved feature work. (`release_gap_audit_bolt14.md`; US-003 lifecycle-edge persistence recorded as a separate-plan gap.)
- [x] Add deterministic small and scale workspace fixture support. (`tests/support/v1-workspace-fixture.ts`.)
- [x] Add file-to-index-to-context integration coverage. (Focused readiness suite passes.)
- [x] Add fresh-process CLI preview acceptance coverage. (Rebuild/context/query/inspect/export/delete/rebuild flow passes.)
- [x] Add release-level MCP acceptance coverage. (Official fresh stdio client passes.)
- [x] Add export and delete-after-restart/rebuild end-to-end coverage. (Portable export and persistent tombstone verified; source unchanged.)
- [x] Add the approved 1,000/10,000 scale dataset and measurement boundary. (1,000 artifacts, 10,000 events, max fresh retrieval 555.96ms; rebuild 35,885.55ms reported separately.)
- [x] Add focused release-readiness and scale package scripts without adding dependencies. (`test:v1-readiness`, `test:v1-scale`.)
- [x] Replace the root template README with Agent-memory preview documentation and explicitly state the deferred local API/full-V1 gap.
- [x] Run `npm run build` and `npm run typecheck`. (Pass.)
- [x] Run the full existing regression suite. (120/120 pass with child-process permission.)
- [x] Run the focused release-readiness suite and the explicit scale check. (2/2 and 1/1 pass.)
- [x] Run production and full dependency audits. (0 vulnerabilities in both.)
- [x] Create the BOLT-14 Code Generation Report and Test Results with raw counts/timings and an honest preview-readiness verdict.
- [x] Update `PROJECT_STATUS.md` and write the execution session log.
- [x] Request separate human review of the BOLT-14 report pair before declaring the preview ready. (Requested in the execution handoff; artifacts remain pending review.)

## Planned Verification

| Check | Passing Evidence |
|-------|------------------|
| Fresh workspace | CLI rebuild succeeds without manual data seeding and persists a file-backed index. |
| Deterministic rebuild | Deleting the derived SQLite index and rebuilding produces equivalent active memory from Markdown and JSONL. |
| Startup context | Fresh CLI and MCP processes return goal, phase/status, next steps, category, and provenance within 2000 tokens. |
| Scale | At least 1,000 lifecycle records and 10,000 valid event records are present; every recorded fresh-process retrieval is <=10 seconds. |
| Export | Output is portable JSON with exact targets, provenance, operation evidence, and timestamp. |
| Delete | Confirmed delete removes active retrieval state, remains deleted after restart/rebuild, and does not modify the Markdown source. |
| Governance | Unconfirmed delete and unavailable/unapproved write remain non-successful on retained surfaces. |
| MCP | Official client lists and invokes the approved tools with no protocol error. |
| CLI | Context/query/inspect/rebuild/export/delete commands return expected JSON and exit statuses. |
| Deferred API | No HTTP listener is created; README/status/verdict state that US-005 AC-003 and full V1 remain deferred. |
| Documentation | A new contributor can build, rebuild, use CLI, and configure MCP using only the project README. |
| Regression | Build and strict typecheck are clean; full suite and focused suites pass; audits report no unresolved vulnerability. |

## Release Verdict Rules

- `Preview ready` requires every retained MCP/CLI preview criterion to pass, no unresolved high-severity security or data-integrity defect, and approved BOLT-14 report/test artifacts.
- `Preview not ready` is required if a retained criterion fails or requires unapproved feature work.
- `Full V1` must not be declared while BOLT-13 and US-005 AC-003 remain deferred.
- Passing local measurements are evidence for the recorded machine/environment, not a guarantee for all hardware.

## Approval Gate

- Execution requires approval of both this plan and the companion scope addendum, including explicit approval of all recommended or alternate decision choices.
- Approval authorizes only the BOLT-14 scope enumerated above, append-only Amendment 4, current-status updates, README replacement, package-script additions using existing dependencies, tests, and BOLT-14 reports.
- Any discovered feature gap, new dependency, runtime surface, domain/storage contract change, deployment action, publication, or full-V1 declaration requires separate approval.
- BOLT-14 reports require separate human review after execution; passing automated checks do not self-approve release readiness.

## Execution Notes

- 2026-09-22: Plan created after the user's request to defer BOLT-13 and proceed with BOLT-14. No BOLT-14 source, test, script, README, report, dependency, or approved historical artifact was changed. Execution awaits reviewer decisions and explicit approval.
- 2026-09-22: User selected and approved BOLT-14-Q1/Q2/Q3 as A/A/A. Both plans still require explicit execution approval; Amendment 4 and BOLT-14 implementation remain blocked.
- 2026-09-22: User explicitly approved both plans. Amendment 4 and BOLT-14 execution are authorized within the recorded scope; BOLT-13, new dependencies, unplanned feature fixes, deployment, and publication remain unauthorized.
- 2026-09-22: Baseline passed after distinguishing sandbox `spawnSync EPERM` from product behavior. Gap audit recorded absent US-003 lifecycle-edge extraction/persistence and stopped that criterion per Q3-A; independent BOLT-14 evidence work continues.
- 2026-09-22: Functional readiness passed 2/2 and approved scale verification passed 1/1 at 1,000 artifacts / 10,000 events. Maximum fresh retrieval was 555.96ms; rebuild was 35,885.55ms and is reported separately. README and report pair completed with a `preview not ready` verdict due the retained US-003 gap.
- 2026-09-22: Final real-workspace rebuild completed with 204 candidates, 138 indexed, and zero warnings; startup context reflects the final status and uses 1992/2000 tokens.
- 2026-09-23: User approved the BOLT-14 Code Generation Report and Test Results. The evidence-review gate is complete; the `preview not ready` verdict remains because US-003 is unresolved and was not deferred.
