# Bolts Plan

**Project:** Agent-memory

## Approval Status

Pending human review. Generated from the approved Units and Bolts plan.

## Bolt BOLT-01 - Define Lifecycle Memory Core

- **Unit:** UNIT-01
- **Goal:** Define the AI-DLC lifecycle memory categories, artifact classifier rules, and typed traceability edges.
- **Duration:** 1-2 days
- **Included Stories:** US-002, US-003
- **Expected Artifact / Output:** Domain memory model draft, classifier specification, lifecycle edge catalog, traceability examples.
- **Parallel / Sequential Status:** Sequential
- **Reasoning:** Storage, retrieval, governance, and interfaces depend on the lifecycle memory vocabulary.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| Approved Inception artifacts | Sequential | Source inputs for lifecycle category and story/risk/NFR traceability. |
| Technology decision | Sequential | Implementation language can be selected before code generation; model can be drafted technology-agnostically first. |

### Validation Method

- Review that each lifecycle category maps to at least one approved artifact type or planned downstream artifact.
- Verify US-002 and US-003 acceptance criteria are represented in the model.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-02 - Build Local Storage And Rebuildable Index Foundation

- **Unit:** UNIT-02
- **Goal:** Establish Markdown/JSONL/SQLite storage responsibilities and deterministic rebuild behavior.
- **Duration:** 1-3 days
- **Included Stories:** US-004
- **Expected Artifact / Output:** Storage design, JSONL event schema, SQLite metadata/FTS/lifecycle-edge schema, rebuild workflow.
- **Parallel / Sequential Status:** Sequential after BOLT-01
- **Reasoning:** Storage schema depends on lifecycle memory categories and traceability edges.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-01 | Sequential | Provides lifecycle categories and typed edges. |
| Raw source artifacts | Data | Markdown and JSONL are the durable sources used for rebuild. |

### Validation Method

- Verify rebuild can be specified from Markdown artifacts and JSONL events without relying on SQLite as sole source of truth.
- Verify US-004 and NFR-003/NFR-009 are covered.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-03 - Design Retrieval And 2000-Token Context Pack

- **Unit:** UNIT-02
- **Goal:** Define retrieval ranking, metadata filters, lifecycle graph expansion, and bounded startup context packing.
- **Duration:** 1-2 days
- **Included Stories:** US-001
- **Expected Artifact / Output:** Retrieval pipeline design, ranking rules, context pack schema, token-budget validation approach.
- **Parallel / Sequential Status:** Sequential after BOLT-02
- **Reasoning:** Retrieval depends on the local index and lifecycle graph foundation.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-02 | Sequential | Provides storage/index primitives. |
| UNIT-04 policy requirements | Integration | Retrieval must respect visibility, retention, redaction, and deletion. |

### Validation Method

- Verify context pack includes goal, phase, active plan, approved decisions, blockers, and next steps under 2000 tokens.
- Verify US-001, NFR-001, NFR-002, NFR-020, R-008, and R-009 are addressed.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-04 - Define Privacy, Provenance, Delete, Export, And Retention Controls

- **Unit:** UNIT-04
- **Goal:** Define durable memory safety rules and operator controls before broad write/retrieval surfaces are finalized.
- **Duration:** 1-2 days
- **Included Stories:** US-006
- **Expected Artifact / Output:** Governance policy, provenance metadata schema, redaction rules, delete/export workflow, retention policy proposal.
- **Parallel / Sequential Status:** Parallel-safe after BOLT-01
- **Reasoning:** Governance can proceed once lifecycle metadata exists and can then feed storage and interface designs.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-01 | Sequential | Provides memory record categories and approval/status fields. |
| Raw observation TTL decision | Sequential | Exact TTL remains open and can be resolved during this Bolt or a technology/policy decision. |

### Validation Method

- Verify US-006, NFR-007, NFR-008, NFR-011, NFR-017, NFR-018, and risks R-004/R-005/R-012/R-013 are addressed.
- Review that deletion covers durable records, FTS index, lifecycle edges, and future vector entries.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-05 - Specify MCP, CLI, And Local API Surfaces

- **Unit:** UNIT-03
- **Goal:** Specify the framework-agnostic interfaces that agents, users, and local tools will use.
- **Duration:** 1-2 days
- **Included Stories:** US-005
- **Expected Artifact / Output:** MCP tool list, CLI command map, local API capability map, interface-to-domain traceability.
- **Parallel / Sequential Status:** Sequential after BOLT-02 and BOLT-04
- **Reasoning:** Interfaces must expose storage/retrieval operations and enforce governance rules.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-02 | Sequential | Provides storage/retrieval operations. |
| BOLT-04 | Sequential | Provides privacy, delete/export, and visibility rules. |
| Technology decision | Sequential | Implementation language/package surface must be chosen before implementation. |

### Validation Method

- Verify US-005 and NFR-005/NFR-013 are covered.
- Review that MCP/CLI/API surfaces do not couple the domain model to one LLM runtime.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-06 - Specify iii-engine Runtime Adapter

- **Unit:** UNIT-03
- **Goal:** Define iii-engine adapter responsibilities for triggers, consolidation jobs, and observability while preserving core independence.
- **Duration:** 1 day
- **Included Stories:** US-007
- **Expected Artifact / Output:** Adapter boundary, job/event mapping, observability requirements, required-vs-optional decision note.
- **Parallel / Sequential Status:** Parallel-safe after BOLT-01; implementation sequential after technology decision
- **Reasoning:** Adapter boundaries can be designed independently, but implementation depends on the runtime decision.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-01 | Sequential | Adapter must refer to stable domain events and memory categories. |
| OQ-002 | Sequential | Required-vs-optional status must be resolved before implementation. |

### Validation Method

- Verify US-007, NFR-014, R-006, and R-011 are addressed.
- Confirm core local mode remains viable without iii-engine.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Bolt BOLT-07 - Plan Optional Semantic Retrieval Extension

- **Unit:** UNIT-05
- **Goal:** Define how optional vector/embedding retrieval can augment but not replace lifecycle-aware retrieval.
- **Duration:** 1 day
- **Included Stories:** US-008
- **Expected Artifact / Output:** v1.1 semantic retrieval design note, fusion/ranking rules, deletion/privacy implications.
- **Parallel / Sequential Status:** Sequential after BOLT-03 and BOLT-04
- **Reasoning:** Semantic retrieval depends on the core retrieval pipeline and must obey governance/delete policy.
- **Status:** Planned

### Dependencies

| Dependency | Classification | Notes |
|------------|----------------|-------|
| BOLT-03 | Sequential | Provides baseline BM25/lifecycle retrieval pipeline. |
| BOLT-04 | Sequential | Provides deletion/privacy policy for future vector entries. |
| OQ-003 | External-system | Embedding provider/model choice remains open. |

### Validation Method

- Verify US-008 and R-003 are addressed without making vectors a v1 source of truth.
- Confirm retrieval remains functional when embeddings are disabled.

### Exit Criteria

- [ ] Expected output is produced.
- [ ] Included stories are covered.
- [ ] Dependencies are satisfied or documented.
- [ ] Validation method is completed or scheduled.

## Parallelization Summary

| Bolt | Parallel / Sequential Status | Reasoning |
|------|------------------------------|-----------|
| BOLT-01 | Sequential | Foundational lifecycle memory vocabulary. |
| BOLT-02 | Sequential after BOLT-01 | Storage schema depends on domain categories and edges. |
| BOLT-03 | Sequential after BOLT-02 | Retrieval depends on index/rebuild foundation. |
| BOLT-04 | Parallel-safe after BOLT-01 | Governance can proceed once memory categories exist. |
| BOLT-05 | Sequential after BOLT-02 and BOLT-04 | Interfaces need storage operations and governance controls. |
| BOLT-06 | Parallel-safe after BOLT-01 for design; sequential for implementation | Adapter boundary can be designed early, implementation awaits technology decision. |
| BOLT-07 | Sequential after BOLT-03 and BOLT-04 | Semantic retrieval extends baseline retrieval and privacy controls. |
