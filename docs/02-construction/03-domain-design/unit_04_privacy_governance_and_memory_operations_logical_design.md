# UNIT-04 Privacy, Governance, And Memory Operations Logical Design

**Project:** Agent-memory  
**Unit ID:** UNIT-04  
**Date:** 2026-06-04  
**Approved Domain Design:** `docs/02-construction/03-domain-design/unit_04_privacy_governance_and_memory_operations.md`

## Approval Status

Pending review. Generated from the approved Logical Design plan after user approval on 2026-06-04.

## NFR Traceability Matrix

| NFR ID | Design Decision | Component / Boundary | Pattern / Tactic | Trade-Off |
|--------|-----------------|----------------------|------------------|-----------|
| NFR-007 | Secret-like values are blocked or redacted before durable storage. | Sensitive Content Guard | Pre-write policy gate | False positives may require manual override later. |
| NFR-008 | Shared durable memory requires approval and visibility metadata. | Governance Policy Engine | Policy-as-domain-decision | More metadata entry, but team memory remains trustworthy. |
| NFR-011 | Delete/export are domain operations with derived-index cleanup obligations. | Memory Operation Coordinator | Command workflow with audit result | Delete is slower because it must touch derived state. |
| NFR-012 | Actor, source, timestamp, visibility, retention, and approval are mandatory governance metadata. | Provenance Ledger | Provenance stamp value object | Slightly larger records, but compliance hooks are present. |
| NFR-017 | Raw observations are not retained automatically; opt-in retention uses configurable TTL. | Retention Policy Engine | Safe default with explicit opt-in | Less implicit memory value until teams promote context. |
| NFR-018 | Sensitive workspace data is blocked, redacted, or routed for approval. | Sensitive Content Guard, Policy Review Queue | Least-sharing default | More review friction for uncertain content. |

## Architecture Patterns

| Pattern | Rationale | Alternatives Considered | Consequences |
|---------|-----------|-------------------------|--------------|
| Policy gate before persistence | Prevent unsafe data from becoming durable or indexed. | Scan after storage | Safer default; requires every write path to call governance first. |
| Command-style memory operations | Delete, export, inspect, and write need actor, purpose, decision, and audit result. | Direct repository mutation | More explicit workflows; easier to test and audit. |
| Least-privilege visibility defaults | Private/workspace/team-shared scopes must avoid accidental disclosure. | Default all memory to workspace | Safer for teams; users may need explicit promotion. |
| Derived cleanup contract | Delete must remove active retrieval records, lifecycle edges, and future vectors. | Delete only source record | Prevents stale retrieval; requires UNIT-02/UNIT-05 coordination. |

## Component Boundaries

| Component | Responsibility | Owner | Interfaces | Dependency Direction |
|-----------|----------------|-------|------------|----------------------|
| Governance Policy Engine | Evaluates write, inspect, delete, export, and visibility decisions. | Governance and operations team | `evaluateWrite`, `evaluateOperation`, `explainDecision` | Called by UNIT-01, UNIT-02, and UNIT-03 before durable or sensitive actions. |
| Sensitive Content Guard | Detects secret-like, PII-like, and sensitive workspace content before durable storage. | Governance and operations team | `reviewCandidate`, `redact`, `block` | Pure policy service; storage receives only allowed/redacted output. |
| Provenance Ledger | Requires source, actor, timestamp, approval state, visibility, and retention evidence. | Governance and operations team | `createProvenance`, `validateProvenance` | Domain metadata source for all Units. |
| Retention Policy Engine | Applies approved lifecycle memory retention and opt-in raw observation TTL. | Governance and operations team | `resolveRetention`, `isExpired`, `scheduleDisposal` | Feeds UNIT-02 retrieval eligibility and cleanup. |
| Memory Operation Coordinator | Orchestrates inspect, export, delete, and governed write operation decisions. | Governance and operations team | `requestDelete`, `requestExport`, `requestInspect`, `requestWrite` | Invoked by UNIT-03 surfaces; coordinates UNIT-02 cleanup/export. |
| Policy Review Queue | Represents approval-required outcomes for shared writes or uncertain sensitive content. | Governance and operations team | `queueReview`, `resolveReview` | Optional v1 workflow boundary, not a UI commitment. |

## Integration Contracts

| Interaction | Direction | Contract | Error Handling |
|-------------|-----------|----------|----------------|
| Durable memory write review | Inbound from UNIT-01 / UNIT-02 / UNIT-03 | Memory candidate, actor, source, intended visibility, approval evidence. | Return allow/redact/block/approval-required; never partially store blocked content. |
| Retrieval eligibility | Outbound to UNIT-02 | Memory ID, visibility context, approval state, retention result, deletion status. | Ineligible memories are excluded with explanation. |
| Delete operation | Inbound from UNIT-03 | Actor, target scope, purpose, requested memory IDs or filters. | Deny unauthorized destructive operations; if cleanup partially fails, mark operation incomplete and retry idempotently. |
| Export operation | Inbound from UNIT-03 | Actor, scope, export filters, format intent, include provenance flag. | Deny unsafe scopes; export redacted content according to policy. |
| Future vector cleanup | Outbound to UNIT-05 | Deleted memory IDs and disposal event. | Semantic index must purge derived entries before reporting delete complete when enabled. |
| Raw observation retention | Inbound from optional runtime adapter | Raw observation candidate, workspace policy, TTL setting. | Default is no retention; reject raw persistence without explicit policy. |

## Non-Binding Technology Mapping

| Concern | Candidate | Confidence | Risks | Reversibility |
|---------|-----------|------------|-------|---------------|
| Policy implementation | TypeScript policy services with declarative rule metadata | Medium | Rule sprawl if not versioned. | High; rules can be versioned and migrated. |
| Secret scanning | Local heuristic detector behind policy port | Medium | False negatives for uncommon secret forms. | High; detector can be replaced or extended. |
| Audit events | Append-only JSONL event stream plus local index projection | High | Event volume grows over time. | Medium; compaction/snapshot can be added later. |
| Retention scheduling | Local cleanup command/job invoked by CLI or optional iii adapter | Medium | Missed cleanup if users never run jobs. | High; same operation can move to server later. |
| Enterprise IAM | Deferred | High | v1 lacks enterprise-grade authorization. | High; domain metadata preserves future hooks. |

## Approved Technology Decision Trace

| ADR | Impact On This Unit |
|-----|---------------------|
| ADR-002 | Optional iii jobs may observe or trigger governance-related operations, but cannot bypass policy decisions. |
| ADR-003 | Delete/export must cover durable docs/events and derived local index projections. |
| ADR-004 | Raw observations are not retained automatically; enabled raw observation capture requires configurable TTL. |
| ADR-005 | Future semantic indexes are derived data and must honor delete/export and privacy controls. |

## Data Flow

| Flow | Source | Target | Data | Notes |
|------|--------|--------|------|-------|
| Govern write | Memory candidate producer | Governance Policy Engine | Candidate, actor, source, visibility, approval state | All durable write paths pass here first. |
| Redact sensitive fields | Governance Policy Engine | Sensitive Content Guard | Candidate content and metadata | Redacted output preserves rationale. |
| Attach provenance | Governance Policy Engine | Provenance Ledger | Source, actor, timestamp, approval, retention | Provenance becomes required metadata for storage. |
| Apply retention | Provenance Ledger | Retention Policy Engine | Memory class and policy version | Approved lifecycle memory and raw observations use different policies. |
| Execute delete/export | UNIT-03 surface | Memory Operation Coordinator | Operation request, actor, target scope | Coordinator invokes UNIT-02 and UNIT-05 cleanup/export boundaries. |

## Failure Modes And Error Handling

| Failure Mode | Mitigation | Verification |
|--------------|------------|--------------|
| Secret-like content detected in durable candidate | Block or redact before persistence; return explainable decision. | Secret redaction/blocking tests. |
| Governance service skipped by a write path | Require storage repository port to reject missing governance metadata. | Repository contract tests. |
| Delete partially removes source but leaves derived index | Operation remains incomplete until UNIT-02/UNIT-05 cleanup confirms. | Delete integration test across active indexes. |
| Export includes private/team-ineligible memory | Apply visibility and actor policy before export assembly. | Export authorization tests. |
| Raw observation retention enabled without TTL | Reject raw observation storage and report policy configuration error. | Retention policy tests. |
| Policy evaluation backlog | Mark approval-required requests explicitly and keep them out of retrieval until resolved. | Policy queue workflow test. |

## Security And Privacy

| Concern | Decision / Mitigation | Related NFR / Risk |
|---------|-----------------------|--------------------|
| Secrets | Block or redact before durable source, JSONL event, local index, or context pack. | NFR-007, R-004 |
| PII and sensitive workspace data | Require policy classification and least-sharing default. | NFR-018, R-013 |
| Shared memory approval | Team-shared memory must include approval state and visibility evidence. | NFR-008, R-013 |
| Delete/export control | Destructive and broad export operations require actor, purpose, and audit record. | NFR-011, R-005 |
| Raw observation minimization | No automatic raw observation retention by default; opt-in TTL only. | NFR-017, R-012 |
| Auditability | Operation decisions and provenance are exported with memory where allowed. | NFR-012 |

## ADR-Lite Decisions

### ADR-LD-UNIT04-001: Governance Is Mandatory Before Durable Writes

- **Status:** Proposed
- **Context:** Agent-memory persists long-lived context that may be shared across users and sessions.
- **Decision:** Every durable memory write must pass a governance decision before storage or indexing.
- **Rationale:** This mitigates secret persistence, accidental sharing, and unapproved draft memory becoming team truth.
- **Alternatives Considered:** Store first and redact later; rely on caller discipline.
- **Consequences:** All write paths need policy metadata, but the storage layer can reject unsafe writes consistently.

### ADR-LD-UNIT04-002: Raw Observations Are Opt-In With TTL

- **Status:** Proposed
- **Context:** Approved Technology Decisions selected no automatic raw observation retention by default.
- **Decision:** Raw observations are not durable unless explicit workspace policy enables them with a TTL.
- **Rationale:** This minimizes sensitive data accumulation while preserving future observability options.
- **Alternatives Considered:** Fixed short TTL always enabled; retain raw observations until manual deletion.
- **Consequences:** Some implicit context is lost unless promoted into approved lifecycle memory.

## Open Questions And Trade-Offs

| ID | Question / Trade-Off | Owner | Decision Needed By |
|----|----------------------|-------|--------------------|
| LD-UNIT04-OQ-001 | What conservative default TTL should be used when a workspace explicitly enables raw observations? | Human / Governance team | Privacy policy or code-generation planning |
| LD-UNIT04-OQ-002 | Should team-shared memory always require explicit human approval even when sourced from an approved artifact? | Human / Governance team | Before write-policy implementation |
| LD-UNIT04-OQ-003 | What export formats are required in the first implementation slice? | Human / Integration team | Code-generation planning |
