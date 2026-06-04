# UNIT-04 Privacy, Governance, And Memory Operations Domain Design

**Project:** Agent-memory
**Unit ID:** UNIT-04
**Date:** 2026-06-04

## Approval Status

Pending human review. Generated from approved `docs/02-construction/02-design-plan/domain_design_plan.md`.

## Unit Summary

- **Business Capability / Outcome:** Keep durable memory safe, scoped, auditable, reversible, and operable.
- **Linked Story IDs:** US-006
- **Related NFRs:** NFR-007, NFR-008, NFR-011, NFR-012, NFR-017, NFR-018
- **Related Risks:** R-004, R-005, R-012, R-013, R-014

## Domain Model

### Ubiquitous Language

| Term | Definition | Notes |
|------|------------|-------|
| Memory Candidate | Information proposed for durable memory before governance checks pass. | May be accepted, redacted, blocked, or routed for approval. |
| Durable Memory | Memory accepted for long-lived retrieval with provenance, approval, visibility, and retention metadata. | Includes lifecycle memories and approved derived memories. |
| Visibility Scope | Who may retrieve or inspect a durable memory: private, workspace, or team-shared. | Defaults should favor least sharing when uncertain. |
| Provenance | Evidence describing source, actor, timestamp, artifact link, approval status, and retention policy. | Required for human auditability. |
| Redaction Decision | The outcome of sensitive-content review: allow, redact, block, or require approval. | Must be explainable. |
| Retention Policy | Rule that governs how long memory remains retrievable. | Raw observations are shorter-lived than approved lifecycle memories. |
| Memory Operation | User- or agent-requested inspect, delete, export, query, or memory-write action. | Must respect policy. |

### Aggregates

| Aggregate | Consistency Boundary | Invariants | Linked Stories |
|-----------|----------------------|------------|----------------|
| GovernedMemory | One durable memory plus governance metadata and current policy state. | Provenance is required; visibility is required; approval state is required for shared memory; secret-like values cannot be stored unreviewed. | US-006 |
| GovernancePolicy | The active policy rules for visibility, redaction, retention, delete, and export. | Policy rule has owner and effective status; uncertain sensitivity routes to safest outcome; raw observation retention is explicitly unresolved until policy approval. | US-006 |
| MemoryOperationRequest | One requested operation and its authorization/policy decision. | Operation has actor, purpose, target scope, policy result, and audit outcome. | US-006 |

### Entities

| Entity | Identity | Behaviors | Parent Aggregate |
|--------|----------|-----------|------------------|
| GovernedMemory | Governed memory ID. | Assign visibility, attach provenance, apply redaction decision, mark deleted, mark exported. | GovernedMemory |
| PolicyRule | Rule ID and version. | Evaluate candidate, require approval, retire rule, explain decision. | GovernancePolicy |
| MemoryOperationRequest | Operation request ID. | Request inspect, request delete, request export, request write, record decision. | MemoryOperationRequest |
| RedactionFinding | Finding ID inside a candidate review. | Mark as allowed, redacted, blocked, or approval-required. | GovernedMemory |

### Value Objects

| Value Object | Attributes | Equality Rule | Validation |
|--------------|------------|---------------|------------|
| VisibilityScope | Scope name, audience, default behavior. | Equal when scope name and audience match. | Must be private, workspace, team-shared, or approved extension. |
| ProvenanceStamp | Source, actor, timestamp, approval state, artifact link. | Equal when all evidence fields match. | Source, actor, and timestamp are required. |
| RetentionRule | Memory class, duration policy, disposal action. | Equal when memory class and policy version match. | Raw observation TTL may be unresolved but must be explicitly flagged before implementation. |
| RedactionDecision | Outcome, rationale, affected fields. | Equal when outcome and rationale match. | Secret-like content cannot produce an allow decision without policy evidence. |
| OperationDecision | Allowed/denied/approval-required, reason. | Equal when outcome and reason match. | Shared writes and destructive operations require traceable decision evidence. |

### Domain Events

| Event | Meaning | Trigger | Consumers |
|-------|---------|---------|-----------|
| MemoryCandidateReviewed | A candidate was evaluated by governance policy. | A durable write is attempted. | Storage/retrieval, integration surfaces. |
| MemoryCandidateRedacted | Sensitive content was removed or masked before durable storage. | Redaction decision is applied. | Audit, retrieval, export. |
| MemoryCandidateBlocked | A candidate was rejected from durable storage. | Policy blocks unsafe content. | Operator feedback, audit. |
| GovernedMemoryStored | A durable memory passed governance and was stored as retrievable memory. | Policy allows write. | Retrieval, traceability, export. |
| GovernedMemoryDeleted | A memory was removed from active retrieval and derived indexes. | Delete operation is approved and completed. | Retrieval, export, optional semantic retrieval. |
| GovernedMemoryExported | Memory and provenance were exported in portable form. | Export operation completes. | Operators, compliance workflows. |

### Repositories (Interfaces)

| Repository | Intent-Based Operations | Aggregate |
|------------|-------------------------|-----------|
| GovernedMemoryRepository | findByVisibility, saveGovernedMemory, markDeleted, findExportableMemories | GovernedMemory |
| GovernancePolicyRepository | findActivePolicy, savePolicyRule, retirePolicyRule | GovernancePolicy |
| MemoryOperationRepository | saveOperationRequest, findOperationHistoryForMemory, findPendingApprovals | MemoryOperationRequest |

### Factories

| Factory | Purpose | Inputs | Output |
|---------|---------|--------|--------|
| GovernedMemoryFactory | Create a durable memory only after policy decision is known. | Memory candidate, provenance, visibility, redaction decision, retention rule. | GovernedMemory |
| MemoryOperationRequestFactory | Create auditable operation requests. | Actor, operation type, targets, purpose. | MemoryOperationRequest |

### Domain Services

| Service | Responsibility | Why It Is Not Entity/Aggregate Behavior |
|---------|----------------|-----------------------------------------|
| SensitiveContentPolicyService | Evaluates memory candidates for secrets, PII, and sensitive workspace data. | Review can span multiple candidate fields and policy rules. |
| MemoryDeletionService | Coordinates domain deletion semantics across durable memory and derived retrieval surfaces. | Deletion affects multiple memory records and downstream indexes. |
| MemoryExportService | Produces portable export semantics with provenance and policy constraints. | Export spans many governed memories and policy decisions. |

## Open Questions

- OQ-004: Default raw observation retention duration remains unresolved and should be decided in a privacy/policy gate before implementation.
- Should team-shared memory require explicit human approval even when the source artifact is already approved?

## Validation Checklist

- [x] Aggregates have clear consistency boundaries.
- [x] Invariants are explicit and testable.
- [x] Entities have stable identities.
- [x] Value objects are immutable and value-based.
- [x] Domain events are named as past-tense facts.
- [x] Repositories expose intent-based interfaces only.
- [x] Domain services do not become generic transaction scripts.
- [x] Technology choices, databases, frameworks, cloud services, schemas, and implementation code are absent from Domain Design.
