# Code Generation Report - BOLT-14 MCP/CLI Preview Release Readiness

**Project:** Agent-memory  
**Date:** 2026-09-22

## Approval Status

Approved by the user on 2026-09-23.

## Release Verdict

**Preview not ready.** BOLT-14 execution and all approved verification work are complete, but the retained US-003 lifecycle-relationship criterion has no extractor, persisted edge repository, or trace query. Per approved BOLT-14-Q3-A, BOLT-14 reports this product-capability gap and does not implement it without a separate plan.

Full V1 is also not declared because BOLT-13 and US-005 AC-003 are explicitly deferred by Amendment 4.

## Summary

- Appended Amendment 4 without rewriting the original V1 plan or earlier bolts/addenda.
- Deferred BOLT-13 until a named consumer supplies concrete transport and trust-boundary requirements.
- Rebaselined BOLT-14 to an honest `0.1 MCP/CLI preview` target.
- Added deterministic small and 1,000/10,000 scale workspace fixtures.
- Added fresh-process CLI acceptance across rebuild, context, query, inspect, export, confirmation-gated delete, restart, and rebuild.
- Added official-client MCP acceptance against a real file-backed workspace.
- Measured three fresh CLI retrievals and one fresh MCP retrieval at approved scale, all far below ten seconds.
- Replaced the template README with project-specific build, CLI, MCP, storage, governance, verification, and limitation guidance.
- Added no dependency and made no HTTP/gRPC, domain, storage, deployment, or publication change.

## Changed Files

| File | Change |
|------|--------|
| `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` | Appended Amendment 4 recording BOLT-13 deferral and the BOLT-14 preview target. |
| `docs/02-construction/02-design-plan/v1_release_scope_addendum_bolt13_defer_bolt14.md` | Recorded SCOPE A/A/A and explicit approval. |
| `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt14.md` | Recorded BOLT-14 A/A/A, approval, checklist progress, and execution evidence. |
| `docs/02-construction/04-code-generation/release_gap_audit_bolt14.md` | Added criterion-by-criterion pre-implementation gap audit. |
| `tests/support/v1-workspace-fixture.ts` | Added deterministic small and scale workspace generation. |
| `tests/v1-release-readiness.test.ts` | Added CLI/MCP/export/delete end-to-end acceptance. |
| `tests/v1-scale.test.ts` | Added approved scale fixture and fresh-session latency measurement. |
| `package.json` | Added focused `test:v1-readiness` and `test:v1-scale` scripts using existing dependencies. |
| `README.md` | Replaced template content with Agent-memory preview documentation. |
| `PROJECT_STATUS.md` | Updated current scope, evidence, verdict, blockers, and next steps. |
| `session-logs/20260922_codex_bolt14-preview-readiness.md` | Recorded the execution handoff. |

## Traceability And Results

| Area | Story / NFR / Risk | Result |
|------|--------------------|--------|
| File-to-index-to-context | US-001, US-002, US-004; NFR-002, NFR-003, NFR-006; R-010 | Pass through real temporary workspaces. |
| CLI surface | US-005 AC-002, US-006; NFR-005, NFR-013, NFR-019 | Pass through fresh child processes. |
| MCP surface | US-001, US-005 AC-001 | Pass through official fresh stdio client. |
| Startup latency/scale | NFR-001, NFR-009, NFR-020 | Pass under approved boundary: max fresh retrieval 555.96ms at 1,000/10,000 scale; pack remains <=2000 tokens. |
| Export | US-006 AC-004; NFR-006, NFR-011 | Pass: portable JSON contains exact target, provenance, operation request/decision, and timestamp. |
| Delete | US-006 AC-003; NFR-011; R-005 | Implemented stores pass after restart/rebuild and source stays unchanged; lifecycle-edge cleanup remains `not_applicable` due the US-003 gap. |
| Lifecycle relationships | US-003 | Gap: types exist but extraction, persistence, and query do not. Separate approved work required. |
| Local API | US-005 AC-003 | Deferred by approved Amendment 4; not represented as passed. |
| Contributor readiness | R-014 | Template README replaced and CLI help walkthrough verified. |

## Scale Evidence

Environment: Windows 10.0.26200, Node v24.11.0, npm 11.6.1.

| Measurement | Result |
|-------------|--------|
| Lifecycle artifacts scanned | 1,000 |
| Valid event records | 10,000 |
| Event distribution | 8,000 indexed; 1,000 removed; 1,000 deleted |
| Replayed / superseded events | 10,000 / 0 |
| Final projections | 7,000 |
| Fixture generation | 596.13ms |
| Rebuild | 35,885.55ms, reported separately from startup retrieval per Q2-A |
| Fresh CLI retrieval samples | 175.30ms; 186.13ms; 189.60ms |
| Fresh MCP connect + retrieval | 555.96ms |
| Maximum fresh retrieval | 555.96ms against 10,000ms target |

These numbers are local evidence for the recorded environment, not a guarantee for every machine.

## Verification Summary

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | Pass: 120/120 existing regression tests |
| `npm run test:v1-readiness` | Pass: 2/2 focused end-to-end tests |
| `npm run test:v1-scale` | Pass: 1/1 scale test |
| Total distinct automated tests | 123 passed |
| `npm audit --omit=dev` | Pass: 0 vulnerabilities |
| `npm audit` | Pass: 0 vulnerabilities |
| README CLI walkthrough | Pass: built entrypoint returns documented commands and exit codes |
| Final real-workspace rebuild/context | Pass: 204 candidates, 138 indexed, 0 warnings; current context 1992/2000 tokens |

## Deviations And Failures Encountered

- The first restricted regression run failed before assertions because the sandbox denied a local Node child process with `spawnSync EPERM`. The approved rerun with child-process permission passed 120/120; this is environment evidence, not a product defect.
- The first two focused readiness runs exposed test-harness assumptions about the existing CLI JSON envelope and inspect payload. Only the new BOLT-14 test parser was corrected; production behavior was not changed. The final focused suite passes 2/2.
- Rebuild at the approved scale took about 35.9 seconds. This does not violate the selected Q2-A startup boundary, but it is recorded as an operability observation for future optimization.
- The final real-workspace rebuild appended three removal events for artifacts no longer present and superseded twelve older events; it completed without warnings and current context reflects the final status/verdict.

## Scope Integrity

- No runtime or development dependency was added.
- No HTTP or gRPC listener, route, executable, or network configuration was added.
- No lifecycle-edge feature was implemented after the audit found the gap.
- No governed write implementation, semantic provider, iii dependency, deployment, publication, tag, or release upload was added.
- Approved historical plans and reports were not rewritten; the new scope was appended through Amendment 4.

## Follow-Ups

1. Report and Test Results review completed on 2026-09-23; the evidence is approved without changing the release verdict.
2. Create a separate approval-gated plan for US-003 lifecycle-edge extraction, persistence, and trace queries, or explicitly defer US-003 from the preview target through another approved scope decision.
3. Re-run the BOLT-14 readiness verdict after the retained US-003 blocker is resolved or approved as deferred.
4. Reopen BOLT-13 only when a named consumer provides concrete transport and trust-boundary requirements.
