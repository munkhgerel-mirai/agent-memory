# AI-DLC Code Generation Follow-Up Plan - BOLT-04 / UNIT-04

**Project:** Agent-memory
**Date:** 2026-06-16
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-06-16

## Purpose

Plan the next AI-DLC Code Generation slice after the approved BOLT-03 / UNIT-02 retrieval and startup context pack foundation.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-04 code-generation reports, or BOLT-04 test-results reports until this plan is explicitly approved by the human reviewer.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | BOLT-03 review outputs are approved; future code and test generation requires a new follow-up plan. |
| Next implementation slice | BOLT-04 / UNIT-04 Privacy, Governance, And Memory Operations | `bolts_plan.md` marks BOLT-04 as parallel-safe after BOLT-01 and required before BOLT-05 interfaces. BOLT-04 provides policy controls needed before broad write/retrieval surfaces. |

## Approved Inputs

| Input | Status | Path |
|-------|--------|------|
| User stories | Approved | `docs/01-inception/02-user-stories/all_user_stories.md` |
| NFRs | Approved | `docs/01-inception/03-nfrs/nfrs.md` |
| Risk register | Approved | `docs/01-inception/04-risks/risk_register.md` |
| Units composition | Approved | `docs/01-inception/05-units/units_composition.md` |
| Bolts plan | Approved | `docs/01-inception/06-bolts/bolts_plan.md` |
| Technology Decisions | Approved | `docs/02-construction/01-architecture/technology_decisions.md` |
| System Architecture | Approved | `docs/02-construction/01-architecture/system_architecture.md` |
| UNIT-04 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_04_privacy_governance_and_memory_operations.md` |
| UNIT-04 Logical Design | Approved | `docs/02-construction/03-domain-design/unit_04_privacy_governance_and_memory_operations_logical_design.md` |
| BOLT-03 Code Generation Report | Approved | `docs/02-construction/04-code-generation/code_generation_report_bolt03.md` |
| BOLT-03 Test Results | Approved | `docs/02-construction/04-code-generation/test_results_bolt03.md` |
| Code Generation skill and templates | Available | `docs/00-methodology/01-skills/ai-dlc-code-generation/SKILL.md`, `docs/02-construction/04-code-generation/` |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Runtime package | TypeScript/Node package scaffold exists with strict TypeScript checks and direct compiled test execution. | Reuse the existing approved runtime and test setup. |
| Lifecycle core | UNIT-01 provides approval states, categories, artifact source metadata, lifecycle memory records, edge types, and historical policy. | BOLT-04 should reuse approval/status/category vocabulary instead of redefining it. |
| Local storage/rebuild/search | BOLT-02 provides durable source observations, JSONL events, rebuild runs, projection records, and local search. | BOLT-04 should define governance metadata and cleanup/export semantics that later storage/interface slices can apply. |
| Startup retrieval/context packs | BOLT-03 provides token-bounded context packing over projected memory. | BOLT-04 policy decisions will later be applied before retrieval packing and broad interfaces. |
| Current tests | UNIT-01, BOLT-02, and BOLT-03 tests pass, 17 total. | Add focused BOLT-04 tests and keep existing tests passing. |

## Implementation Authorization Requested By This Plan

If this plan is approved, the following implementation authorizations are included for BOLT-04 only:

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Add governance domain types | Add TypeScript types/factories for memory candidates, visibility scope, provenance stamp, retention rule, redaction decision, operation request, and operation decision. | Keep policy/domain concepts independent from CLI/MCP/API presentation and concrete storage implementation. |
| Add sensitive content guard | Implement local heuristic detection for secret-like values and sensitive markers with allow/redact/block/approval-required outcomes. | Heuristics are conservative and replaceable; do not claim enterprise-grade DLP. |
| Add governance policy engine foundation | Implement write/inspect/delete/export decision helpers using visibility, approval, provenance, retention, and redaction metadata. | Policy must block or redact unsafe durable writes before storage. |
| Add delete/export operation semantics | Define domain-level operation decisions and cleanup/export contracts needed by later UNIT-03 surfaces and UNIT-02 cleanup. | Do not implement CLI/API endpoints or actual filesystem/export packaging in this slice. |
| Add retention policy foundation | Implement approved lifecycle memory retention and opt-in raw observation retention validation. | Raw observations remain disabled by default; TTL-enabled raw retention requires explicit policy metadata. |
| Add BOLT-04 tests | Add tests for secret redaction/blocking, provenance requirements, visibility defaults, raw observation TTL validation, delete/export operation decisions, and approval-required shared writes. | Keep tests traceable to US-006, NFR-007, NFR-008, NFR-011, NFR-012, NFR-017, NFR-018, R-004, R-005, R-012, and R-013. |
| Produce BOLT-04 Code Generation artifacts | Create `docs/02-construction/04-code-generation/code_generation_report_bolt04.md` and `docs/02-construction/04-code-generation/test_results_bolt04.md`. | Do not rewrite approved BOLT-01, BOLT-02, or BOLT-03 report/test artifacts. |

## Scope For BOLT-04

### In Scope

- UNIT-04 governance domain foundation.
- Memory candidate and governed memory metadata model.
- Visibility scopes: private, workspace, and team-shared.
- Provenance stamp validation requiring source, actor, timestamp, approval state, visibility, and retention metadata.
- Redaction decision model with allow, redact, block, and approval-required outcomes.
- Sensitive content guard with local heuristic detection of common secret-like patterns.
- Governance policy engine foundation for durable write decisions.
- Retention rule foundation for approved lifecycle memory and explicitly enabled raw observations.
- Domain-level delete/export/inspect/write operation request and decision semantics.
- Tests for policy decisions, provenance, visibility, redaction/blocking, retention, delete/export decisions, and approval-required outcomes.
- BOLT-04-specific Code Generation Report and Test Results artifacts.

### Out Of Scope

- CLI, MCP, local API, capability router, and job coordinator implementation.
- iii-engine adapter implementation or runtime job scheduling.
- Actual file export package generation or filesystem deletion.
- Full enterprise IAM/permissions model.
- Semantic vector deletion implementation; only future cleanup contract semantics are modeled.
- Hosted/server profile, deployment, packaging for release, or README rewrite.
- Claiming enterprise-grade secret/PII detection beyond the local heuristic guard.

## Open Questions Resolved Or Deferred By This Plan

| Question | Plan Position | Rationale |
|----------|---------------|-----------|
| LD-UNIT04-OQ-001: What conservative default TTL should be used when a workspace explicitly enables raw observations? | Resolve for BOLT-04 with a conservative `raw-observation-short` policy that requires an explicit positive TTL value; recommend 24 hours in tests only as policy input, not a global default. | ADR-004 says no automatic raw retention; BOLT-04 can validate explicit TTL without forcing a universal default. |
| LD-UNIT04-OQ-002: Should team-shared memory always require explicit human approval even when sourced from an approved artifact? | Resolve for BOLT-04 by requiring explicit approval evidence for team-shared durable writes. | Least-sharing default mitigates R-013. |
| LD-UNIT04-OQ-003: What export formats are required in the first implementation slice? | Defer. | BOLT-04 models export decisions and provenance requirements; UNIT-03 interface/export packaging can select formats later. |

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Governance metadata and provenance model | UNIT-04 / BOLT-04 | US-006 AC-002 | ProvenanceStamp, GovernedMemory | NFR-008, NFR-012, R-013 |
| Sensitive content guard and redaction decisions | UNIT-04 / BOLT-04 | US-006 AC-001 | SensitiveContentPolicyService, RedactionDecision | NFR-007, NFR-018, R-004 |
| Visibility and shared-write approval decisions | UNIT-04 / BOLT-04 | US-006 AC-002 | VisibilityScope, GovernancePolicy | NFR-008, NFR-018, R-013 |
| Retention policy foundation | UNIT-04 / BOLT-04 | US-006 | RetentionRule, Retention Policy Engine | NFR-017, R-012 |
| Delete operation decision semantics | UNIT-04 / BOLT-04 | US-006 AC-003 | MemoryOperationRequest, MemoryDeletionService | NFR-011, R-005 |
| Export operation decision semantics | UNIT-04 / BOLT-04 | US-006 AC-004 | MemoryOperationRequest, MemoryExportService | NFR-011, NFR-012 |
| BOLT-04 tests and reports | UNIT-04 / BOLT-04 | US-006 | UNIT-04 validation checklist | NFR-007, NFR-008, NFR-011, NFR-012, NFR-017, NFR-018, R-004, R-005, R-012, R-013 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-04 Code Generation follow-up plan.
- [x] Reconfirm approved inputs and verify no upstream approval has changed.
- [x] Reinspect the current TypeScript package/source/test baseline.
- [x] Add governance domain types for candidates, visibility, provenance, retention, redaction, and operations.
- [x] Implement sensitive content guard with conservative local heuristics.
- [x] Implement governance write decision foundation with allow/redact/block/approval-required outcomes.
- [x] Implement retention policy validation for approved lifecycle memory and explicit raw observation TTL.
- [x] Implement delete/export/inspect/write operation request and decision semantics.
- [x] Add tests for redaction/blocking, provenance validation, visibility defaults, team-shared approval requirement, retention validation, and delete/export decisions.
- [x] Add `src/docs/` fixtures only if needed for tests.
- [x] Run available verification checks: build, typecheck, tests.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt04.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt04.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes.
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01, BOLT-02, BOLT-03, and BOLT-04 behavior. |
| Secret redaction/blocking tests | BOLT-04 test suite | Verify secret-like values are redacted or blocked before durable storage. |
| Provenance and visibility tests | BOLT-04 test suite | Verify durable memory includes source, actor, timestamp, approval status, visibility, and retention policy. |
| Delete/export decision tests | BOLT-04 test suite | Verify delete/export operations require actor, purpose, target scope, and policy decision evidence. |
| Retention validation tests | BOLT-04 test suite | Verify raw observation retention requires explicit TTL-enabled policy metadata. |

## Approval Gate

- Execution is blocked until the human explicitly approves this plan.
- Approval of this plan authorizes only the BOLT-04 / UNIT-04 implementation described here.
- Any CLI/MCP/local API, iii adapter, semantic retrieval, actual export package generation, filesystem deletion, deployment work, README rewrite, new dependency, or deviation from this plan requires a new approval or approved follow-up plan.

## Execution Notes

- 2026-06-16: Plan created by GitHub Copilot for human review. No implementation, tests, dependency changes, runtime structure changes, BOLT-04 code-generation report, or BOLT-04 test-results report were created.
- 2026-06-16: User approved this BOLT-04 follow-up plan; execution started for BOLT-04 / UNIT-04 only.
- 2026-06-16: Reconfirmed approved input artifacts and current TypeScript/BOLT-03 baseline before implementation.
- 2026-06-16: Implemented governance domain types, provenance and retention validation, sensitive-content guard, governed write decisions, and memory operation decision semantics.
- 2026-06-16: Added BOLT-04 tests for redaction, approval-required sensitive content, provenance, visibility defaults, raw observation TTL, team-shared approval, governed writes, and delete/export decisions; no `src/docs/` fixtures were needed.
- 2026-06-16: Verification passed: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 26 tests passing.
- 2026-06-16: Created BOLT-04 Code Generation Report and Test Results artifacts. No final verification failures occurred.
- 2026-06-16: Updated project status to show BOLT-04 Code Generation complete and pending human review.
- 2026-06-16: Wrote BOLT-04 implementation session log.