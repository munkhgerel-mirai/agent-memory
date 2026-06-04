# AI-DLC Code Generation Plan

**Project:** Agent-memory  
**Date:** 2026-06-05  
**Skill:** `ai-dlc-code-generation`  
**Approval Status:** Pending human review

## Purpose

Begin the AI-DLC Code Generation gate by planning the first implementation slice from the approved Logical Design and System Architecture artifacts.

This plan is an approval gate. Do not create implementation code, tests, package files, dependency files, runtime structure changes, code-generation reports, or test-results reports until this plan is explicitly approved by the human reviewer.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` | `skill_to_artifact_map.md` identifies Code Generation as the next step after approved Logical Design. |
| First implementation slice | BOLT-01 / UNIT-01 Lifecycle Memory Core foundation | Lifecycle categories, memory records, approval state, historical policy, and typed lifecycle relationships are prerequisites for storage, governance, retrieval, interfaces, iii adapter, and semantic retrieval. |

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
| UNIT-01 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core.md` |
| UNIT-01 Logical Design | Approved | `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core_logical_design.md` |
| Code Generation skill and templates | Available | `docs/00-methodology/01-skills/ai-dlc-code-generation/SKILL.md`, `docs/02-construction/04-code-generation/` |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Runtime package | No `package.json` or `tsconfig.json` exists. | Plan requests approval to create a TypeScript/Node package structure. |
| Current source | `src/placeholder_app.py` is template placeholder code. | Treat as non-production; plan requests approval to replace/remove during execution. |
| Current tests | `src/tests/test_placeholder.py` is a template placeholder test. No root `tests/` folder exists. | Treat as non-production; plan requests approval to create root `tests/` for TypeScript tests and replace/remove placeholder test. |
| Product docs / fixtures | `src/docs/README.md` exists as the approved location for runtime templates, classified Markdown examples, and fixtures. | Planned test fixtures/examples must use `src/docs/`, not root `docs/`. |
| Local tools | `node v24.11.0`, `npm 11.6.1`, and `python 3.13.13` are available locally. | TypeScript/Node implementation is feasible after dependency approval. |

## Implementation Authorization Requested By This Plan

If this plan is approved, the following implementation authorizations are included for this first slice only:

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Create TypeScript/Node package scaffold | Add `package.json`, `tsconfig.json`, and TypeScript source/test folder conventions. | Use approved ADR-001; do not add framework/runtime dependencies beyond explicitly listed dev tooling. |
| Replace template Python placeholder skeleton | Remove or replace `src/placeholder_app.py` and `src/tests/test_placeholder.py`. | Treat them as non-production placeholders; do not remove `src/docs/`. |
| Create root `tests/` folder | Add TypeScript tests for UNIT-01 domain behavior. | Keep tests traceable to US-002, US-003, NFR-004, NFR-006, NFR-015, and NFR-016. |
| Add minimal TypeScript dev tooling | Proposed dev dependencies: `typescript`, `@types/node`. Proposed test runner: Node built-in `node:test`. | No runtime dependencies for this slice unless separately approved. |
| Produce Code Generation artifacts | Create `docs/02-construction/04-code-generation/code_generation_report.md` and `test_results.md`. | Use approved templates and include traceability/verification evidence. |

## Scope For First Slice

### In Scope

- UNIT-01 domain-only implementation for lifecycle memory core.
- AI-DLC memory category catalog for v1 categories.
- Value objects and domain types for memory category, artifact source, approval state, edge type, classification rationale, and lifecycle memory identity.
- Lifecycle memory record creation and validation logic.
- Artifact classification rules sufficient for approved AI-DLC artifact paths and template-vs-project boundary.
- Typed lifecycle relationship definitions and validation.
- Historical record policy for approved artifact preservation and supersession/addendum events.
- Unit tests for domain invariants, category mapping, template exclusion, edge validation, and historical record behavior.
- Code generation report and test results report.

### Out Of Scope

- SQLite/FTS implementation, JSONL event persistence, local index rebuild, retrieval ranking, and context pack building.
- Governance policy engine, secret/PII scanning, delete/export implementation, and raw observation TTL implementation.
- MCP server, CLI command surface, local API, iii-engine adapter, job orchestration, and observability integration.
- Semantic retrieval, embeddings, vector index, or disabled semantic runtime plumbing.
- Deployment, packaging for release, hosted/server profile, Postgres, pgvector, or cloud infrastructure.
- Root `README.md` rewrite unless a later approved documentation plan includes it.

## Open Questions Resolved Or Deferred By This Plan

| Question | Plan Position | Rationale |
|----------|---------------|-----------|
| SYS-LD-OQ-001: Which implementation slice should be first? | Resolve by selecting BOLT-01 / UNIT-01 Lifecycle Memory Core foundation. | It is the dependency base for storage, governance, retrieval, integration, iii, and semantic extension. |
| SYS-LD-OQ-002: Should local API ship in v1? | Defer. Local API is out of scope for this first slice. | Interface implementation belongs to UNIT-03 after core/storage/governance foundations exist. |
| SYS-LD-OQ-003: What default raw observation TTL should be used when enabled? | Defer. Raw observations remain disabled by default and are out of scope for this first slice. | TTL matters during UNIT-04 governance implementation planning. |
| SYS-LD-OQ-004: Should semantic retrieval have disabled experimental plumbing in v1? | Defer and exclude from this first slice. | UNIT-05 is optional and should not distract from the lifecycle core. |
| LD-UNIT01-OQ-001: Custom category extension governance after v1 | Defer. | First slice can model extension status but should not implement custom extension governance. |
| LD-UNIT01-OQ-002: Multi-category memories or one primary category plus secondary tags? | Plan recommendation: one primary category plus optional secondary tags for v1. | Keeps retrieval/ranking explainable while allowing additional classification hints. Human approval of this plan approves this implementation stance for the first slice. |

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| TypeScript package scaffold | BOLT-01 / UNIT-01 | US-002, US-003 | ADR-001, UNIT-01 Logical Design provider-agnostic core | NFR-015, R-014 |
| Memory category catalog | BOLT-01 / UNIT-01 | US-002 AC-002 | Category Catalog | NFR-016, R-001 |
| Artifact source and template boundary model | BOLT-01 / UNIT-01 | US-002 AC-001, AC-004 | Artifact Classifier, Artifact Source | NFR-006, NFR-016, R-001 |
| Lifecycle memory record factory/validation | BOLT-01 / UNIT-01 | US-002, US-003 | Lifecycle Memory Registry | NFR-004, NFR-006, NFR-015 |
| Lifecycle relationship catalog | BOLT-01 / UNIT-01 | US-003 AC-001, AC-002 | Lifecycle Relationship Catalog | NFR-006, NFR-016, R-010 |
| Historical record policy | BOLT-01 / UNIT-01 | US-003 AC-003 | Historical Record Policy | NFR-004 |
| Unit tests and fixtures | BOLT-01 / UNIT-01 | US-002, US-003 | UNIT-01 failure modes and security/privacy notes | NFR-004, NFR-006, NFR-015, NFR-016, R-001 |

## Execution Checklist

- [ ] Record explicit human approval of this Code Generation plan.
- [ ] Reconfirm approved inputs and verify no upstream approval has changed.
- [ ] Create TypeScript/Node package scaffold with approved minimal dev tooling.
- [ ] Replace or remove non-production Python placeholder source/test files.
- [ ] Create root `tests/` folder for TypeScript tests.
- [ ] Implement UNIT-01 memory category catalog and category validation.
- [ ] Implement UNIT-01 value objects and lifecycle memory record model.
- [ ] Implement artifact source classification rules and template-vs-project boundary.
- [ ] Implement lifecycle relationship catalog and edge validation.
- [ ] Implement historical record policy.
- [ ] Add tests for category coverage, memory invariants, template exclusion, relationship validation, and historical record behavior.
- [ ] Add `src/docs/` classified examples or fixtures only if needed for tests.
- [ ] Create `docs/02-construction/04-code-generation/code_generation_report.md`.
- [ ] Run available verification checks: install/build/typecheck/tests using approved toolchain.
- [ ] Create `docs/02-construction/04-code-generation/test_results.md`.
- [ ] If tests/checks fail, document failures and request approval before applying non-trivial fixes.
- [ ] Update `PROJECT_STATUS.md`.
- [ ] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| Dependency install | `npm install` after approval | Install approved dev tooling and create lockfile. |
| TypeScript build/typecheck | `npm run build` or `npm run typecheck` after scripts are created | Verify TypeScript source compiles. |
| Unit tests | `npm test` using Node built-in `node:test` | Verify UNIT-01 domain behavior. |
| Traceability review | Compare changed files to this plan and Code Generation Report | Confirm implementation maps to approved Unit/story/NFR/risk scope. |
| Placeholder audit | Confirm placeholder Python source/test are removed or clearly replaced | Avoid confusing template skeletons with production code. |

## Approval Gate

- Execution is blocked until the human explicitly approves this plan.
- Approval of this plan authorizes only the first-slice implementation described here.
- Any additional runtime dependency, database implementation, CLI/MCP/local API surface, iii adapter, semantic retrieval, deployment work, or deviation from this plan requires a new approval or approved follow-up plan.
- If dependency installation fails because of network/sandbox constraints, record the failure in `test_results.md` and request approval before changing the toolchain.

## Execution Notes

- 2026-06-05: Plan created by Codex for human review. No implementation, tests, package files, dependency files, runtime structure changes, code-generation report, or test-results report were created.
