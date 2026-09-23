# Test Results - BOLT-06 / UNIT-03

**Project:** Agent-memory
**Date:** 2026-07-27
**Related Code Generation Report:** `docs/02-construction/04-code-generation/code_generation_report_bolt06.md`

## Approval Status

Approved by user on 2026-07-27.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Source and tests compile with `tsc -p tsconfig.json`. |
| TypeScript typecheck | `npm run typecheck` | Pass | Strict TypeScript check passes with no emit. |
| Unit/integration tests | `npm test` | Pass | 41 tests passed, 0 failed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, and 8 BOLT-06 tests. |
| Trigger descriptor tests | BOLT-06 tests | Pass | Every trigger with a capability reuses that capability's BOLT-05 job type and governance flag; `memory.consolidate` is descriptor-only; unknown labels are rejected. |
| No-iii fallback tests | BOLT-06 tests | Pass | With no binding, a `disabled` binding, and an `unavailable` binding, all seven capabilities stay locally available, execution mode stays `local`, active triggers are empty, and the adapter-dependent capability set is empty. |
| Binding validation tests | BOLT-06 tests | Pass | Missing binding ID, unknown trigger labels, and reasonless status changes throw `RuntimeAdapterValidationError`; a new binding starts `disabled`; status changes return copies. |
| Trigger routing tests | BOLT-06 tests | Pass | An enabled, workspace-matched, declared trigger maps to an `internal` capability request with a correlated request ID; no execution happens during mapping. |
| Trigger rejection tests | BOLT-06 tests | Pass | Routing is rejected for no binding, a disabled binding, a workspace mismatch, and an undeclared trigger; `memory.consolidate` returns `descriptor_only` with no request. |
| Governance preservation tests | BOLT-06 tests | Pass | An adapter-triggered delete with no targets is denied by the BOLT-04 decision; with targets it is allowed and produces a queued job. With the adapter off, the trigger never reaches a capability. |
| Observation tests | BOLT-06 tests | Pass | Records carry status, timing, provenance link, errors, and retry eligibility; raw target scope is replaced by `scope:3-targets`; secret-like error text is redacted and publication is `withheld`; `runtime_adapter` publication is skipped while the adapter is not enabled or the target is not declared. |
| Boundary tests | BOLT-06 tests | Pass | No iii/Temporal/Inngest package dependency is declared, and every import in `src/**/*.ts` is relative or `node:`-prefixed. |

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| None | No failed checks in final verification. | N/A | N/A | No |

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | Tests cover US-007 AC-001 (trigger label mapped to an approved capability and job type), AC-002 (core local mode valid for every adapter state), and AC-003 (job observation carries status, timing, result, and provenance). | Observation against a live iii runtime is deferred; the adapter target path is exercised only through publication decisions. |
| Domain invariants | Tests cover RuntimeAdapterBinding invariants (binding starts disabled, core stays valid without it, status is observable with a reason), AdapterStatus transitions, and JobResultSummary requiring a human-readable failure reason. | Repository persistence for bindings (`findActiveBinding`, `saveBinding`, `disableBinding`) is not implemented in this slice. |
| Integration points | Trigger routing reuses BOLT-05 capability definitions and the Capability Router; observation reuses BOLT-05 memory job summaries; withholding reuses the BOLT-04 sensitive-content heuristic. | Rebuild orchestration, export packaging, delete execution, and context retrieval handlers remain unattached. |
| NFR / risk scenarios | Tests and implementation address NFR-005, NFR-011, NFR-014, NFR-015, R-004, R-005, R-006, R-011, and R-013 for BOLT-06. The source-import scan makes NFR-015 machine-enforced. | NFR-014 remains partly deferred by its own applicability note: full runtime job observability applies once an iii adapter is enabled. |

## Follow-Ups

- BOLT-06 Test Results approved on 2026-07-27.
- Preserve the source-import boundary test when a concrete iii adapter is added, so the adapter package stays outside `src/domain/`.
- Add persistence tests for `RuntimeAdapterBindingRepository` when binding storage is planned.
- Revisit `memory.consolidate` once an approved consolidation domain port exists.
