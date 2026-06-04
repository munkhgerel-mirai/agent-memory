# User Stories

**Project:** Agent-memory

## Approval Status

Approved by user on 2026-06-04. Generated from the approved Inception plan and approved Mob Elaboration answers.

## Story US-001 - Restore AI-DLC Startup Context

- **Priority:** Must
- **User Role:** Autonomous coding agent
- **Goal:** Retrieve the current project goal, AI-DLC phase, active plan, approved decisions, blockers, and next steps at the start of a fresh session.
- **Business Value:** Agents can resume work without re-reading the entire repository or losing lifecycle continuity.
- **Linked Intent / Outcome:** Fresh-session continuity
- **Dependencies / Assumptions:** Requires indexed lifecycle artifacts and a context pack builder.

### Story

As an autonomous coding agent, I want a compact startup context pack, so that I can resume the AI-DLC workflow accurately in a fresh session.

### Acceptance Criteria

- **AC-001:** Given a workspace with approved setup and inception artifacts, when an agent requests startup context, then the system returns the current goal, phase, active plan, blockers, and next steps.
- **AC-002:** Given the default startup retrieval mode, when the context pack is built, then it contains at most 2000 tokens.
- **AC-003:** Given indexed lifecycle artifacts, when startup context is returned, then each included durable memory includes source/provenance metadata.
- **AC-004:** Given a memory is draft-only and conflicts with an approved decision, when ranking context, then the approved decision outranks the draft memory.

### Notes

- This is the primary success target for v1.

## Story US-002 - Index AI-DLC Artifact-Aware Memory

- **Priority:** Must
- **User Role:** Workspace user
- **Goal:** Store and index AI-DLC lifecycle artifacts as typed memory categories.
- **Business Value:** Teams can trace the lifecycle from intent through plans, decisions, stories, NFRs, risks, verification, and handoff.
- **Linked Intent / Outcome:** AI-DLC lifecycle traceability
- **Dependencies / Assumptions:** Markdown AI-DLC artifacts are canonical source of truth.

### Story

As a workspace user, I want AI-DLC artifacts indexed as lifecycle-aware memories, so that project knowledge stays traceable and reviewable.

### Acceptance Criteria

- **AC-001:** Given a Markdown AI-DLC artifact, when it is indexed, then the system records artifact type, phase, source path, approval status, and timestamp.
- **AC-002:** Given a plan, story, NFR, risk, or decision artifact, when indexed, then it is classified into the corresponding lifecycle memory category.
- **AC-003:** Given an indexed artifact changes, when the index is rebuilt, then stale metadata is updated or removed.
- **AC-004:** Given a reusable template file, when indexing workspace memory, then the system does not treat template placeholders as approved project memory.

### Notes

- V1 memory categories include IntentMemory, PlanMemory, ApprovalGateMemory, DecisionMemory, AssumptionMemory, OpenQuestionMemory, UserStoryMemory, NfrMemory, RiskMemory, UnitMemory, BoltMemory, VerificationMemory, and SessionHandoffMemory.

## Story US-003 - Trace Lifecycle Relationships

- **Priority:** Must
- **User Role:** AI-DLC project owner
- **Goal:** Trace relationships between artifacts and decisions.
- **Business Value:** The team can understand why a decision exists and what downstream work it affects.
- **Linked Intent / Outcome:** AI-DLC lifecycle traceability
- **Dependencies / Assumptions:** SQLite stores typed lifecycle graph edges.

### Story

As an AI-DLC project owner, I want lifecycle relationships between artifacts, so that decisions, risks, stories, and next steps remain explainable.

### Acceptance Criteria

- **AC-001:** Given an approved plan, when tracing related context, then the system can identify linked decisions, open questions, risks, and downstream artifacts.
- **AC-002:** Given a decision memory, when inspected, then the system shows its source artifact, approval status, related risk/NFR/story links, and timestamp.
- **AC-003:** Given a historical approved plan, when later project state changes, then the historical plan remains preserved and newer state is recorded elsewhere.

### Notes

- Lifecycle graph edges can start inside SQLite and move to a graph database only if relationship complexity justifies it later.

## Story US-004 - Search Workspace Memory Locally

- **Priority:** Must
- **User Role:** Solo developer using random LLM
- **Goal:** Search relevant workspace memory without hosted infrastructure.
- **Business Value:** A solo developer can use Agent-memory immediately in local workflows.
- **Linked Intent / Outcome:** Local-first adoption
- **Dependencies / Assumptions:** SQLite FTS5/BM25 is available for local exact search.

### Story

As a solo developer random LLM, I want local memory search, so that I can retrieve project context without a server dependency.

### Acceptance Criteria

- **AC-001:** Given a local workspace, when memory is indexed, then query metadata and FTS/BM25 search work without network access.
- **AC-002:** Given a query references an artifact path, phase, decision, risk, or status, when searched, then exact matching ranks relevant lifecycle artifacts highly.
- **AC-003:** Given the SQLite index is deleted, when rebuild is run, then the index can be reconstructed from Markdown artifacts and JSONL events.

### Notes

- SQLite is a local index/cache, not the only durable source of truth.

## Story US-005 - Provide Framework-Agnostic Interfaces

- **Priority:** Must
- **User Role:** LLM application developer
- **Goal:** Use Agent-memory through MCP, CLI, and local API surfaces.
- **Business Value:** Any LLM or agent runtime can integrate without coupling to one framework.
- **Linked Intent / Outcome:** Framework-agnostic integration
- **Dependencies / Assumptions:** Product form for v1 is local-first MCP server + CLI + local API.

### Story

As an LLM application developer, I want framework-agnostic interfaces, so that I can integrate memory with different agents and models.

### Acceptance Criteria

- **AC-001:** Given an agent runtime that supports MCP, when it connects to Agent-memory, then it can request context and inspect memory through MCP tools.
- **AC-002:** Given a human operator, when using the CLI, then they can inspect, query, export, delete, and rebuild memory indexes.
- **AC-003:** Given a local tool or service, when using the local API, then it can read/write approved memory through documented endpoints or commands.

### Notes

- API details require downstream design and technology decisions.

## Story US-006 - Protect Sensitive Memory

- **Priority:** Must
- **User Role:** Workspace operator
- **Goal:** Prevent secrets and sensitive data from entering durable memory without policy approval.
- **Business Value:** Teams can trust memory without turning it into a long-lived data leak.
- **Linked Intent / Outcome:** Human-auditable memory
- **Dependencies / Assumptions:** Secret redaction and memory visibility scopes exist from day one.

### Story

As a workspace operator, I want privacy and deletion controls, so that memory remains safe, scoped, and reversible.

### Acceptance Criteria

- **AC-001:** Given a memory candidate contains a secret-like value, when durable storage is attempted, then the value is redacted or blocked before indexing.
- **AC-002:** Given a durable memory is stored, when inspected, then it includes source, actor, timestamp, approval status, visibility, and retention policy.
- **AC-003:** Given a user deletes memory, when deletion completes, then the memory is removed from active retrieval indexes, lifecycle edges, and optional vector indexes when present.
- **AC-004:** Given a user exports workspace memory, when export completes, then the export includes durable memories and provenance in a portable format.

### Notes

- Raw observations should have shorter retention than approved lifecycle memories.

## Story US-007 - Support Runtime Triggers Through iii-engine Adapter

- **Priority:** Should
- **User Role:** Workspace user
- **Goal:** Use iii-engine for memory jobs, triggers, and observability while keeping domain logic independent.
- **Business Value:** Agent-memory can benefit from runtime orchestration without locking the core model to one engine.
- **Linked Intent / Outcome:** Extensible runtime integration
- **Dependencies / Assumptions:** iii-engine integration is a first-class adapter, pending technology decision.

### Story

As a workspace user, I want optional iii-engine integration, so that indexing, consolidation, and observability can run through a capable workflow runtime.

### Acceptance Criteria

- **AC-001:** Given iii-engine is configured, when lifecycle artifacts change, then an adapter can trigger index or consolidation jobs.
- **AC-002:** Given iii-engine is not configured, when local Agent-memory is used, then core storage and retrieval still function.
- **AC-003:** Given a runtime job runs, when inspected, then job execution is observable and linked to memory provenance.

### Notes

- Required vs optional status should be resolved in a technology decision.

## Story US-008 - Add Optional Semantic Retrieval Later

- **Priority:** Nice
- **User Role:** Autonomous coding agent
- **Goal:** Retrieve semantically related memory when exact lifecycle search is insufficient.
- **Business Value:** Agents can recover relevant context even when the query does not share exact terms with the artifact.
- **Linked Intent / Outcome:** Retrieval quality
- **Dependencies / Assumptions:** Embeddings are secondary to lifecycle-aware exact search.

### Story

As an autonomous coding agent, I want optional semantic retrieval, so that I can find related project context beyond exact keywords.

### Acceptance Criteria

- **AC-001:** Given optional embeddings are enabled, when a semantic query is made, then vector results are fused with BM25 and lifecycle graph results.
- **AC-002:** Given vector results conflict with approved lifecycle artifacts, when ranking context, then approved lifecycle artifacts remain authoritative.
- **AC-003:** Given embeddings are disabled, when retrieval is run, then BM25 and lifecycle graph retrieval still operate.

### Notes

- This is a v1.1 candidate, not required for the v1 core.
