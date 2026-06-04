# System Architecture

**Project:** Agent-memory  
**Date:** 2026-06-04

## Approval Status

Approved by user on 2026-06-05. Generated from the approved Logical Design plan after user approval on 2026-06-04.

## Context

- **System Boundary:** Agent-memory is a local-first, AI-DLC artifact-aware memory system that classifies lifecycle artifacts, stores governed durable memory, rebuilds local retrieval indexes, and exposes bounded context through framework-agnostic surfaces.
- **External Actors:** Solo developer, workspace user, team user, coding agent, local operator, optional iii-engine runtime.
- **Linked Intent / Units:** UNIT-01, UNIT-02, UNIT-03, UNIT-04, UNIT-05.
- **Related NFRs:** NFR-001 through NFR-020.
- **Related Risks:** R-001 through R-014.

## Architecture Principles

| Principle | Meaning | Primary Trace |
|-----------|---------|---------------|
| AI-DLC lifecycle truth first | Approved lifecycle artifacts, decisions, risks, NFRs, Units, Bolts, verification, and session handoffs outrank generic memory. | R-001, NFR-016 |
| Local-first with rebuildable projection | Durable Markdown/events are authoritative; local index is derived and rebuildable. | NFR-003, NFR-005, NFR-019 |
| Governance before persistence and retrieval | Unsafe or unauthorized memory is blocked before durable storage and filtered before context packing. | NFR-007, NFR-008, NFR-011, NFR-018 |
| Framework-agnostic integration | MCP, CLI, local API, and iii adapter are adapters over shared capabilities. | NFR-013, NFR-015 |
| Optional extensions stay optional | iii and semantic retrieval can add value without becoming required for core local mode. | R-003, R-006, ADR-002, ADR-005 |

## Components

PlantUML source diagram: `docs/02-construction/01-architecture/system_architecture.puml`.

| Component | Responsibility | Owner | Related Unit | Key Interfaces |
|-----------|----------------|-------|--------------|----------------|
| Category Catalog | Defines approved AI-DLC-native memory categories and extension state. | Core domain team | UNIT-01 | Category validation and description ports. |
| Artifact Classifier | Classifies lifecycle artifacts into memory records with rationale. | Core domain team | UNIT-01 | Artifact observation input, classified memory candidate output. |
| Lifecycle Memory Registry | Owns memory identity, category, provenance, approval state, and historical status. | Core domain team | UNIT-01 | Lifecycle memory repository port. |
| Lifecycle Relationship Catalog | Records typed traceability edges between lifecycle memories. | Core domain team | UNIT-01 | Relationship repository port and trace query port. |
| Governance Policy Engine | Evaluates visibility, approval, retention, redaction, delete, and export decisions. | Governance and operations team | UNIT-04 | Policy decision port. |
| Sensitive Content Guard | Blocks or redacts secrets, PII, and sensitive workspace data before durable writes. | Governance and operations team | UNIT-04 | Candidate review and redaction port. |
| Memory Operation Coordinator | Orchestrates governed inspect, export, delete, and write operations. | Governance and operations team | UNIT-04 | Operation request/decision port. |
| Durable Source Reader | Reads workspace lifecycle artifacts and append-only memory events. | Storage and retrieval team | UNIT-02 | Source scan/read/observe port. |
| Rebuild Coordinator | Rebuilds derived retrieval state from durable sources and reports consistency. | Storage and retrieval team | UNIT-02 | Rebuild job port. |
| Index Projection | Holds derived metadata, lifecycle edges, FTS-style text, and retrieval projections. | Storage and retrieval team | UNIT-02 | Local repository implementation behind ports. |
| Retrieval Orchestrator | Executes startup, focused, handoff, and audit retrieval modes. | Storage and retrieval team | UNIT-02 | Retrieval request/response port. |
| Ranking Engine | Applies lifecycle-aware ranking and optional semantic secondary signals. | Storage and retrieval team | UNIT-02 | Ranking and explanation port. |
| Context Pack Builder | Produces bounded, explainable context packs. | Storage and retrieval team | UNIT-02 | Context pack output port. |
| Capability Router | Routes MCP, CLI, API, and adapter requests to shared memory capabilities. | Integration team | UNIT-03 | Capability request/response contract. |
| MCP Surface | Agent-facing tools for context, query, inspect, rebuild, export, and delete. | Integration team | UNIT-03 | MCP tool adapter. |
| CLI Surface | Local operator commands for memory operations. | Integration team | UNIT-03 | CLI command adapter. |
| Local API Surface | Programmatic local integration surface. | Integration team | UNIT-03 | Local HTTP/API adapter. |
| Memory Job Coordinator | Normalizes long-running rebuild/export/delete/consolidation jobs. | Integration team | UNIT-03 | Job lifecycle and observation port. |
| iii Runtime Adapter | Optional trigger and observability adapter for memory jobs. | Integration team | UNIT-03 | iii adapter boundary. |
| Semantic Profile Manager | Enables/disables optional semantic retrieval profile. | Retrieval enhancement team | UNIT-05 | Semantic profile port. |
| Semantic Provider Port | Abstracts future embedding/provider behavior. | Retrieval enhancement team | UNIT-05 | Provider adapter boundary. |
| Semantic Index Port | Stores and queries future derived semantic entries. | Retrieval enhancement team | UNIT-05 | Derived semantic index port. |
| Retrieval Fusion Service | Fuses baseline and semantic candidates under lifecycle-authoritative rules. | Retrieval enhancement team | UNIT-05 | Fusion and conflict assessment port. |

## Dependency Direction

| Source Layer | May Depend On | Must Not Depend On |
|--------------|---------------|--------------------|
| Domain Core | Shared value objects and repository ports. | CLI, MCP, iii, SQLite, Postgres, embedding providers, local API frameworks. |
| Governance | Domain memory metadata and operation requests. | Concrete storage tables, transport libraries, runtime internals. |
| Storage/Retrieval | Domain ports, governance policy decisions, local storage implementation. | MCP/CLI presentation logic, iii internals, hosted-only infrastructure. |
| Integration Surfaces | Capability Router and domain operation ports. | Concrete domain persistence details. |
| Optional iii Adapter | Memory Job Coordinator and Capability Router. | Direct domain mutation, direct storage mutation, required core startup path. |
| Optional Semantic Extension | Retrieval ports, governance eligibility, semantic provider/index ports. | Baseline retrieval source of truth, approved lifecycle authority. |

## Data Flows

| Flow | Source | Target | Data | Notes |
|------|--------|--------|------|-------|
| Rebuild lifecycle memory | Durable Source Reader | Artifact Classifier -> Governance Policy Engine -> Index Projection | Artifact observations, classified memories, policy decisions, derived projection records | Rebuild is deterministic and can recreate local index from durable sources. |
| Startup context retrieval | MCP/CLI/API Surface | Capability Router -> Retrieval Orchestrator -> Context Pack Builder | Actor/workspace/mode, eligible candidates, ranked context items | Default startup pack stays within 2000 tokens. |
| Governed delete | CLI/API/MCP Surface | Capability Router -> Memory Operation Coordinator -> UNIT-02/UNIT-05 cleanup | Actor, target scope, policy decision, cleanup operation ID | Delete completes only after active retrieval and enabled derived indexes are cleaned. |
| Export memory | CLI/API/MCP Surface | Capability Router -> Memory Operation Coordinator -> UNIT-02 export assembly | Actor, scope, policy result, governed memories and provenance | Export is policy-filtered and provenance-aware. |
| Optional iii job | iii Runtime Adapter | Memory Job Coordinator -> Rebuild/Retrieval/Operation ports | Trigger payload, job type, correlation ID, observation result | iii is optional; core local mode works without it. |
| Optional semantic retrieval | Retrieval Orchestrator | Semantic Profile Manager -> Semantic Index Port -> Retrieval Fusion Service | Query intent, semantic candidates, conflict assessment | Semantic candidates are secondary and policy-filtered. |

## Architecture Decisions

| ADR ID | Decision | Rationale | Alternatives | Consequences |
|--------|----------|-----------|--------------|--------------|
| SYS-LD-ADR-001 | Use ports/adapters around domain core, storage, integration, runtime, and semantic extension. | Supports framework-agnostic and LLM-agnostic memory while preserving future migration paths. | Directly bind domain to TypeScript runtime, SQLite, iii, or MCP. | More explicit interfaces; lower lock-in and clearer tests. |
| SYS-LD-ADR-002 | Treat Markdown/events as durable source and local index as rebuildable projection. | Satisfies local-first, traceability, and rebuild NFRs. | SQLite as sole source of truth; hosted Postgres/vector as v1 default. | Rebuild workflow becomes mandatory, but data remains portable. |
| SYS-LD-ADR-003 | Apply governance before storage and before final retrieval packing. | Prevents secret leakage, accidental sharing, and stale deleted memory retrieval. | Store first then scan; rank first then filter. | More policy plumbing; safer durable memory. |
| SYS-LD-ADR-004 | Keep iii adapter optional and outside core local path. | Matches approved Technology Decision and mitigates runtime lock-in risk. | Make iii required for all jobs. | Adapter adds value when enabled without blocking local adoption. |
| SYS-LD-ADR-005 | Keep semantic retrieval optional, secondary, and lifecycle-authoritative. | Avoids lifecycle-incorrect vector results and provider/privacy risk in v1. | Vector-first retrieval or hosted embedding provider now. | Semantic recall waits for later implementation, but v1 remains safer. |

## NFR / Risk Coverage Summary

| Concern | Architecture Response | Related NFRs / Risks |
|---------|-----------------------|----------------------|
| Startup continuity | Retrieval modes, Ranking Engine, Context Pack Builder, 2000-token startup budget. | NFR-001, NFR-002, NFR-020, R-008, R-009 |
| Traceability | Category Catalog, Lifecycle Memory Registry, Relationship Catalog, provenance. | NFR-004, NFR-006, NFR-016, R-001, R-010 |
| Local-first operation | Durable Source Reader, Rebuild Coordinator, local Index Projection. | NFR-003, NFR-005, NFR-009, NFR-019, R-002 |
| Governance/privacy | Policy Engine, Sensitive Content Guard, Operation Coordinator, retention defaults. | NFR-007, NFR-008, NFR-011, NFR-012, NFR-017, NFR-018, R-004, R-005, R-012, R-013 |
| Runtime/integration | Capability Router, MCP/CLI/local API surfaces, optional iii adapter. | NFR-013, NFR-014, NFR-015, R-006, R-011 |
| Future semantic/server profile | Semantic ports and repository ports without v1 provider lock-in. | NFR-010, R-003, R-008, R-009 |

## Open Questions

| ID | Question | Owner | Needed By |
|----|----------|-------|-----------|
| SYS-LD-OQ-001 | Which implementation slice should be first after Logical Design approval: domain core, storage/rebuild, CLI/MCP, or governance? | Human / Engineering | Code-generation planning |
| SYS-LD-OQ-002 | Should local API ship in v1 or remain design-only until CLI/MCP are stable? | Human / Integration team | Code-generation planning |
| SYS-LD-OQ-003 | What default raw observation TTL should be used when raw observation retention is explicitly enabled? | Human / Governance team | Privacy policy or implementation planning |
| SYS-LD-OQ-004 | Should semantic retrieval have disabled experimental plumbing in v1 or no runtime implementation until v1.1? | Human / Retrieval enhancement team | Code-generation planning |
