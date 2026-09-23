# Technology Decisions

**Project:** Agent-memory
**Date:** 2026-06-04
**Decision Scope:** V1 implementation language/runtime, iii-engine role, storage profile, raw observation retention, and optional semantic retrieval posture.

## Approval Status

Approved by user on 2026-06-04. The user approved all AI-recommended selections. Decisions are authorized for Logical Design planning; implementation, dependency, runtime-structure, deployment, and test-generation work still require their own approved downstream plans.

## Sources Reviewed

| Source | Current Observation | Decision Impact |
|--------|---------------------|-----------------|
| `https://github.com/iii-hq/iii` | iii presents Worker, Function, and Trigger as core primitives; it provides Node.js, Python, and Rust SDKs; its engine is Rust, with SDK and console surfaces in the monorepo. | Supports iii as a useful runtime adapter, but not as the core domain model. |
| `https://github.com/rohitg00/agentmemory` | agentmemory is a TypeScript/npm project for persistent coding-agent memory, built on iii, with MCP/Codex integration, hooks, skills, local server/viewer, and no external DB as a stated product attribute. | Supports TypeScript/npm and local-first memory as practical reference points, while Agent-memory remains AI-DLC-native rather than a clone. |

## Decision Summary

| ADR ID | Decision Area | Title | Status | Confidence | Reversibility | Human Selection | Approval |
|--------|---------------|-------|--------|------------|---------------|-----------------|----------|
| ADR-001 | Language / Runtime | Primary implementation language and package surface | Approved | Medium | Medium | Selected | User / 2026-06-04 |
| ADR-002 | Runtime / Integration | iii-engine role for v1 | Approved | High | High | Selected | User / 2026-06-04 |
| ADR-003 | Storage | Local-first storage and migration posture | Approved | High | Medium | Selected | User / 2026-06-04 |
| ADR-004 | Privacy / Retention | Raw observation retention default | Approved | Medium | High | Selected | User / 2026-06-04 |
| ADR-005 | Retrieval / Embeddings | Optional semantic retrieval posture | Approved | High | High | Selected | User / 2026-06-04 |

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

The user approved all AI-recommended selections on 2026-06-04.

| Decision Area | Gate Status | AI-Recommended Option | Selected Option | Selector / Date | Selection Rationale | Conditions | Downstream Authorization | Notes |
|---------------|-------------|-----------------------|-----------------|-----------------|---------------------|------------|--------------------------|-------|
| TD-001 | Selected | TypeScript/Node package with CLI, MCP, and local API | TypeScript/Node package with CLI, MCP, and local API | User / 2026-06-04 | User approved the AI recommendation as the best fit for npm, MCP, Codex/plugin, and iii reference paths. | Keep domain model independent from runtime/storage packages. | Authorized for Logical Design planning; implementation still requires approved Logical Design and Code Generation plans. | Selected as primary v1 package/runtime surface. |
| TD-002 | Selected | iii-engine optional first-class adapter with independent core local mode | iii-engine optional first-class adapter with independent core local mode | User / 2026-06-04 | User approved the AI recommendation to use iii value without making it a hard dependency. | Core retrieval must work without iii configured. | Authorized for Logical Design planning; implementation still requires approved Logical Design and Code Generation plans. | Selected as optional adapter posture. |
| TD-003 | Selected | Local-first durable docs/events plus rebuildable local index, behind pluggable repository interfaces | Local-first durable docs/events plus rebuildable local index, behind pluggable repository interfaces | User / 2026-06-04 | User approved the AI recommendation to satisfy local-first v1 while preserving future server migration. | Derived indexes must be rebuildable and delete/export aware. | Authorized for Logical Design planning; implementation still requires approved Logical Design and Code Generation plans. | Selected as v1 storage posture. |
| TD-004 | Selected | No automatic raw observation retention by default; configurable TTL when enabled | No automatic raw observation retention by default; configurable TTL when enabled | User / 2026-06-04 | User approved the AI recommendation as a privacy-safe default. | Approved lifecycle artifacts persist; raw observations require explicit policy. | Authorized for Logical Design planning; implementation still requires approved Logical Design and Code Generation plans. | Selected as retention posture. |
| TD-005 | Selected | Defer embeddings/provider selection from v1; preserve pluggable semantic extension boundary for v1.1 | Defer embeddings/provider selection from v1; preserve pluggable semantic extension boundary for v1.1 | User / 2026-06-04 | User approved the AI recommendation to reduce v1 delivery, privacy, and ranking risks. | Lifecycle-authoritative retrieval remains primary. | Authorized for Logical Design planning; implementation still requires approved Logical Design and Code Generation plans. | Selected as semantic retrieval posture. |

Gate rules:

- Human selection and approval are recorded for TD-001 through TD-005.
- Logical Design may use these decisions as approved inputs.
- Do not start Code Generation, dependency installation, runtime-structure changes, deployment work, or test generation until their own downstream plans are approved.

## ADR-001: Primary Implementation Language And Package Surface

- **Status:** Approved
- **Decision Area:** Language / Runtime
- **Context:** Agent-memory needs CLI, MCP, local API, local workspace operation, and future optional runtime adapters. Approved Domain Design keeps the domain model independent from runtime/storage choices.
- **Decision:** Use TypeScript/Node as the primary v1 package/runtime surface.
- **Human Selection Status:** Selected
- **Selected Option:** TypeScript/Node package with CLI, MCP, and local API
- **Selector / Date:** User / 2026-06-04
- **Selection Rationale:** User approved the AI recommendation as the best fit for npm distribution, MCP/Codex plugin integration, agentmemory reference patterns, and iii's Node SDK.
- **Selection Conditions:** Keep domain concepts in technology-neutral modules and enforce ports/adapters around storage, runtime jobs, and integrations.
- **Downstream Authorization:** Authorized for Logical Design planning. Implementation, dependency changes, and package/runtime structure changes require approved downstream plans.
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
- **Approval:** User / 2026-06-04

## ADR-002: iii-engine Role For V1

- **Status:** Approved
- **Decision Area:** Runtime / Integration
- **Context:** The user is interested in iii-engine. UNIT-03 models an optional runtime adapter and R-006 warns against making iii a hard dependency too early.
- **Decision:** Treat iii-engine as an optional first-class adapter, with Agent-memory core local mode independent from iii.
- **Human Selection Status:** Selected
- **Selected Option:** iii-engine optional first-class adapter with independent core local mode
- **Selector / Date:** User / 2026-06-04
- **Selection Rationale:** User approved the AI recommendation to benefit from iii jobs/triggers/observability without making iii a hard v1 dependency.
- **Selection Conditions:** Core indexing, retrieval, governance, delete/export, and context pack behavior must run without iii installed or configured.
- **Downstream Authorization:** Authorized for Logical Design planning. Adapter implementation requires approved downstream plans.
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
- **Approval:** User / 2026-06-04

## ADR-003: Local-First Storage And Migration Posture

- **Status:** Approved
- **Decision Area:** Storage
- **Context:** UNIT-02 requires durable sources, rebuildable derived indexes, context packs, and local/offline retrieval. UNIT-04 requires delete/export and governance awareness.
- **Decision:** Use local-first durable lifecycle artifacts plus append-only memory events plus a rebuildable local index, exposed through pluggable repository interfaces for a future server profile.
- **Human Selection Status:** Selected
- **Selected Option:** Local-first durable docs/events plus rebuildable local index, behind pluggable repository interfaces
- **Selector / Date:** User / 2026-06-04
- **Selection Rationale:** User approved the AI recommendation to satisfy local-first v1 while preserving future team/server migration.
- **Selection Conditions:** Derived indexes must never be the only source of truth; delete/export must cover active retrieval state and future derived semantic indexes.
- **Downstream Authorization:** Authorized for Logical Design planning. Concrete storage implementation and runtime structure require approved downstream plans.
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
- **Approval:** User / 2026-06-04

## ADR-004: Raw Observation Retention Default

- **Status:** Approved
- **Decision Area:** Privacy / Retention
- **Context:** UNIT-04 requires retention policy for raw observations and approved lifecycle memories. NFR-017 says raw observations should have shorter retention than approved artifact memories.
- **Decision:** Use no automatic raw observation retention by default; when raw observations are enabled, use configurable TTL with conservative defaults.
- **Human Selection Status:** Selected
- **Selected Option:** No automatic raw observation retention by default; configurable TTL when enabled
- **Selector / Date:** User / 2026-06-04
- **Selection Rationale:** User approved the AI recommendation as the safest privacy default while allowing explicit workspace policy later.
- **Selection Conditions:** Approved lifecycle artifacts remain durable; raw observation capture requires explicit workspace policy and visibility scope.
- **Downstream Authorization:** Authorized for Logical Design planning. Retention implementation and policy controls require approved downstream plans.
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
- **Approval:** User / 2026-06-04

## ADR-005: Optional Semantic Retrieval And Embeddings Posture

- **Status:** Approved
- **Decision Area:** Retrieval / Embeddings
- **Context:** UNIT-05 models semantic retrieval as optional. R-003 warns that vector retrieval can return lifecycle-incorrect memories.
- **Decision:** Defer embeddings/provider selection from v1 while preserving a pluggable semantic retrieval boundary for v1.1.
- **Human Selection Status:** Selected
- **Selected Option:** Defer embeddings/provider selection from v1; preserve pluggable semantic extension boundary for v1.1
- **Selector / Date:** User / 2026-06-04
- **Selection Rationale:** User approved the AI recommendation to reduce v1 delivery, privacy, and lifecycle-ranking risks.
- **Selection Conditions:** Lifecycle-authoritative ranking, governance eligibility, delete/export, and provenance rules must apply before semantic candidates enter a context pack.
- **Downstream Authorization:** Authorized for Logical Design planning. Embedding/provider implementation requires a later approved decision or downstream plan.
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
- **Approval:** User / 2026-06-04

## Rejected Or Deferred Options

These dispositions were recorded from the approved Human Selection Gate on 2026-06-04.

| Option | Status | Reason | Revisit Trigger |
|--------|--------|--------|-----------------|
| Python package as primary v1 surface | Rejected for primary v1 surface | Weaker fit than TypeScript/Node for npm, Codex/MCP packaging, and the reviewed agentmemory/iii reference path. | Human or downstream delivery constraints favor Python. |
| Rust core as primary v1 surface | Deferred | Higher implementation cost without current performance proof. | Profiling shows TypeScript/Node cannot meet NFR-001/NFR-009. |
| iii-engine required for v1 | Rejected | Adds hard runtime dependency and conflicts with local-independent core. | Optional adapter cannot satisfy US-007 or human later selects required iii. |
| Defer iii adapter implementation to v1.1 | Rejected for v1 planning | User selected optional first-class adapter posture for v1 planning. | Logical Design proves adapter scope is too large for v1. |
| Direct Postgres/vector server profile as v1 default | Deferred | Premature server complexity and hosted-cost risk before local v1 is proven. | Team/server profile becomes a v1 must-have. |
| Hosted embedding/vector provider now | Rejected | Privacy, cost, and lock-in risks conflict with local-first v1. | Human explicitly prioritizes semantic retrieval over local-first constraints. |
| Vector-first retrieval | Rejected | Conflicts with lifecycle-authoritative retrieval and R-003 mitigation. | Lifecycle retrieval proves insufficient and governance controls are ready. |

## Open Questions

| ID | Question | Owner | Needed By |
|----|----------|-------|-----------|
| TDG-001 | Which TD-001 candidate should be selected, deferred, rejected, or sent for more analysis? | Human | Resolved: Selected TypeScript/Node on 2026-06-04 |
| TDG-002 | Which TD-002 candidate should be selected, deferred, rejected, or sent for more analysis? | Human | Resolved: Selected optional iii adapter on 2026-06-04 |
| TDG-003 | Which TD-003 candidate should be selected, deferred, rejected, or sent for more analysis? | Human | Resolved: Selected local-first rebuildable storage posture on 2026-06-04 |
| TDG-004 | Which TD-004 candidate should be selected, deferred, rejected, or sent for more analysis? | Human | Resolved: Selected no automatic raw observation retention by default with configurable TTL when enabled on 2026-06-04 |
| TDG-005 | Which TD-005 candidate should be selected, deferred, rejected, or sent for more analysis? | Human | Resolved: Selected defer embeddings from v1 with v1.1 extension boundary on 2026-06-04 |

## Addendum - ADR-006 MCP Server Implementation Approach

**Date:** 2026-08-26  
**Status:** Approved by the user on 2026-08-26  
**Decision Scope:** BOLT-12 MCP stdio server integration and the project's first runtime dependencies

This addendum leaves approved ADR-001 through ADR-005 unchanged. It records the separately approved ADR-006 follow-up workflow and its current Human Selection Gate.

### Decision Summary

| ADR ID | Decision Area | Title | Status | Confidence | Reversibility | Human Selection | Approval |
|--------|---------------|-------|--------|------------|---------------|-----------------|----------|
| ADR-006 | Integration / Dependency | MCP server implementation approach | Approved | High | High | Candidate A selected | User / 2026-08-26 |

### Primary Sources Reviewed

| Source | Verified Observation | Decision Impact |
|--------|----------------------|-----------------|
| MCP specification, revision 2026-07-28 | Stdio is newline-delimited UTF-8 JSON-RPC. Modern requests carry protocol metadata; servers implement version negotiation/discovery, tools/list, tools/call, protocol and execution errors, cancellation, and process lifecycle rules. | A direct implementation is substantially more than JSON parsing and tool dispatch. |
| Official TypeScript SDK repository and v2 documentation | v2 is the stable line and uses split packages. `@modelcontextprotocol/server` provides `McpServer`, `serveStdio`, schema validation, modern protocol support, and default 2025-era stdio compatibility. | Candidate A should use the current server package, not the legacy monolithic `@modelcontextprotocol/sdk`. |
| Official SDK tiering | TypeScript is Tier 1: stable release, complete applicable protocol implementation, 100% conformance expectation, documented dependency policy, and maintenance commitments. | Strongest interoperability and supportability evidence. |
| Published `@modelcontextprotocol/server` metadata | Version 2.0.0, Node >=20, ESM/CJS exports including `/stdio`, two runtime dependencies, and npm provenance. | Compatible with Agent-memory's Node >=22.5 runtime; adds a bounded runtime dependency surface. |
| SDK package manifest and dependency policy | Runtime dependencies are `@modelcontextprotocol/core` and Zod; internal SDK packages publish as exact pins, dependency updates are conservative, and install scripts are allow-listed upstream. | Supply-chain exposure exists but is small, explicit, and governed. |
| SDK versioning and roadmap | SemVer is documented; dropping a Node LTS, transport, or supported MCP revision is breaking. v2 hardening is active; v1 receives limited maintenance after v2 release. | Pin the selected v2 major/minor baseline and review upgrades deliberately. |

### Minimum BOLT-12 Protocol Behavior

- Serve MCP over local stdio without hosted infrastructure.
- Keep stdout exclusively for protocol messages and diagnostics on stderr.
- Support the SDK's default dual-era stdio behavior so current 2025-era clients and modern 2026-era clients can connect.
- Advertise deterministic tools generated from `MCP_TOOL_DESCRIPTORS`.
- Generate validated input schemas from `CapabilityPayloadField`; no hand-maintained duplicate capability list.
- Route every tool invocation through `CapabilityRouter`, including governance-required export and delete.
- Map unknown tools and malformed protocol input to protocol errors; map domain validation and operation failures to actionable tool results without leaking protected content.
- Honour cancellation and clean shutdown through the SDK transport lifecycle.
- Validate with the official in-memory/client test path, MCP Inspector or an equivalent official client, and at least one real host used by BOLT-12 acceptance.

### Candidate Comparison

| Candidate | Fit | Principal Benefits | Principal Risks / Costs | Operability | Reversibility |
|-----------|-----|--------------------|-------------------------|-------------|---------------|
| A. Official TypeScript MCP SDK v2 (`@modelcontextprotocol/server`) | High | Tier 1 conformance and maintenance; stdio and dual-era support; protocol lifecycle, validation, errors, cancellation, and evolution handled by the SDK; direct fit with TypeScript/Node. | First runtime dependencies; v2 is actively hardening; high-level tool registration uses Zod-compatible schemas; upgrades need review. | High | High |
| B. Dependency-free stdio JSON-RPC | Low-Medium | No third-party runtime dependency; complete local control. | Project owns modern and legacy protocol negotiation, discovery, metadata, framing, cancellation, error semantics, schema validation, conformance testing, and future revisions. Interoperability defects directly block US-001 and US-005. | Low-Medium | Medium |
| C. Defer ADR-006 / BOLT-12 | Low | No immediate dependency or implementation risk. | Leaves the primary v1 outcome inaccessible to agents and US-005 AC-001 unmet; blocks BOLT-14. | High for current CLI only | High |

### Human Selection Gate

| Gate Status | Selected Option | Selector / Date | Selection Rationale | Conditions | Downstream Authorization |
|-------------|-----------------|-----------------|---------------------|------------|--------------------------|
| Selected and approved | Candidate A, refined to official v2 `@modelcontextprotocol/server` | User / 2026-08-26 | Official SDK gives the strongest protocol interoperability and maintenance path while adapter isolation limits lock-in. | Pin the reviewed v2 baseline; inspect lockfile and transitive dependencies; keep SDK and schema-library imports outside `src/domain/`; generate tools from existing descriptors; route all calls through `CapabilityRouter`; test modern and legacy clients, malformed input, cancellation, and governance; expose no SDK types in domain contracts. | Authorizes a BOLT-12 Code Generation follow-up plan to propose the dependency and implementation. Installation and code changes still require that plan's explicit approval. |

## ADR-006: MCP Server Implementation Approach

- **Status:** Approved
- **Decision Area:** Integration / Dependency
- **Context:** BOLT-12 must expose Agent-memory's approved capabilities to MCP-capable agents over stdio. This is required for US-001 and US-005 AC-001 and would introduce the project's first third-party runtime dependencies. The existing `MCP_TOOL_DESCRIPTORS` and `CapabilityRouter` already isolate transport from domain behavior.
- **Decision:** Use the official TypeScript MCP SDK v2 server package, `@modelcontextprotocol/server`, as a thin stdio transport adapter. Use its default dual-era stdio serving behavior. Generate MCP tools from the existing descriptors and route every invocation through `CapabilityRouter`.
- **Human Selection Status:** Selected and approved
- **Selected Option:** Candidate A, official TypeScript MCP SDK v2 server package
- **Selector / Date:** User / 2026-08-26
- **Selection Rationale:** The official Tier 1 SDK reduces protocol-conformance, interoperability, lifecycle, error, cancellation, and evolution risk. Adapter isolation keeps replacement possible without changing domain, retrieval, governance, or storage contracts.
- **Selection Conditions:** Pin the reviewed v2 baseline; inspect package-lock changes and transitive dependencies; use no HTTP middleware package for the stdio-only BOLT-12 slice; keep SDK/Zod imports outside `src/domain/`; derive tools and schemas from approved descriptors; route all calls through `CapabilityRouter`; preserve governance decisions; test both protocol eras and real-client interoperability; keep stdout protocol-clean; expose no SDK type through domain APIs.
- **Downstream Authorization:** Authorizes a BOLT-12 Code Generation follow-up plan to propose adding `@modelcontextprotocol/server` and the minimum schema dependency required by the selected registration API. It does not itself authorize installation, package or lockfile edits, source changes, tests, deployment, or publication; those require explicit approval of the BOLT-12 plan.
- **Rationale:** MCP's current protocol includes modern per-request metadata and discovery as well as legacy initialization compatibility. The official SDK implements both eras through one stdio entry point and carries Tier 1 conformance and maintenance commitments. A hand-written adapter would recreate protocol machinery unrelated to Agent-memory's differentiating capability and governance logic.
- **Alternatives Considered:** Dependency-free stdio JSON-RPC implementation; defer MCP/BOLT-12; legacy monolithic `@modelcontextprotocol/sdk` v1.
- **Consequences:** BOLT-12 gains the shortest standards-conformant path and can validate against official clients. The project accepts a small third-party runtime dependency surface and must monitor SDK updates. Existing boundary tests must be narrowed deliberately to `src/domain/`, while the MCP adapter remains outside that directory.
- **Risks:** v2 is stable but still in active hardening; SDK API or protocol revisions may require adapter updates. Schema generation from existing descriptor metadata must not drift from SDK validation. A compromised dependency could access local workspace data in process.
- **Security / Privacy / Compliance Impact:** Positive protocol input validation and bounded error handling, with added supply-chain exposure. Stdio remains local and adds no network listener. Governance remains authoritative because every call uses `CapabilityRouter`; destructive tools retain policy and confirmation semantics. Lockfile review, vulnerability scanning, least-output behavior, and protocol-clean stdout are required.
- **Operational Impact:** Local hosts launch one stdio subprocess. No managed or paid service is required. The default dual-era posture maximizes compatibility; stderr is reserved for diagnostics. Concurrency and simultaneous rebuild policy remain a BOLT-12 planning concern.
- **Cost Impact:** Low; open-source local dependency with no hosted service cost. Maintenance cost shifts from protocol implementation to controlled SDK upgrades.
- **Migration / Rollback Impact:** The adapter can be replaced with another SDK or direct protocol implementation because domain contracts and capabilities remain SDK-free. Rollback removes the MCP adapter and dependencies while leaving CLI, local storage, and domain behavior intact.
- **Reversibility:** High
- **Confidence:** High
- **Related Units:** UNIT-03
- **Related User Stories:** US-001; US-005 AC-001
- **Related NFRs:** NFR-005, NFR-015, NFR-019
- **Related Risks:** R-006, R-011, R-013; new first-runtime-dependency supply-chain risk from the approved v1 release plan
- **Related Design Artifacts:** `unit_03_framework_agnostic_integration_and_runtime_adapter_logical_design.md`, `bolts_plan_addendum_v1_release.md`, `v1_release_plan.md`, `technology_decision_followup_plan_adr006.md`
- **Follow-Ups:** Create and approve the BOLT-12 Code Generation follow-up plan; inspect exact dependency and lockfile diff before installation; resolve ADR006-OQ-001 through ADR006-OQ-003; scope concurrency; implement adapter outside `src/domain/`; add real-client, dual-era, cancellation, malformed-input, governance, and boundary tests.
- **Approval:** User / 2026-08-26

### Rejected Or Deferred Options For ADR-006

| Option | Status | Reason | Revisit Trigger |
|--------|--------|--------|-----------------|
| Dependency-free stdio JSON-RPC | Not selected | Avoids dependencies but transfers complete protocol conformance, dual-era interoperability, lifecycle, schema validation, error, cancellation, and evolution ownership to this project. | Official SDK becomes unsupported, materially unsafe, or incompatible with required hosts. |
| Defer ADR-006 / BOLT-12 | Not selected | Blocks the primary agent-facing outcome and v1 acceptance. | Product scope explicitly drops MCP or v1 is reclassified as CLI-only preview. |
| Legacy `@modelcontextprotocol/sdk` v1 | Rejected for new implementation | v2 is the stable line; v1 is a maintenance line with limited post-v2 support. | A required host proves incompatible with v2's default legacy stdio support. |

### Open Questions For ADR-006

| ID | Question | Owner | Needed By |
|----|----------|-------|-----------|
| ADR006-OQ-001 | Should BOLT-12 use the documented high-level Zod registration API or a lower-level SDK request handler to consume generated raw JSON Schema? | BOLT-12 plan reviewer | Before dependency installation |
| ADR006-OQ-002 | Which real MCP host, in addition to the official client/Inspector, is the acceptance target? | Human / BOLT-12 plan reviewer | Before BOLT-12 test design |
| ADR006-OQ-003 | What workspace-level lock or single-writer policy prevents simultaneous MCP and CLI rebuild/delete races? | Human / engineering | Before BOLT-12 execution |
