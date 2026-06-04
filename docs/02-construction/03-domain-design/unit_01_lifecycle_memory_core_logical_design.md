# UNIT-01 Lifecycle Memory Core Logical Design

**Project:** Agent-memory  
**Unit ID:** UNIT-01  
**Date:** 2026-06-04  
**Approved Domain Design:** `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core.md`

## Approval Status

Pending review. Generated from the approved Logical Design plan after user approval on 2026-06-04.

## NFR Traceability Matrix

| NFR ID | Design Decision | Component / Boundary | Pattern / Tactic | Trade-Off |
|--------|-----------------|----------------------|------------------|-----------|
| NFR-004 | Preserve approved artifacts as stable historical records and create new lifecycle events for later state changes. | Historical Record Policy, Lifecycle Memory Registry | Append-only lifecycle events with explicit supersession links | More records to manage, but traceability remains reviewable. |
| NFR-006 | Every returned lifecycle memory carries category, source path, approval state, and rationale. | Lifecycle Memory Registry, Artifact Classifier | Explainable classification metadata | Context packs use more tokens for provenance, but memory injection is auditable. |
| NFR-015 | Keep domain concepts independent from storage, runtime, and embedding providers. | Domain Core Port Boundary | Hexagonal domain core with repository ports | More interface design upfront, but avoids iii/SQLite/provider lock-in. |
| NFR-016 | Make AI-DLC categories explicit and testable. | Category Catalog, Artifact Classifier | Closed v1 category set with approved extension process | Custom team categories wait for an extension gate. |

## Architecture Patterns

| Pattern | Rationale | Alternatives Considered | Consequences |
|---------|-----------|-------------------------|--------------|
| Hexagonal domain core | Lifecycle concepts should not import CLI, MCP, iii, SQLite, Postgres, or embedding details. | Storage-first model tied to SQLite tables | Keeps design portable but requires clear ports. |
| Classification pipeline | Artifact observation, classification, rationale, and memory creation are separate logical steps. | One monolithic parser/classifier | Easier to explain and test category decisions; more intermediate objects. |
| Append-only lifecycle event posture | Approved/historical states need durable traceability. | Mutable latest-state-only model | Better auditability; requires retrieval to choose current vs historical records. |
| Typed relationship graph | AI-DLC traceability depends on explicit edges such as derives-from, approves, mitigates, blocks, and verifies. | Untyped links or text search only | Better impact analysis; requires edge validation rules. |

## Component Boundaries

| Component | Responsibility | Owner | Interfaces | Dependency Direction |
|-----------|----------------|-------|------------|----------------------|
| Category Catalog | Defines approved v1 memory categories and extension status. | Core domain team | `listCategories`, `validateCategory`, `describeCategory` | Pure domain; no outbound infrastructure dependency. |
| Artifact Classifier | Converts artifact observations into classified lifecycle memory candidates. | Core domain team | `classifyArtifact`, `explainClassification` | Depends on Category Catalog; called by storage/rebuild workflows. |
| Lifecycle Memory Registry | Owns lifecycle memory identity, category, provenance, approval state, and historical status. | Core domain team | `createMemory`, `markApproved`, `markHistorical`, `findBySource` | Exposes repository port; implemented by UNIT-02. |
| Lifecycle Relationship Catalog | Creates and validates typed edges between lifecycle memories. | Core domain team | `recordRelationship`, `findRelated`, `retireStaleEdges` | Depends on memory identity; persistence delegated to UNIT-02. |
| Historical Record Policy | Decides whether a changed approved memory is current, superseded, historical, or requires addendum. | Core domain team | `evaluateChange`, `createSupersession` | Consumes approval state; emits lifecycle events for storage. |

## Integration Contracts

| Interaction | Direction | Contract | Error Handling |
|-------------|-----------|----------|----------------|
| Artifact observation from rebuild/indexing | Inbound from UNIT-02 | Workspace path, artifact type, observed version, content summary, template/project boundary flag. | Reject missing provenance; classify as non-approved template when source is under runtime fixtures. |
| Governance eligibility check | Outbound to UNIT-04 | Memory candidate, category, source, approval state, visibility hint. | Block durable shared memory when policy decision is denied or missing. |
| Memory persistence | Outbound to UNIT-02 | Valid lifecycle memory records and relationship events. | Return validation errors before persistence; retry only idempotent saves by stable memory ID. |
| Context pack explanation | Outbound to UNIT-02 | Category, source path, approval state, lifecycle edge rationale, historical marker. | If rationale is absent, candidate is excluded from default startup pack. |
| Integration surface exposure | Outbound through UNIT-03 | Read-only category, memory, and traceability inspection capabilities. | Surface must show unavailable operations as policy/validation failures, not silent omissions. |

## Non-Binding Technology Mapping

| Concern | Candidate | Confidence | Risks | Reversibility |
|---------|-----------|------------|-------|---------------|
| Language/runtime | TypeScript/Node domain package | Medium | Runtime concerns could leak into domain modules. | Medium; ports allow later package extraction. |
| Category definition | Static TypeScript constants plus schema-validated metadata | Medium | Static category set may feel restrictive to teams. | High; extension process can add versioned categories. |
| Artifact parsing | Markdown front matter/section parser behind parser port | Medium | Ad hoc parsing may misclassify unusual artifacts. | High; parser can be swapped without changing domain model. |
| Relationship persistence | Repository port implemented by local index in UNIT-02 | High | Edge/source divergence if rebuild rules are weak. | Medium; durable events remain source of truth. |
| Hosted services | None for v1 core domain | High | No server-side team coordination in v1. | High; server profile can implement same ports later. |

## Approved Technology Decision Trace

| ADR | Impact On This Unit |
|-----|---------------------|
| ADR-001 | TypeScript/Node is acceptable for the package surface, but lifecycle categories and memory records remain technology-neutral domain concepts. |
| ADR-003 | Local-first docs/events plus rebuildable index requires memory IDs, provenance, and relationship events to be replayable. |
| ADR-005 | Semantic retrieval is optional and must not weaken lifecycle-authoritative categories or traceability. |

## Data Flow

| Flow | Source | Target | Data | Notes |
|------|--------|--------|------|-------|
| Classify artifact | UNIT-02 Rebuild Workflow | Artifact Classifier | Artifact observation, path, content sections, observed version | Classifier returns category decisions and rationale only. |
| Create memory | Artifact Classifier | Lifecycle Memory Registry | Category, source, approval state, rationale | Registry validates identity and template boundary. |
| Record traceability | Lifecycle Memory Registry | Lifecycle Relationship Catalog | Source/target memory IDs, edge type, rationale | Edges remain lifecycle-meaningful, not storage-specific. |
| Apply historical policy | Artifact change observation | Historical Record Policy | Prior approved memory, new observation, approval evidence | Approved records are not silently rewritten. |
| Publish domain events | Domain components | UNIT-02 / UNIT-03 / UNIT-04 | Classified, approved, historical, relationship events | Consumers decide storage, inspection, and policy behavior. |

## Failure Modes And Error Handling

| Failure Mode | Mitigation | Verification |
|--------------|------------|--------------|
| Artifact missing source provenance | Reject classification as durable lifecycle memory and report validation issue. | Unit test classifier rejects missing path/version. |
| Reusable template treated as approved project memory | Require template-vs-project boundary flag and block approved status for runtime fixtures. | Fixture classification test using `src/docs/` examples. |
| Conflicting category assignment | Return multi-category candidate only with rationale; otherwise require review. | Classification ambiguity tests. |
| Stale relationship after source change | Rebuild emits stale-edge retirement event tied to source version. | Rebuild consistency test in UNIT-02. |
| Approved historical record overwritten | Historical Record Policy converts change into supersession/addendum event. | Artifact diff workflow review. |
| Classification pipeline backpressure | Process artifacts in deterministic batches and expose progress to UNIT-03 jobs. | Rebuild job progress test in later implementation. |

## Security And Privacy

| Concern | Decision / Mitigation | Related NFR / Risk |
|---------|-----------------------|--------------------|
| Data classification | Lifecycle category is required before durable memory can become retrievable. | NFR-006, NFR-016, R-001 |
| Approval safety | Draft or pending memory cannot outrank approved lifecycle memory. | NFR-004, NFR-006 |
| Secret handling | Classifier does not persist raw content directly; UNIT-04 policy must approve durable writes. | NFR-007, R-004 |
| Auditability | Every memory and relationship keeps source path/version and rationale. | NFR-006, NFR-012 |
| Boundary safety | Domain core cannot import storage/runtime/provider concerns. | NFR-015, R-006 |

## ADR-Lite Decisions

### ADR-LD-UNIT01-001: Keep Lifecycle Memory Core Provider-Agnostic

- **Status:** Proposed
- **Context:** Agent-memory must be framework-agnostic and preserve AI-DLC-native memory as its differentiator.
- **Decision:** Model categories, memory records, approval state, and lifecycle edges in a pure domain core behind ports.
- **Rationale:** This protects NFR-015 and prevents the domain from becoming a clone of a runtime or storage library.
- **Alternatives Considered:** Store-first schema model; iii-native domain model.
- **Consequences:** More explicit boundaries are required, but implementation can evolve without rewriting domain concepts.

### ADR-LD-UNIT01-002: Treat Historical Approved Artifacts As Immutable Evidence

- **Status:** Proposed
- **Context:** AI-DLC plans and decisions become records once approved.
- **Decision:** Later changes create supersession, historical, or addendum relationships instead of silently rewriting approved memory.
- **Rationale:** This satisfies NFR-004 and keeps agent handoffs explainable.
- **Alternatives Considered:** Latest-state-only project memory.
- **Consequences:** Retrieval must choose operationally current records while retaining historical evidence.

## Open Questions And Trade-Offs

| ID | Question / Trade-Off | Owner | Decision Needed By |
|----|----------------------|-------|--------------------|
| LD-UNIT01-OQ-001 | What governance process should approve custom category extensions after v1? | Human / Core domain team | Before custom category implementation |
| LD-UNIT01-OQ-002 | Should multi-category memories be allowed in v1, or should classifier output one primary category plus secondary tags? | Core domain team | Code-generation planning |
