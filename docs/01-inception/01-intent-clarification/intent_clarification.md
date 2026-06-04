# Intent Clarification

**Project:** Agent-memory
**Date:** 2026-06-04

## Approval Status

Approved by user on 2026-06-04. Generated from the approved Inception plan and approved Mob Elaboration answers.

## Working Intent

To build an agentic memory system that provides persistent, framework-agnostic context for any Large Language Model (LLM) operating within the AI-Driven Development Lifecycle (AI-DLC) methodology.

## Key Objectives

- Persistent Context: Maintain session states across different AI interactions.
- LLM Agnostic: Seamlessly integrate with any underlying language model.
- Workflow Alignment: Support rapid, iterative AI-DLC software engineering phases.

## Stakeholders And Users

| Role / Group | Need | Notes |
|--------------|------|-------|
| Team and workspace users | Shared lifecycle memory across project sessions, agents, and contributors. | Primary user group for product direction. |
| Solo developer using random LLM | Local/single-user memory for project continuity across fresh sessions. | First-person local mode should remain lightweight. |
| Autonomous coding agents | Reliable context packs, decisions, active plans, blockers, and next steps. | Agents consume memory through MCP, CLI, or API surfaces. |
| AI-DLC project owner / approver | Traceable approval gates, decision rationale, and artifact history. | Human approval remains authoritative for lifecycle transitions. |
| Workspace operator | Inspectable storage, deletion/export, retention, and privacy controls. | Operational needs should stay simple in v1. |

## Business Outcomes

| Outcome | Success Measure | Priority |
|---------|-----------------|----------|
| Fresh-session continuity | A fresh agent session restores current goal, phase, approved decisions, active plan, blockers, and next steps within 10 seconds using a context pack of at most 2000 tokens. | Must |
| AI-DLC lifecycle traceability | Memory can trace from Intent to Plan, Approval, Decision, Story, NFR, Risk, Unit, Bolt, Verification, and Handoff records. | Must |
| Framework-agnostic integration | The system exposes local MCP, CLI, and local API surfaces without binding memory semantics to one LLM or agent runtime. | Must |
| Human-auditable memory | Durable memories include provenance, source artifact, actor, timestamp, approval status, visibility, and retention policy. | Must |
| Local-first adoption | A solo developer can run the v1 system locally without hosted infrastructure. | Should |
| Extensible runtime integration | iii-engine can be used as a first-class adapter for triggers, jobs, and observability while the domain model remains independent. | Should |

## Scope

### In Scope

- AI-DLC artifact-aware memory as the first memory model.
- Lifecycle memory categories: Intent, Plan, ApprovalGate, Decision, Assumption, OpenQuestion, UserStory, NFR, Risk, Unit, Bolt, Verification, and SessionHandoff.
- Markdown AI-DLC artifacts as canonical human-readable source of truth.
- JSONL append-only event/audit log.
- SQLite local workspace index/cache for metadata, FTS/BM25 search, and AI-DLC lifecycle graph edges.
- 2000-token default context pack builder.
- MCP server, CLI, and local API product surfaces for v1.
- Secret redaction, provenance, scoped memory, delete/export, and retention rules from day one.
- Optional or first-class iii-engine adapter for runtime triggers, background consolidation jobs, and observability.
- Future migration path to Postgres + pgvector for hosted or high-concurrency team-server profiles.

### Out Of Scope

- Hosted SaaS as the v1 default.
- Complex multi-tenant billing.
- Enterprise-grade permission model.
- Unrestricted automatic memory writes.
- Automatic secret or PII storage.
- Full knowledge graph UI.
- Vector-only architecture.
- Deep autonomous memory mutation without review.
- Binding the Agent-memory domain model directly to iii-engine internals.

## Workflows And Edge Cases

| Workflow / Scenario | Expected Result | Edge Cases |
|---------------------|-----------------|------------|
| Capture approved lifecycle artifact | Artifact memory is indexed with type, phase, source path, approval status, and provenance. | Draft artifacts must not outrank approved decisions. |
| Restore startup context | Agent receives a structured context pack under 2000 tokens with goal, phase, active plan, decisions, blockers, and next steps. | If context is insufficient, the agent can request focused retrieval. |
| Trace a decision | User or agent can trace a decision back to its source artifact, approval, related risks, and downstream plans. | Historical approved plans must be preserved as records, not rewritten. |
| Retrieve task context | Retrieval filters by workspace, phase, artifact type, approval status, visibility, and current task. | Low-relevance memories should be excluded even if semantically similar. |
| Delete/export memory | User can export workspace memory and delete or purge selected memory from indexes and future retrieval. | Deletion must remove derived index entries and optional vector entries when present. |
| Run runtime jobs | iii-engine adapter may trigger indexing, consolidation, and observability jobs. | Core domain logic must still work without iii-engine. |

## Data And Integrations

| Data / Integration | Direction | Owner / System | Notes |
|--------------------|-----------|----------------|-------|
| Markdown AI-DLC docs | Inbound and outbound | Workspace repository | Canonical source of truth for lifecycle artifacts. |
| JSONL event/audit log | Inbound and outbound | Agent-memory | Append-only replay and provenance record. |
| SQLite workspace DB | Inbound and outbound | Agent-memory | Local metadata, FTS/BM25, lifecycle edges, rebuildable index/cache. |
| MCP server | Outbound to agents | Agent-memory | Primary agent integration surface for local and framework-agnostic use. |
| CLI | Inbound and outbound | Agent-memory | Human/operator control surface for inspect, query, export, delete, rebuild. |
| Local API | Inbound and outbound | Agent-memory | Programmatic integration surface for tools and local services. |
| iii-engine | Inbound and outbound | Optional runtime adapter | Triggers, jobs, observability, and function orchestration. |
| Embedding/vector index | Inbound and outbound | Optional future retrieval index | Secondary semantic signal, not v1 source of truth. |
| Postgres + pgvector | Inbound and outbound | Future server profile | For hosted, high-concurrency, or multi-workspace deployments. |

## Constraints And Assumptions

| Type | Description | Impact |
|------|-------------|--------|
| Constraint | v1 should remain local-first and inspectable. | Avoids hosted infrastructure as a default dependency. |
| Constraint | AI-DLC artifacts and approval gates are the core differentiator. | Retrieval ranking must prefer approved lifecycle artifacts over generic memories. |
| Constraint | Default startup context pack budget remains 2000 tokens. | Context packing must be concise but can include more rationale than a 1000-token pack. |
| Constraint | Technology decisions need a Human Selection Gate before becoming binding. | Storage/runtime choices are recommendations until technology decision approval. |
| Assumption | Teams/workspace users are primary, with solo Codex local mode supported. | Product must support both shared context semantics and simple local operation. |
| Assumption | iii-engine is valuable but should not own the domain model. | Keeps portability across runtimes and future implementations. |
| Assumption | SQLite can serve as a rebuildable local index/cache for v1. | Markdown and JSONL remain the durable audit trail. |

## Compliance Or Policy Concerns

| Concern | Applicability | Notes |
|---------|---------------|-------|
| Secrets and credentials | Applicable | Secrets must be redacted and must not be stored automatically. |
| Personal or sensitive data | Applicable | PII and sensitive workspace data require classification and explicit policy approval before durable storage. |
| Retention and deletion | Applicable | Raw observations should have short TTL; approved lifecycle artifact memories are retained longer. |
| Provenance and audit | Applicable | Every durable memory must include source, actor, timestamp, artifact link, approval status, and visibility. |
| Exportability | Applicable | Workspace memory export should be supported from day one. |
| Enterprise compliance | Deferred | Enterprise controls are not v1 scope but should not be blocked by the model. |

## Open Questions

| ID | Question | Owner | Needed By |
|----|----------|-------|-----------|
| OQ-001 | Which implementation language and package/runtime surface should be selected first? | Human / codex | Technology decision |
| OQ-002 | Should iii-engine be required for v1 or shipped as an optional first-class adapter? | Human / codex | Technology decision |
| OQ-003 | Which local embedding model/provider, if any, should be supported in v1.1? | Human / codex | Retrieval enhancement |
| OQ-004 | What retention duration should apply to raw observations by default? | Human / codex | Privacy policy |
