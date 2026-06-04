# UNIT-02 Local Workspace Storage And Retrieval Domain Design

**Project:** Agent-memory
**Unit ID:** UNIT-02
**Date:** 2026-06-04

## Approval Status

Approved by user on 2026-06-04. Generated from approved `docs/02-construction/02-design-plan/domain_design_plan.md`.

## Unit Summary

- **Business Capability / Outcome:** Provide local-first durable indexing and retrieval that can restore AI-DLC context quickly and explainably.
- **Linked Story IDs:** US-001, US-004
- **Related NFRs:** NFR-001, NFR-002, NFR-003, NFR-005, NFR-009, NFR-010, NFR-019, NFR-020
- **Related Risks:** R-002, R-008, R-009, R-010

## Domain Model

### Ubiquitous Language

| Term | Definition | Notes |
|------|------------|-------|
| Durable Source | Authoritative replayable memory input, such as lifecycle artifacts or approved memory events. | Domain concept only; implementation format is deferred. |
| Rebuildable Index | Derived retrieval structure that can be recreated from durable sources. | Cannot be the sole source of truth. |
| Retrieval Request | A user or agent request for relevant memory by goal, phase, path, status, risk, decision, or query intent. | Must respect governance filters. |
| Context Pack | Token-bounded set of selected memories returned for startup, handoff, audit, or focused work. | Default startup pack target is at most 2000 tokens. |
| Ranking Signal | Domain reason that raises or lowers memory relevance, such as approval state, exact lifecycle link, current phase, or freshness. | Technology-neutral. |
| Rebuild Run | A domain operation that reconstructs derived retrieval state from durable sources. | Must detect stale or missing derived memories. |

### Aggregates

| Aggregate | Consistency Boundary | Invariants | Linked Stories |
|-----------|----------------------|------------|----------------|
| WorkspaceMemoryCatalog | The known durable sources and accepted lifecycle memories for one workspace. | Every catalog entry has source provenance; reusable templates are excluded from approved memory; stale entries are removable during rebuild. | US-004 |
| RetrievalSession | One retrieval request, candidate set, ranking rationale, and selected context pack. | Governance filters are applied before final packing; approved lifecycle memory outranks conflicting draft memory; default startup pack stays within token budget. | US-001, US-004 |
| RebuildRun | One rebuild attempt from durable sources to derived retrieval state. | Rebuild has start/end status, source set, detected changes, and consistency result. | US-004 |

### Entities

| Entity | Identity | Behaviors | Parent Aggregate |
|--------|----------|-----------|------------------|
| CatalogEntry | Source identity and memory category. | Add memory, update observed metadata, mark stale, exclude template source. | WorkspaceMemoryCatalog |
| RetrievalCandidate | Candidate ID within retrieval session. | Record matched signals, apply governance eligibility, rank, include or exclude from pack. | RetrievalSession |
| ContextPackItem | Item ID within a context pack. | Record inclusion reason, token estimate, source provenance, and ordering. | RetrievalSession |
| RebuildChange | Change ID within rebuild run. | Mark created, updated, removed, unchanged, or conflicted memory. | RebuildRun |

### Value Objects

| Value Object | Attributes | Equality Rule | Validation |
|--------------|------------|---------------|------------|
| QueryIntent | Goal, phase, requested mode, filters. | Equal when goal, mode, and filters match. | Mode must be startup, focused, handoff, audit, or approved extension. |
| RankingRationale | Signals, weights-by-meaning, explanation. | Equal when signals and explanation match. | Must explain why approved lifecycle artifacts ranked highly. |
| TokenBudget | Mode, maximum tokens, estimate method label. | Equal when mode and maximum match. | Default startup budget is at most 2000 tokens. |
| RebuildOutcome | Status, created count, updated count, removed count, conflicts. | Equal when status and counts match. | Failed or conflicted rebuild must be visible to operators. |
| RetrievalEligibility | Visibility result, approval result, retention result. | Equal when all policy results match. | Ineligible memory cannot enter final pack. |

### Domain Events

| Event | Meaning | Trigger | Consumers |
|-------|---------|---------|-----------|
| WorkspaceMemoryCataloged | Durable source memory became available for retrieval. | Catalog accepts a governed lifecycle memory. | Retrieval, rebuild, integration. |
| RetrievalRequested | A user or agent requested context. | Retrieval session starts. | Ranking, context pack builder. |
| RetrievalCandidatesRanked | Candidate memories were ranked with explainable signals. | Ranking completes. | Context pack builder, audit. |
| ContextPackBuilt | A bounded context pack was selected. | Packing completes. | Agent session startup, handoff. |
| RebuildRunCompleted | Derived retrieval state was rebuilt from durable sources. | Rebuild finishes. | Operators, integration surfaces. |
| StaleMemoryRemoved | A stale derived memory was removed after source change. | Rebuild detects missing or changed source. | Traceability, retrieval. |

### Repositories (Interfaces)

| Repository | Intent-Based Operations | Aggregate |
|------------|-------------------------|-----------|
| WorkspaceMemoryCatalogRepository | findCatalogForWorkspace, saveCatalogEntry, markCatalogEntryStale, findCurrentApprovedEntries | WorkspaceMemoryCatalog |
| RetrievalSessionRepository | saveRetrievalSession, findRecentRetrievalsByMode, findContextPackByRequest | RetrievalSession |
| RebuildRunRepository | startRebuildRun, completeRebuildRun, findLatestRebuildOutcome | RebuildRun |

### Factories

| Factory | Purpose | Inputs | Output |
|---------|---------|--------|--------|
| RetrievalSessionFactory | Create valid retrieval sessions with policy-aware defaults. | QueryIntent, token budget, visibility context. | RetrievalSession |
| ContextPackFactory | Create a context pack from eligible ranked candidates. | Retrieval candidates, token budget, ranking rationale. | Context pack items within RetrievalSession |
| RebuildRunFactory | Create auditable rebuild runs. | Workspace identity, durable source set, requested actor. | RebuildRun |

### Domain Services

| Service | Responsibility | Why It Is Not Entity/Aggregate Behavior |
|---------|----------------|-----------------------------------------|
| RetrievalRankingService | Applies lifecycle-aware ranking across candidates. | Ranking spans catalog, governance, relationships, and request intent. |
| ContextPackingService | Selects the most useful eligible memories within token budget. | Packing balances many candidates and budget constraints. |
| RebuildConsistencyService | Compares durable sources with derived retrieval state. | Consistency spans catalog and rebuild aggregates. |

## Open Questions

- OQ-001: Implementation language and runtime surface remain deferred to the technology decision gate.
- The exact token estimation method is a Logical Design or implementation concern; Domain Design only requires a bounded budget concept.

## Validation Checklist

- [x] Aggregates have clear consistency boundaries.
- [x] Invariants are explicit and testable.
- [x] Entities have stable identities.
- [x] Value objects are immutable and value-based.
- [x] Domain events are named as past-tense facts.
- [x] Repositories expose intent-based interfaces only.
- [x] Domain services do not become generic transaction scripts.
- [x] Technology choices, databases, frameworks, cloud services, schemas, and implementation code are absent from Domain Design.
