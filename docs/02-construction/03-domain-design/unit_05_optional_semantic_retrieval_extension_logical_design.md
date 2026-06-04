# UNIT-05 Optional Semantic Retrieval Extension Logical Design

**Project:** Agent-memory  
**Unit ID:** UNIT-05  
**Date:** 2026-06-04  
**Approved Domain Design:** `docs/02-construction/03-domain-design/unit_05_optional_semantic_retrieval_extension.md`

## Approval Status

Approved by user on 2026-06-05. Generated from the approved Logical Design plan after user approval on 2026-06-04.

## NFR Traceability Matrix

| NFR ID | Design Decision | Component / Boundary | Pattern / Tactic | Trade-Off |
|--------|-----------------|----------------------|------------------|-----------|
| NFR-010 | Semantic retrieval is isolated behind optional repository/provider ports for a future profile. | Semantic Provider Port, Semantic Index Port | Optional extension boundary | Semantic value is deferred, but migration path remains open. |
| NFR-015 | Embedding/provider details do not enter lifecycle domain or baseline retrieval components. | Semantic Adapter Boundary | Ports/adapters | More interfaces, but provider lock-in is reduced. |
| NFR-020 | Semantic candidates must pass the same token-budgeted context packing as baseline candidates. | Retrieval Fusion Service, Context Pack Builder | Secondary signal fusion | Relevant semantic candidates may be excluded under 2000-token startup mode. |

## Architecture Patterns

| Pattern | Rationale | Alternatives Considered | Consequences |
|---------|-----------|-------------------------|--------------|
| Optional extension profile | V1 baseline retrieval must work without embeddings or vector storage. | Vector-first retrieval | Lower delivery and privacy risk; semantic recall waits for later slice. |
| Secondary signal fusion | Semantic similarity can help recall but cannot outrank approved lifecycle evidence alone. | Semantic score as primary rank | Prevents lifecycle-incorrect memory injection. |
| Conflict assessment | Semantic candidates that contradict approved plans/decisions are demoted, excluded, or routed for review. | Include all high-similarity results | Better safety; requires comparison against approved memory. |
| Delete-aware derived index | Future semantic entries must purge when governed memory is deleted. | Leave vectors until periodic cleanup | Supports NFR-011 and R-005; more cleanup coordination. |

## Component Boundaries

| Component | Responsibility | Owner | Interfaces | Dependency Direction |
|-----------|----------------|-------|------------|----------------------|
| Semantic Profile Manager | Enables, disables, or marks semantic retrieval experimental per workspace/request mode. | Retrieval enhancement team | `getProfile`, `enableProfile`, `disableProfile` | Optional configuration; baseline retrieval does not depend on enabled profile. |
| Semantic Provider Port | Abstracts embedding/model/provider behavior without choosing provider in v1. | Retrieval enhancement team | `embedMemory`, `embedQuery`, `describeProvider` | Implementations are deferred to v1.1 or later decision gate. |
| Semantic Index Port | Stores and queries derived semantic vectors or equivalent conceptual signals. | Retrieval enhancement team | `upsertSemanticEntry`, `querySemanticCandidates`, `deleteSemanticEntries` | Derived index only; tied to governed memory IDs. |
| Semantic Candidate Builder | Converts provider/index results into governed candidate references. | Retrieval enhancement team | `buildCandidates`, `attachRationale` | Requires UNIT-02 memory references and UNIT-04 eligibility. |
| Retrieval Fusion Service | Combines baseline candidates and semantic candidates under lifecycle-authoritative rules. | Retrieval enhancement team | `fuseCandidates`, `assessConflict`, `explainFusion` | Feeds UNIT-02 ranking/packing as secondary signal. |

## Integration Contracts

| Interaction | Direction | Contract | Error Handling |
|-------------|-----------|----------|----------------|
| Semantic profile lookup | Inbound from UNIT-02 retrieval | Workspace, retrieval mode, request flags. | Disabled profile returns no semantic candidates and baseline retrieval proceeds. |
| Query embedding | Outbound to future provider adapter | Query text, provider profile, privacy constraints. | Provider unavailable returns degraded baseline-only retrieval. |
| Candidate lookup | Outbound to Semantic Index Port | Query representation, candidate limit, workspace scope. | Missing index returns no semantic candidates and schedules optional rebuild warning. |
| Governance eligibility | Outbound to UNIT-04 | Candidate memory IDs, actor visibility context, deletion/retention state. | Ineligible semantic candidates are dropped before fusion. |
| Fusion into baseline retrieval | Outbound to UNIT-02 | Candidate IDs, semantic signal, conflict assessment, explanation. | Conflicting semantic results are demoted/excluded before context packing. |
| Delete cleanup | Inbound from UNIT-04 / UNIT-02 | Deleted memory IDs and cleanup operation ID. | Cleanup is idempotent; failure keeps delete operation incomplete when semantic index is enabled. |

## Non-Binding Technology Mapping

| Concern | Candidate | Confidence | Risks | Reversibility |
|---------|-----------|------------|-------|---------------|
| Provider selection | Deferred from v1 | High | Semantic recall absent in initial implementation. | High; ports preserve extension path. |
| Local embedding provider | Future local model/provider behind Semantic Provider Port | Medium | Local model quality and disk/runtime cost vary. | Medium; provider can be swapped. |
| Hosted embedding provider | Deferred and not v1 default | High | Privacy, cost, and lock-in risk. | High if never made source of truth. |
| Vector index | Future local or server vector profile behind Semantic Index Port | Medium | Delete/export and lifecycle conflict handling must be tested. | Medium; derived data can be rebuilt. |
| Fusion implementation | Rule-based lifecycle-first fusion | High | May underuse semantic score in ambiguous cases. | High; weights can evolve with tests. |

## Approved Technology Decision Trace

| ADR | Impact On This Unit |
|-----|---------------------|
| ADR-003 | Semantic indexes, when introduced, remain derived and rebuildable from governed memory sources. |
| ADR-004 | Raw observations cannot be embedded by default because they are not retained automatically. |
| ADR-005 | Embedding/provider selection is deferred from v1; semantic retrieval stays optional and secondary. |

## Data Flow

| Flow | Source | Target | Data | Notes |
|------|--------|--------|------|-------|
| Baseline retrieval asks for semantic help | UNIT-02 Retrieval Orchestrator | Semantic Profile Manager | Query intent, mode, workspace | Disabled profile exits with empty candidate set. |
| Suggest semantic candidates | Semantic Provider/Index | Semantic Candidate Builder | Similarity results tied to governed memory IDs | No standalone semantic memory is created. |
| Filter semantic candidates | Semantic Candidate Builder | UNIT-04 | Candidate IDs and actor/visibility context | Policy remains authoritative. |
| Fuse results | Retrieval Fusion Service | UNIT-02 Ranking Engine | Baseline candidates, semantic candidates, conflict outcomes | Lifecycle/approval signals outrank semantic-only signals. |
| Delete semantic derived data | UNIT-04 Delete Operation | Semantic Index Port | Memory IDs, operation ID | Required only when semantic index is enabled. |

## Failure Modes And Error Handling

| Failure Mode | Mitigation | Verification |
|--------------|------------|--------------|
| Semantic provider unavailable | Fall back to baseline lifecycle retrieval and report degraded semantic mode. | Disabled/provider-unavailable retrieval test. |
| Semantic result conflicts with approved decision | Demote, exclude, or mark review-required according to conflict policy. | Conflict fusion tests. |
| Semantic candidate lacks governed memory reference | Reject candidate before fusion. | Candidate builder validation test. |
| Deleted memory remains in semantic index | Delete-aware cleanup contract with operation ID and retry. | Semantic delete integration test when extension is enabled. |
| Semantic mode increases token pack beyond budget | UNIT-02 Context Pack Builder enforces mode token budget after fusion. | Token budget fusion test. |
| Hosted provider leaks sensitive query | Hosted provider remains out of v1; future provider must pass UNIT-04 privacy gate. | Provider policy review before implementation. |

## Security And Privacy

| Concern | Decision / Mitigation | Related NFR / Risk |
|---------|-----------------------|--------------------|
| Provider privacy | No embedding provider is selected for v1; future provider requires approval. | R-004, R-011 |
| Semantic authority | Approved lifecycle memory outranks semantic-only similarity. | R-003, R-008, R-009 |
| Delete/export coverage | Semantic index entries are derived data and must purge on delete. | NFR-011, R-005 |
| Governance eligibility | Semantic candidates pass UNIT-04 visibility, retention, and deletion checks. | NFR-008, NFR-018, R-013 |
| Token control | Semantic candidates enter the same bounded context pack as baseline candidates. | NFR-020 |
| Provider lock-in | Provider details remain outside lifecycle domain and baseline retrieval. | NFR-010, NFR-015 |

## ADR-Lite Decisions

### ADR-LD-UNIT05-001: Defer Provider Selection But Preserve Extension Ports

- **Status:** Proposed
- **Context:** Approved Technology Decisions defer embeddings/provider choice from v1.
- **Decision:** Define Semantic Provider and Semantic Index ports without selecting or implementing a provider in this gate.
- **Rationale:** This lowers v1 delivery/privacy risk while keeping future semantic recall feasible.
- **Alternatives Considered:** Select hosted embedding provider now; make vector retrieval v1 default.
- **Consequences:** Semantic recall is a later enhancement, but baseline retrieval remains simpler and safer.

### ADR-LD-UNIT05-002: Lifecycle Evidence Beats Semantic Similarity

- **Status:** Proposed
- **Context:** Vector/semantic retrieval may return lifecycle-incorrect memories.
- **Decision:** Fusion rules demote or exclude semantic candidates that conflict with approved lifecycle artifacts.
- **Rationale:** Agent-memory's value is AI-DLC-native traceable lifecycle memory, not generic similarity.
- **Alternatives Considered:** Rank by semantic score first.
- **Consequences:** Some semantically relevant context may be excluded, but approved project truth remains authoritative.

## Open Questions And Trade-Offs

| ID | Question / Trade-Off | Owner | Decision Needed By |
|----|----------------------|-------|--------------------|
| LD-UNIT05-OQ-001 | Which local embedding provider/model should be evaluated for v1.1? | Human / Retrieval enhancement team | v1.1 technology decision |
| LD-UNIT05-OQ-002 | Should semantic retrieval be completely absent from v1 implementation or included as disabled experimental plumbing? | Human / Engineering | Code-generation planning |
| LD-UNIT05-OQ-003 | What evidence should trigger semantic-vs-approved-memory conflict review? | Retrieval enhancement team | Before semantic implementation |
