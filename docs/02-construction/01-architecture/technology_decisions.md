# Technology Decisions

**Project:** Agent-memory
**Date:** 2026-06-04
**Decision Scope:** V1 implementation language/runtime, iii-engine role, storage profile, raw observation retention, and optional semantic retrieval posture.

## Approval Status

Pending human selection and approval. This document contains AI-proposed recommendations only. No decision is binding until the Human Selection Gate records the user's selected, deferred, rejected, or more-analysis outcome and approval is recorded.

## Sources Reviewed

| Source | Current Observation | Decision Impact |
|--------|---------------------|-----------------|
| `https://github.com/iii-hq/iii` | iii presents Worker, Function, and Trigger as core primitives; it provides Node.js, Python, and Rust SDKs; its engine is Rust, with SDK and console surfaces in the monorepo. | Supports iii as a useful runtime adapter, but not as the core domain model. |
| `https://github.com/rohitg00/agentmemory` | agentmemory is a TypeScript/npm project for persistent coding-agent memory, built on iii, with MCP/Codex integration, hooks, skills, local server/viewer, and no external DB as a stated product attribute. | Supports TypeScript/npm and local-first memory as practical reference points, while Agent-memory remains AI-DLC-native rather than a clone. |

## Decision Summary

| ADR ID | Decision Area | Title | Status | Confidence | Reversibility | Human Selection | Approval |
|--------|---------------|-------|--------|------------|---------------|-----------------|----------|
| ADR-001 | Language / Runtime | Primary implementation language and package surface | Proposed | Medium | Medium | Pending Selection | Pending |
| ADR-002 | Runtime / Integration | iii-engine role for v1 | Proposed | High | High | Pending Selection | Pending |
| ADR-003 | Storage | Local-first storage and migration posture | Proposed | High | Medium | Pending Selection | Pending |
| ADR-004 | Privacy / Retention | Raw observation retention default | Proposed | Medium | High | Pending Selection | Pending |
| ADR-005 | Retrieval / Embeddings | Optional semantic retrieval posture | Proposed | High | High | Pending Selection | Pending |

## Decision Drivers

| Driver | Source | Importance | Notes |
|--------|--------|------------|-------|
| Fresh-session continuity under 2000 tokens | US-001, NFR-001, NFR-002, NFR-020 | Must | Retrieval and context packing must be fast, bounded, and explainable. |
| AI-DLC artifact-aware memory | US-002, US-003, UNIT-01, R-001 | Must | Technology choices must preserve lifecycle categories, approval gates, and traceability. |
| Local-first adoption | US-004, NFR-005, NFR-019 | Must | V1 should work without hosted infrastructure. |
| Rebuildable index | US-004, NFR-003, R-010 | Must | Derived indexes must be rebuildable from durable sources. |
| Framework-agnostic interfaces | US-005, UNIT-03, NFR-013, NFR-015 | Must | MCP, CLI, and local API should not couple the domain to one LLM runtime. |
| Sensitive memory protection | US-006, UNIT-04, NFR-007, NFR-008, NFR-011, NFR-017, NFR-018 | Must | Secrets, PII, visibility, delete, export, and retention rules need safe defaults. |
| Optional iii-engine adapter | US-007, UNIT-03, NFR-014, R-006 | Should | iii may improve jobs/observability, but core local mode should remain viable without it. |
| Optional semantic retrieval | US-008, UNIT-05, R-003, R-008, R-009 | Nice | Semantic recall should augment lifecycle retrieval, not replace or outrank it. |

## Candidate Comparison

| Decision Area | Candidate | Fit | Risks | Cost Impact | Operability | Reversibility | Notes |
|---------------|-----------|-----|-------|-------------|-------------|---------------|-------|
| TD-001 | TypeScript/Node package with CLI, MCP, and local API | High | Runtime needs careful domain boundaries to avoid cloning agentmemory conventions. | Low | High | Medium | Strong fit for npm, MCP, Codex/plugin ecosystem, and reference implementation patterns. |
| TD-001 | Python package with CLI, MCP, and local API | Medium | MCP/plugin/npm distribution may need more glue for agent ecosystems. | Low | Medium | Medium | Strong for local scripting and data processing; weaker fit with agentmemory/iii npm reference path. |
| TD-001 | Rust core with bindings | Medium | Higher implementation cost and slower iteration for v1. | Low | Medium | Low | Strong performance and safety, but premature unless profiling proves need. |
| TD-001 | Defer language selection | Low | Delays Logical Design and Code Generation. | Low | Low | High | Useful only if the human rejects current options. |
| TD-002 | iii-engine required for v1 | Medium | Creates hard dependency, licensing/ops/runtime setup risk, and contradicts core independence risk mitigation. | Medium | Medium | Low | Gives observability and triggers early, but increases delivery risk. |
| TD-002 | iii-engine optional first-class adapter with independent core local mode | High | Adapter behavior needs a clear boundary and tests. | Low | High | High | Best matches UNIT-03, NFR-015, R-006, and user interest in iii. |
| TD-002 | Defer iii adapter implementation to v1.1 while preserving boundary | Medium | Reduces runtime scope but may under-deliver US-007. | Low | High | High | Safe if v1 must focus only on core retrieval. |
| TD-003 | Markdown/docs plus append-only events plus rebuildable local SQLite/FTS-style index | High | Must avoid index/source divergence and define deterministic rebuild. | Low | High | Medium | Best matches approved Units and NFRs; index remains derived, not source of truth. |
| TD-003 | Direct Postgres/vector server profile | Low | Adds hosted/server complexity, concurrency/security work, and cost before v1 is proven. | Medium | Medium | Low | Better future server profile than v1 default. |
| TD-003 | Pluggable repository profile with local default and future server migration path | High | Requires interface discipline. | Low | High | High | Recommended alongside local default to reduce lock-in. |
| TD-004 | Short fixed raw observation TTL | Medium | One-size policy may be too strict or too loose across solo/team usage. | Low | High | High | Simple but less flexible. |
| TD-004 | Configurable TTL with safe default | High | Needs clear defaults and policy UI/CLI later. | Low | Medium | High | Balances privacy, audit, and workspace control. |
| TD-004 | No raw observation retention until explicit workspace policy exists | High | Limits automatic memory value until configured. | Low | High | High | Safest privacy default; lifecycle artifacts still persist. |
| TD-005 | Defer embeddings/provider selection from v1 | High | Semantic recall value waits until v1.1. | Low | High | High | Strongly reduces R-003 and keeps lifecycle retrieval authoritative. |
| TD-005 | Optional local semantic provider in v1.1 | High | Requires deletion/privacy handling for derived vectors. | Medium | Medium | Medium | Good future extension once baseline retrieval works. |
| TD-005 | Select hosted embedding/vector provider now | Low | Adds privacy, cost, lock-in, and hosted infrastructure risk. | Medium | Medium | Low | Conflicts with local-first v1 goals. |

## Human Selection Gate

AI recommendations are non-binding. The user must choose `Selected`, `Deferred`, `Rejected`, or `More Analysis Needed` for each decision area.

| Decision Area | Gate Status | AI-Recommended Option | Selected Option | Selector / Date | Selection Rationale | Conditions | Downstream Authorization | Notes |
|---------------|-------------|-----------------------|-----------------|-----------------|---------------------|------------|--------------------------|-------|
| TD-001 | Pending Selection | TypeScript/Node package with CLI, MCP, and local API | Pending | Pending | Pending | Keep domain model independent from runtime/storage packages. | Not authorized until selected and approved. | Recommended because agentmemory and Codex/MCP distribution fit npm well. |
| TD-002 | Pending Selection | iii-engine optional first-class adapter with independent core local mode | Pending | Pending | Pending | Core retrieval must work without iii configured. | Not authorized until selected and approved. | Recommended to use iii value without making it a hard dependency. |
| TD-003 | Pending Selection | Local-first durable docs/events plus rebuildable local index, behind pluggable repository interfaces | Pending | Pending | Pending | Derived indexes must be rebuildable and delete/export aware. | Not authorized until selected and approved. | Recommended to satisfy local-first v1 while preserving future server profile. |
| TD-004 | Pending Selection | No automatic raw observation retention by default; configurable TTL when enabled | Pending | Pending | Pending | Approved lifecycle artifacts persist; raw observations require explicit policy. | Not authorized until selected and approved. | Recommended as privacy-safe default. |
| TD-005 | Pending Selection | Defer embeddings/provider selection from v1; preserve pluggable semantic extension boundary for v1.1 | Pending | Pending | Pending | Lifecycle-authoritative retrieval remains primary. | Not authorized until selected and approved. | Recommended to reduce v1 delivery, privacy, and ranking risks. |

Gate rules:

- Keep ADR status `Proposed` until human selection and approval are both recorded.
- Record `Deferred`, `Rejected`, or `More Analysis Needed` when no candidate is selected.
- Do not update Logical Design, Code Generation, Deployment, Operations, dependency lists, runtime structure, or infrastructure from this decision until downstream authorization is recorded.

## ADR-001: Primary Implementation Language And Package Surface

- **Status:** Proposed
- **Decision Area:** Language / Runtime
- **Context:** Agent-memory needs CLI, MCP, local API, local workspace operation, and future optional runtime adapters. Approved Domain Design keeps the domain model independent from runtime/storage choices.
- **Decision:** AI recommends TypeScript/Node as the primary v1 package/runtime surface, pending human selection.
- **Human Selection Status:** Pending Selection
- **Selected Option:** Pending
- **Selector / Date:** Pending
- **Selection Rationale:** Pending
- **Selection Conditions:** Keep domain concepts in technology-neutral modules and enforce ports/adapters around storage, runtime jobs, and integrations.
- **Downstream Authorization:** Not authorized until human selection and approval are recorded.
- **Rationale:** TypeScript/Node aligns with npm distribution, MCP/Codex plugin integration, agentmemory reference patterns, and iii's Node SDK while still allowing clear domain boundaries.
- **Alternatives Considered:** Python package; Rust core with bindings; defer selection.
- **Consequences:** Faster agent-tooling integration and lower packaging friction; requires discipline to avoid coupling to agentmemory or iii internals.
- **Risks:** TypeScript implementation could drift into framework or runtime concerns unless boundaries are enforced.
- **Security / Privacy / Compliance Impact:** Neutral; depends on governance implementation.
- **Operational Impact:** Good local developer ergonomics through npm/npx-style workflows.
- **Cost Impact:** Low.
- **Migration / Rollback Impact:** Medium; future Python/Rust components can be added behind interfaces.
- **Reversibility:** Medium
- **Confidence:** Medium
- **Related Units:** UNIT-01, UNIT-02, UNIT-03
- **Related NFRs:** NFR-005, NFR-013, NFR-015, NFR-019
- **Related Risks:** R-006, R-011, R-014
- **Related Design Artifacts:** `unit_01_lifecycle_memory_core.md`, `unit_02_local_workspace_storage_and_retrieval.md`, `unit_03_framework_agnostic_integration_and_runtime_adapter.md`
- **Follow-Ups:** Logical Design should define module boundaries, CLI/MCP/local API ports, and package structure.
- **Approval:** Pending

## ADR-002: iii-engine Role For V1

- **Status:** Proposed
- **Decision Area:** Runtime / Integration
- **Context:** The user is interested in iii-engine. UNIT-03 models an optional runtime adapter and R-006 warns against making iii a hard dependency too early.
- **Decision:** AI recommends iii-engine as an optional first-class adapter, with Agent-memory core local mode independent from iii.
- **Human Selection Status:** Pending Selection
- **Selected Option:** Pending
- **Selector / Date:** Pending
- **Selection Rationale:** Pending
- **Selection Conditions:** Core indexing, retrieval, governance, delete/export, and context pack behavior must run without iii installed or configured.
- **Downstream Authorization:** Not authorized until human selection and approval are recorded.
- **Rationale:** iii's Worker/Function/Trigger model and console/observability are valuable for jobs and triggers, but required adoption would add setup, licensing, runtime, and lock-in risk.
- **Alternatives Considered:** iii required for v1; defer adapter implementation to v1.1.
- **Consequences:** Allows local-first v1 while keeping a clear path to iii-powered jobs, triggers, and observability.
- **Risks:** Optional adapter may require extra boundary tests and compatibility checks.
- **Security / Privacy / Compliance Impact:** Adapter must not bypass governance, redaction, retention, delete, or export rules.
- **Operational Impact:** Optional observability and runtime orchestration when enabled.
- **Cost Impact:** Low for local adapter; operational cost depends on deployment profile.
- **Migration / Rollback Impact:** High reversibility because core remains independent.
- **Reversibility:** High
- **Confidence:** High
- **Related Units:** UNIT-03
- **Related NFRs:** NFR-005, NFR-014, NFR-015
- **Related Risks:** R-006, R-011
- **Related Design Artifacts:** `unit_03_framework_agnostic_integration_and_runtime_adapter.md`
- **Follow-Ups:** Logical Design should define adapter ports, job events, observability boundaries, and no-iii fallback behavior.
- **Approval:** Pending

## ADR-003: Local-First Storage And Migration Posture

- **Status:** Proposed
- **Decision Area:** Storage
- **Context:** UNIT-02 requires durable sources, rebuildable derived indexes, context packs, and local/offline retrieval. UNIT-04 requires delete/export and governance awareness.
- **Decision:** AI recommends local-first durable lifecycle artifacts plus append-only memory events plus a rebuildable local index, exposed through pluggable repository interfaces for a future server profile.
- **Human Selection Status:** Pending Selection
- **Selected Option:** Pending
- **Selector / Date:** Pending
- **Selection Rationale:** Pending
- **Selection Conditions:** Derived indexes must never be the only source of truth; delete/export must cover active retrieval state and future derived semantic indexes.
- **Downstream Authorization:** Not authorized until human selection and approval are recorded.
- **Rationale:** This best satisfies local-first adoption, rebuildability, bounded retrieval, and future migration without prematurely adopting hosted infrastructure.
- **Alternatives Considered:** Direct Postgres/vector server profile; vector-only architecture; defer storage decision.
- **Consequences:** V1 remains easy to run locally; future server/team use requires a later migration profile.
- **Risks:** Sync/index divergence if rebuild rules are weak; local concurrency limits for future team-server use.
- **Security / Privacy / Compliance Impact:** Local-first reduces hosted exposure but delete/export and redaction must be tested.
- **Operational Impact:** Simple local operation; rebuild workflow becomes a core operational feature.
- **Cost Impact:** Low.
- **Migration / Rollback Impact:** Medium; repository interfaces reduce migration cost.
- **Reversibility:** Medium
- **Confidence:** High
- **Related Units:** UNIT-02, UNIT-04, UNIT-05
- **Related NFRs:** NFR-001, NFR-002, NFR-003, NFR-005, NFR-009, NFR-010, NFR-011, NFR-019, NFR-020
- **Related Risks:** R-002, R-005, R-008, R-009, R-010
- **Related Design Artifacts:** `unit_02_local_workspace_storage_and_retrieval.md`, `unit_04_privacy_governance_and_memory_operations.md`
- **Follow-Ups:** Logical Design should specify durable source semantics, rebuild workflow, ranking pipeline, and migration-safe repository interfaces.
- **Approval:** Pending

## ADR-004: Raw Observation Retention Default

- **Status:** Proposed
- **Decision Area:** Privacy / Retention
- **Context:** UNIT-04 requires retention policy for raw observations and approved lifecycle memories. NFR-017 says raw observations should have shorter retention than approved artifact memories.
- **Decision:** AI recommends no automatic raw observation retention by default; when enabled, use configurable TTL with conservative defaults.
- **Human Selection Status:** Pending Selection
- **Selected Option:** Pending
- **Selector / Date:** Pending
- **Selection Rationale:** Pending
- **Selection Conditions:** Approved lifecycle artifacts remain durable; raw observation capture requires explicit workspace policy and visibility scope.
- **Downstream Authorization:** Not authorized until human selection and approval are recorded.
- **Rationale:** Agent-memory's differentiator is approved AI-DLC lifecycle memory, not automatic chat/tool transcript hoarding. This reduces privacy and sensitive-data risk while preserving opt-in observability.
- **Alternatives Considered:** Short fixed TTL; configurable TTL always enabled; retain all raw observations until manual deletion.
- **Consequences:** Safer default with less automatic recall from raw interactions; workspaces can opt in later.
- **Risks:** Some useful implicit context may be lost if not promoted into approved lifecycle memory.
- **Security / Privacy / Compliance Impact:** Strong positive impact by minimizing raw sensitive data persistence.
- **Operational Impact:** Requires clear CLI/API policy controls when enabled.
- **Cost Impact:** Low.
- **Migration / Rollback Impact:** High reversibility.
- **Reversibility:** High
- **Confidence:** Medium
- **Related Units:** UNIT-04
- **Related NFRs:** NFR-007, NFR-008, NFR-011, NFR-012, NFR-017, NFR-018
- **Related Risks:** R-004, R-012, R-013
- **Related Design Artifacts:** `unit_04_privacy_governance_and_memory_operations.md`
- **Follow-Ups:** Logical Design should define retention policy operations, export/delete behavior, and promotion from raw observation to approved lifecycle memory.
- **Approval:** Pending

## ADR-005: Optional Semantic Retrieval And Embeddings Posture

- **Status:** Proposed
- **Decision Area:** Retrieval / Embeddings
- **Context:** UNIT-05 models semantic retrieval as optional. R-003 warns that vector retrieval can return lifecycle-incorrect memories.
- **Decision:** AI recommends deferring embeddings/provider selection from v1 while preserving a pluggable semantic retrieval boundary for v1.1.
- **Human Selection Status:** Pending Selection
- **Selected Option:** Pending
- **Selector / Date:** Pending
- **Selection Rationale:** Pending
- **Selection Conditions:** Lifecycle-authoritative ranking, governance eligibility, delete/export, and provenance rules must apply before semantic candidates enter a context pack.
- **Downstream Authorization:** Not authorized until human selection and approval are recorded.
- **Rationale:** V1 should prove lifecycle-aware BM25/exact/graph retrieval first. Semantic retrieval can improve recall later, but it increases privacy, deletion, ranking, and provider lock-in complexity.
- **Alternatives Considered:** Optional local semantic provider in v1.1; hosted embedding/vector provider now; vector-first retrieval.
- **Consequences:** Lower v1 complexity and safer ranking; semantic recall value waits until a later slice.
- **Risks:** Exact/lifecycle retrieval may miss conceptually related context until semantic extension is added.
- **Security / Privacy / Compliance Impact:** Positive for v1 because no embeddings or derived vector data are stored by default.
- **Operational Impact:** Simpler v1 operations; future provider integration requires additional observability and deletion tests.
- **Cost Impact:** Low for v1.
- **Migration / Rollback Impact:** High reversibility because the extension boundary remains optional.
- **Reversibility:** High
- **Confidence:** High
- **Related Units:** UNIT-05, UNIT-02, UNIT-04
- **Related NFRs:** NFR-010, NFR-015, NFR-020
- **Related Risks:** R-003, R-008, R-009, R-011
- **Related Design Artifacts:** `unit_05_optional_semantic_retrieval_extension.md`
- **Follow-Ups:** Logical Design should preserve semantic retrieval extension points without selecting provider/model.
- **Approval:** Pending

## Rejected Or Deferred Options

These dispositions are AI-proposed only and not final until the Human Selection Gate is recorded.

| Option | Status | Reason | Revisit Trigger |
|--------|--------|--------|-----------------|
| iii-engine required for v1 | Proposed reject | Adds hard runtime dependency and conflicts with local-independent core. | Human selects required iii or adapter cannot satisfy US-007. |
| Direct Postgres/vector server profile as v1 default | Proposed defer | Premature server complexity and hosted-cost risk before local v1 is proven. | Team/server profile becomes a v1 must-have. |
| Hosted embedding/vector provider now | Proposed reject | Privacy, cost, and lock-in risks conflict with local-first v1. | Human explicitly prioritizes semantic retrieval over local-first constraints. |
| Rust core as primary v1 surface | Proposed defer | Higher implementation cost without current performance proof. | Profiling shows TypeScript/Python cannot meet NFR-001/NFR-009. |

## Open Questions

| ID | Question | Owner | Needed By |
|----|----------|-------|-----------|
| TDG-001 | Which TD-001 candidate should be selected, deferred, rejected, or sent for more analysis? | Human | Human Selection Gate |
| TDG-002 | Which TD-002 candidate should be selected, deferred, rejected, or sent for more analysis? | Human | Human Selection Gate |
| TDG-003 | Which TD-003 candidate should be selected, deferred, rejected, or sent for more analysis? | Human | Human Selection Gate |
| TDG-004 | Which TD-004 candidate should be selected, deferred, rejected, or sent for more analysis? | Human | Human Selection Gate |
| TDG-005 | Which TD-005 candidate should be selected, deferred, rejected, or sent for more analysis? | Human | Human Selection Gate |
