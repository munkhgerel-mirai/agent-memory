# UNIT-02 Local Workspace Storage And Retrieval Logical Design

**Project:** Agent-memory  
**Unit ID:** UNIT-02  
**Date:** 2026-06-04  
**Approved Domain Design:** `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md`

## Approval Status

Pending review. Generated from the approved Logical Design plan after user approval on 2026-06-04.

## NFR Traceability Matrix

| NFR ID | Design Decision | Component / Boundary | Pattern / Tactic | Trade-Off |
|--------|-----------------|----------------------|------------------|-----------|
| NFR-001 | Startup retrieval uses a bounded pipeline for active goal, phase, plan, decisions, blockers, and next steps. | Retrieval Orchestrator, Context Pack Builder | Mode-specific retrieval profile | May omit deep historical context unless expanded mode is requested. |
| NFR-002 | Default startup context pack is capped at 2000 tokens. | Context Pack Builder | Token-budgeted packing | Provenance consumes token space but improves explainability. |
| NFR-003 | Derived local index is rebuildable from durable lifecycle artifacts and memory events. | Rebuild Coordinator, Durable Source Reader | Rebuildable projection | Rebuild must be deterministic and observable. |
| NFR-005 | Local workspace operation works without hosted infrastructure. | Local Workspace Repository Port | Local-first profile | Team/server concurrency is deferred. |
| NFR-009 | Retrieval design targets at least 1,000 lifecycle records and 10,000 raw/event records locally. | Index Projection, Retrieval Orchestrator | Indexed metadata and FTS-style search | Requires performance tests with representative data. |
| NFR-010 | Storage interfaces preserve future Postgres + vector migration path. | Repository Port Boundary | Pluggable repository profile | Adds interface discipline before v1 proves scale. |
| NFR-019 | v1 does not require paid hosted infrastructure by default. | Local Storage Profile | Markdown/JSONL plus local index | Hosted collaboration features are deferred. |
| NFR-020 | Retrieval modes control token use. | Retrieval Profile, Context Pack Builder | Startup/focused/handoff/audit modes | Users must request expanded context explicitly. |

## Architecture Patterns

| Pattern | Rationale | Alternatives Considered | Consequences |
|---------|-----------|-------------------------|--------------|
| Durable source plus rebuildable projection | Markdown lifecycle artifacts and append-only events remain authoritative; local index accelerates retrieval. | SQLite as sole source of truth | Safer rebuild and migration story; needs consistency checks. |
| Repository port with local profile | Future server profile should not rewrite domain logic. | Direct local database access from domain services | More ports to design; lower migration risk. |
| Policy-before-ranking | Ineligible memory must never enter the final candidate set. | Rank first, filter later | Stronger privacy; ranking has fewer candidates. |
| Lifecycle-authoritative ranking | Approved plans, decisions, risks, NFRs, and explicit edges outrank generic text matches. | Keyword-only search | Better AI-DLC continuity; requires edge/category metadata. |
| Token-budgeted packing | Context is useful only if bounded and ordered by rationale. | Return all matching memories | Predictable cost; may require expanded retrieval mode for complex tasks. |

## Component Boundaries

| Component | Responsibility | Owner | Interfaces | Dependency Direction |
|-----------|----------------|-------|------------|----------------------|
| Durable Source Reader | Reads lifecycle artifacts and append-only memory events as replayable inputs. | Storage and retrieval team | `scanSources`, `readSource`, `observeVersion` | Inbound from workspace; no domain decisions beyond observation. |
| Rebuild Coordinator | Reconstructs derived retrieval state from durable sources and reports consistency. | Storage and retrieval team | `startRebuild`, `applyChanges`, `completeRebuild` | Uses UNIT-01 classifier and UNIT-04 governance checks. |
| Index Projection | Stores derived metadata, lifecycle edges, FTS-style text, and retrieval snapshots. | Storage and retrieval team | `upsertProjection`, `removeProjection`, `queryProjection` | Implements repository ports; not source of truth. |
| Retrieval Orchestrator | Builds query intent, applies eligibility, gathers candidates, and invokes ranking. | Storage and retrieval team | `retrieveStartup`, `retrieveFocused`, `retrieveHandoff`, `retrieveAudit` | Depends on UNIT-01 metadata and UNIT-04 eligibility. |
| Ranking Engine | Applies approval, phase, freshness, exact match, and lifecycle graph signals. | Storage and retrieval team | `rankCandidates`, `explainRank` | Semantic signals from UNIT-05 are optional secondary inputs. |
| Context Pack Builder | Selects ordered, explainable context items within token budget. | Storage and retrieval team | `buildPack`, `estimateTokens`, `explainPack` | Exposed through UNIT-03 surfaces. |

## Integration Contracts

| Interaction | Direction | Contract | Error Handling |
|-------------|-----------|----------|----------------|
| Artifact classification | Outbound to UNIT-01 | Source observation with path, version, artifact type, and content sections. | Invalid classification excludes source from approved memory and records rebuild warning. |
| Governance filtering | Outbound to UNIT-04 | Candidate memory, actor/visibility context, retention and deletion state. | Denied or expired memory is excluded before ranking. |
| Retrieval request | Inbound from UNIT-03 | Mode, actor, workspace, goal/query, phase, filters, token budget override if explicit. | Unknown mode falls back to safe startup/focused mode or returns validation error. |
| Delete/export cleanup | Inbound from UNIT-04 / UNIT-03 | Target memory IDs or filters, operation ID, actor, expected cleanup scope. | Idempotent cleanup; partial failures keep operation incomplete. |
| Optional semantic candidates | Inbound from UNIT-05 | Candidate IDs with secondary semantic signal and conflict status. | Semantic candidates are ignored when disabled or policy-ineligible. |
| Rebuild job observation | Outbound to UNIT-03 | Rebuild status, counts, conflicts, timing, provenance. | Failed rebuild reports last safe index state and conflict list. |

## Non-Binding Technology Mapping

| Concern | Candidate | Confidence | Risks | Reversibility |
|---------|-----------|------------|-------|---------------|
| Durable lifecycle artifacts | Markdown under target workspace AI-DLC `docs/` | High | Artifact conventions must be stable enough to parse. | High; parser ports can evolve. |
| Memory event stream | Append-only JSONL | High | Event file growth and compaction need later design. | Medium; events can be replayed or migrated. |
| Local index | SQLite with metadata tables and FTS/BM25-style search | High | Local concurrency limits for future team/server use. | Medium; repository ports enable Postgres profile. |
| Token estimation | Deterministic estimator behind token budget port | Medium | Exact model tokenizer may differ. | High; estimator can be swapped. |
| Server profile | Future Postgres + vector-capable profile behind same repositories | Medium | Premature server design could expand scope. | High if ports remain clean. |

## Approved Technology Decision Trace

| ADR | Impact On This Unit |
|-----|---------------------|
| ADR-001 | TypeScript/Node may host the local package, CLI, MCP, and API surfaces, but storage/retrieval logic remains behind ports. |
| ADR-003 | Markdown/docs and append-only events are durable sources; local SQLite/FTS-style index is rebuildable derived state. |
| ADR-004 | Raw observations are excluded by default unless explicit TTL-enabled policy allows them. |
| ADR-005 | Semantic retrieval is deferred and secondary; baseline lifecycle/BM25 retrieval remains the v1 authority. |

## Data Flow

| Flow | Source | Target | Data | Notes |
|------|--------|--------|------|-------|
| Rebuild from durable sources | Durable Source Reader | Rebuild Coordinator | Artifact observations and event records | Rebuild can run after deleting local index. |
| Classify and govern | Rebuild Coordinator | UNIT-01 / UNIT-04 | Source observations, candidate memories, policy context | Only governed lifecycle memory enters projection. |
| Project derived index | Rebuild Coordinator | Index Projection | Memory metadata, edge data, text fields, approval/visibility state | Projection is derived and replaceable. |
| Retrieve candidates | Retrieval Orchestrator | Index Projection | Query intent, filters, mode | Search combines exact metadata, FTS-style text, and lifecycle links. |
| Rank and pack | Retrieval Orchestrator | Ranking Engine / Context Pack Builder | Eligible candidates, token budget, ranking signals | Final pack includes inclusion reasons and source provenance. |
| Expose context | Context Pack Builder | UNIT-03 | Context pack, token estimate, provenance, ranking explanation | MCP/CLI/API decide presentation format. |

## Failure Modes And Error Handling

| Failure Mode | Mitigation | Verification |
|--------------|------------|--------------|
| Local index deleted or corrupt | Rebuild from durable sources; keep index disposable. | Rebuild integration test after deleting index. |
| Durable source and projection diverge | Rebuild consistency report with created/updated/removed/conflicted counts. | Deterministic rebuild snapshot test. |
| Startup retrieval exceeds 10 seconds | Use indexed metadata, mode-specific filters, and bounded candidate limits. | Local performance test with representative data. |
| Context pack exceeds 2000 tokens | Pack builder enforces token budget and records excluded-but-relevant items for expanded mode. | Token-count test. |
| Private or deleted memory appears in retrieval | Governance eligibility is applied before ranking and packing. | Delete/visibility retrieval tests. |
| Concurrent local write conflict | Use idempotent operation IDs and last-known source version checks. | Local concurrency smoke test. |
| Rebuild observes malformed artifact | Skip invalid source, record warning, preserve last known valid projection for that source until policy says remove. | Malformed artifact rebuild test. |

## Security And Privacy

| Concern | Decision / Mitigation | Related NFR / Risk |
|---------|-----------------------|--------------------|
| Governance eligibility | Retrieval excludes denied, expired, deleted, or unauthorized memory before ranking. | NFR-008, NFR-011, R-005, R-013 |
| Secret persistence | Storage accepts only governed/redacted candidates from UNIT-04. | NFR-007, R-004 |
| Explainability | Context pack items include source path, category, approval state, and inclusion reason. | NFR-006, R-009 |
| Local-first data | No hosted service is required for v1 storage/retrieval. | NFR-005, NFR-019 |
| Future migration | Repository ports avoid exposing SQLite specifics to domain logic. | NFR-010, R-002 |
| Optional semantic data | Vector/embedding data is not a v1 source of truth and must be delete-aware when enabled. | R-003, R-008 |

## ADR-Lite Decisions

### ADR-LD-UNIT02-001: Make The Local Index A Rebuildable Projection

- **Status:** Proposed
- **Context:** Approved Technology Decisions selected local-first durable docs/events plus rebuildable local index.
- **Decision:** Treat the local index as derived retrieval state, not authoritative memory.
- **Rationale:** This satisfies NFR-003, reduces lock-in, and supports future server migration.
- **Alternatives Considered:** Store all memory directly in SQLite only; use Postgres/vector profile as v1 default.
- **Consequences:** Rebuild workflow becomes a first-class operation and must be tested.

### ADR-LD-UNIT02-002: Apply Governance Before Ranking

- **Status:** Proposed
- **Context:** Retrieval can expose sensitive memory if policy is applied too late.
- **Decision:** Apply UNIT-04 eligibility before ranking and context packing.
- **Rationale:** Privacy and deletion semantics must be stronger than retrieval relevance.
- **Alternatives Considered:** Rank all candidates, then filter final output.
- **Consequences:** Fewer candidates reach ranking, but the final pack is safer and easier to audit.

## Open Questions And Trade-Offs

| ID | Question / Trade-Off | Owner | Decision Needed By |
|----|----------------------|-------|--------------------|
| LD-UNIT02-OQ-001 | Which token estimator should v1 use before a model-specific tokenizer is selected? | Storage and retrieval team | Code-generation planning |
| LD-UNIT02-OQ-002 | What event compaction/snapshot policy is needed after JSONL grows beyond v1 scale? | Storage and retrieval team | Operations planning |
| LD-UNIT02-OQ-003 | Should focused retrieval mode allow user-selected expanded token budgets above 2000 by default? | Human / Product | CLI/API design planning |
