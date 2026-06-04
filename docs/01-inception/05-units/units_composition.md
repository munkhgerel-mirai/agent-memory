# Units Composition

**Project:** Agent-memory

## Approval Status

Pending human review. Generated from the approved Units and Bolts plan.

## Unit UNIT-01 - AI-DLC Lifecycle Memory Core

- **Business Capability / Outcome:** Model, classify, and trace AI-DLC artifact-aware memories as the product's core domain.
- **Linked Story IDs:** US-002, US-003
- **Related NFRs:** NFR-004, NFR-006, NFR-015, NFR-016
- **Related Risks:** R-001, R-010
- **Key Assumptions:** AI-DLC artifacts are the source of lifecycle truth; generic semantic memory is not the v1 center.
- **Owner / Team:** Core domain team

### Scope

- Define lifecycle memory categories: Intent, Plan, ApprovalGate, Decision, Assumption, OpenQuestion, UserStory, NFR, Risk, Unit, Bolt, Verification, and SessionHandoff.
- Classify Markdown AI-DLC artifacts into lifecycle-aware memory records.
- Define typed lifecycle edges for traceability between artifacts, decisions, risks, and downstream work.
- Preserve historical approved plans as records instead of mutating them to match current state.
- Define the repository content boundary: root `docs/` contains only AI-DLC artifacts for developing Agent-memory; bundled runtime templates, classified Markdown examples, and fixtures live under `src/docs/`.

### Out Of Scope

- Runtime/storage-specific implementation details.
- Full graph database adoption.
- Generic unconstrained semantic memory taxonomy.

### Dependencies And Integration Points

| Dependency | Classification | Direction | Notes |
|------------|----------------|-----------|-------|
| Approved Inception artifacts | Sequential | Inbound | Unit boundaries depend on approved stories, NFRs, and risks. |
| Markdown AI-DLC artifact layout | Data | Inbound | Classifier consumes a target workspace's AI-DLC `docs/` phase structure, while this repository's root `docs/` remains development-only. |
| Runtime documentation assets | Data | Outbound | Product templates, classified Markdown examples, and fixtures are stored under `src/docs/`. |
| Storage/index Unit | Integration | Outbound | UNIT-02 persists metadata, search index, and lifecycle edges. |
| Privacy/Governance Unit | Integration | Both | Memory category and provenance metadata must include visibility and approval fields. |

### Boundary Validation

- [x] Unit represents one clear business capability or outcome.
- [x] Included stories are cohesive.
- [x] Coupling to other Units is explicit and acceptable.
- [x] Unit can be independently built by one team.
- [x] No story is orphaned or duplicated without explanation.
- [x] NFR and risk impacts are considered.

### Open Questions

| ID | Question | Owner | Needed By |
|----|----------|-------|-----------|
| OQ-001 | Which implementation language and package/runtime surface should be selected first? | Human / codex | Technology decision |

## Unit UNIT-02 - Local Workspace Storage And Retrieval

- **Business Capability / Outcome:** Provide local-first durable indexing and retrieval that can restore AI-DLC context quickly and explainably.
- **Linked Story IDs:** US-001, US-004
- **Related NFRs:** NFR-001, NFR-002, NFR-003, NFR-005, NFR-009, NFR-010, NFR-019, NFR-020
- **Related Risks:** R-002, R-008, R-009, R-010
- **Key Assumptions:** Markdown and JSONL are durable/replayable sources; SQLite is a rebuildable local workspace index/cache.
- **Owner / Team:** Storage and retrieval team

### Scope

- Store append-only JSONL event/audit records.
- Build SQLite metadata, FTS/BM25 search, and lifecycle edge indexes.
- Rebuild SQLite index deterministically from Markdown artifacts and JSONL events.
- Produce a default startup context pack at or below 2000 tokens.
- Support local/offline search for solo and workspace users.
- Use `src/docs/` for bundled sample Markdown inputs, classified fixtures, and template assets used by implementation or tests.

### Out Of Scope

- Hosted Postgres + pgvector server profile.
- Vector-only architecture.
- Complex distributed synchronization.

### Dependencies And Integration Points

| Dependency | Classification | Direction | Notes |
|------------|----------------|-----------|-------|
| UNIT-01 lifecycle categories and edges | Sequential | Inbound | Storage schema and retrieval ranking need memory categories and edge semantics. |
| `src/docs/` runtime assets | Data | Inbound | Sample classified Markdown and template fixtures can seed tests and examples without polluting root AI-DLC artifacts. |
| Privacy/Governance policies | Integration | Inbound | Retrieval filters must respect visibility, redaction, retention, and deletion. |
| Integration surfaces | Integration | Outbound | UNIT-03 exposes query/rebuild/context operations through MCP, CLI, and local API. |
| Future Postgres profile | External-system | Outbound | Interfaces should avoid SQLite lock-in. |

### Boundary Validation

- [x] Unit represents one clear business capability or outcome.
- [x] Included stories are cohesive.
- [x] Coupling to other Units is explicit and acceptable.
- [x] Unit can be independently built by one team.
- [x] No story is orphaned or duplicated without explanation.
- [x] NFR and risk impacts are considered.

### Open Questions

| ID | Question | Owner | Needed By |
|----|----------|-------|-----------|
| OQ-001 | Which implementation language and package/runtime surface should be selected first? | Human / codex | Technology decision |

## Unit UNIT-03 - Framework-Agnostic Integration And Runtime Adapter

- **Business Capability / Outcome:** Expose Agent-memory through framework-agnostic surfaces and optional runtime orchestration.
- **Linked Story IDs:** US-005, US-007
- **Related NFRs:** NFR-005, NFR-013, NFR-014, NFR-015
- **Related Risks:** R-006, R-011
- **Key Assumptions:** MCP, CLI, and local API are v1 product surfaces; iii-engine is valuable but should not own the domain model.
- **Owner / Team:** Integration team

### Scope

- Define MCP tools for context retrieval and memory inspection.
- Define CLI commands for inspect, query, export, delete, and rebuild.
- Define a local API for programmatic integration.
- Add an optional/first-class iii-engine adapter for indexing, consolidation jobs, and observability hooks.
- Keep core behavior working without iii-engine configured.

### Out Of Scope

- Hosted SaaS API.
- Enterprise-grade permission systems.
- Binding domain model objects directly to iii-engine internals.

### Dependencies And Integration Points

| Dependency | Classification | Direction | Notes |
|------------|----------------|-----------|-------|
| UNIT-01 domain model | Sequential | Inbound | Interfaces expose domain concepts and memory categories. |
| UNIT-02 storage/retrieval APIs | Sequential | Inbound | MCP/CLI/API call retrieval, export, delete, and rebuild operations. |
| UNIT-04 governance policies | Integration | Both | Interfaces must enforce write approval, redaction, visibility, and delete/export rules. |
| iii-engine | External-system | Both | Adapter is a runtime integration surface pending technology decision. |

### Boundary Validation

- [x] Unit represents one clear business capability or outcome.
- [x] Included stories are cohesive.
- [x] Coupling to other Units is explicit and acceptable.
- [x] Unit can be independently built by one team.
- [x] No story is orphaned or duplicated without explanation.
- [x] NFR and risk impacts are considered.

### Open Questions

| ID | Question | Owner | Needed By |
|----|----------|-------|-----------|
| OQ-002 | Should iii-engine be required for v1 or shipped as an optional first-class adapter? | Human / codex | Technology decision |

## Unit UNIT-04 - Privacy, Governance, And Memory Operations

- **Business Capability / Outcome:** Keep durable memory safe, scoped, auditable, reversible, and operable.
- **Linked Story IDs:** US-006
- **Related NFRs:** NFR-007, NFR-008, NFR-011, NFR-012, NFR-017, NFR-018
- **Related Risks:** R-004, R-005, R-012, R-013, R-014
- **Key Assumptions:** Secrets are never stored automatically; durable shared memories require provenance, visibility, approval, and retention metadata.
- **Owner / Team:** Governance and operations team

### Scope

- Redact or block secret-like values before durable storage.
- Define memory visibility scopes: private, workspace, and team-shared.
- Track provenance: source, actor, timestamp, artifact link, approval status, visibility, and retention policy.
- Support delete and export from day one.
- Define raw observation retention policy and approved artifact memory retention policy.
- Provide governance requirements used by storage, retrieval, and integration surfaces.

### Out Of Scope

- Enterprise-grade permission model.
- Complex multi-tenant billing or SaaS tenancy.
- Automatic PII storage without policy approval.

### Dependencies And Integration Points

| Dependency | Classification | Direction | Notes |
|------------|----------------|-----------|-------|
| UNIT-01 lifecycle metadata | Integration | Inbound | Governance metadata attaches to memory records and artifact categories. |
| UNIT-02 indexes | Integration | Both | Delete/export must update durable records, FTS index, lifecycle edges, and future vector indexes. |
| UNIT-03 interfaces | Integration | Both | CLI/API/MCP must expose safe inspect, export, delete, and memory-write operations. |
| Raw observation TTL decision | Sequential | Inbound | Exact TTL is still open and should be resolved before implementation. |

### Boundary Validation

- [x] Unit represents one clear business capability or outcome.
- [x] Included stories are cohesive.
- [x] Coupling to other Units is explicit and acceptable.
- [x] Unit can be independently built by one team.
- [x] No story is orphaned or duplicated without explanation.
- [x] NFR and risk impacts are considered.

### Open Questions

| ID | Question | Owner | Needed By |
|----|----------|-------|-----------|
| OQ-004 | What retention duration should apply to raw observations by default? | Human / codex | Privacy policy |

## Unit UNIT-05 - Optional Semantic Retrieval Extension

- **Business Capability / Outcome:** Add semantic recall as a secondary retrieval signal after lifecycle-aware local retrieval works.
- **Linked Story IDs:** US-008
- **Related NFRs:** NFR-010, NFR-015, NFR-020
- **Related Risks:** R-003, R-008, R-009, R-011
- **Key Assumptions:** Embeddings are not the v1 source of truth and must not outrank approved lifecycle artifacts.
- **Owner / Team:** Retrieval enhancement team

### Scope

- Define optional embedding provider/model integration.
- Add vector results as a secondary retrieval signal.
- Fuse semantic, BM25, and lifecycle graph results without weakening approval/provenance ranking.
- Keep BM25 and lifecycle graph retrieval functional when embeddings are disabled.

### Out Of Scope

- Vector-only retrieval architecture.
- Hosted vector database as v1 default.
- Full knowledge graph UI.

### Dependencies And Integration Points

| Dependency | Classification | Direction | Notes |
|------------|----------------|-----------|-------|
| UNIT-02 local retrieval | Sequential | Inbound | Semantic retrieval extends, not replaces, local lifecycle retrieval. |
| UNIT-04 deletion/privacy policy | Sequential | Inbound | Deletion must purge vector entries when enabled. |
| Embedding model/provider decision | External-system | Inbound | Provider choice is deferred to v1.1 or a technology decision. |

### Boundary Validation

- [x] Unit represents one clear business capability or outcome.
- [x] Included stories are cohesive.
- [x] Coupling to other Units is explicit and acceptable.
- [x] Unit can be independently built by one team.
- [x] No story is orphaned or duplicated without explanation.
- [x] NFR and risk impacts are considered.

### Open Questions

| ID | Question | Owner | Needed By |
|----|----------|-------|-----------|
| OQ-003 | Which local embedding model/provider, if any, should be supported in v1.1? | Human / codex | Retrieval enhancement |

## Coverage Validation

| Story ID | Assigned Unit | Notes |
|----------|---------------|-------|
| US-001 | UNIT-02 | Startup context retrieval and context pack. |
| US-002 | UNIT-01 | Lifecycle memory classification. |
| US-003 | UNIT-01 | Lifecycle traceability and relationship edges. |
| US-004 | UNIT-02 | Local search and rebuildable index. |
| US-005 | UNIT-03 | MCP, CLI, and local API. |
| US-006 | UNIT-04 | Privacy, deletion, export, provenance, and governance. |
| US-007 | UNIT-03 | iii-engine adapter and observability. |
| US-008 | UNIT-05 | Optional semantic retrieval extension. |

All `Must` stories are assigned exactly once. The `Should` and `Nice` stories are assigned to extension-oriented Units with explicit dependencies.
