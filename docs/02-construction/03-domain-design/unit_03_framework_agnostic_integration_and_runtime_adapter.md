# UNIT-03 Framework-Agnostic Integration And Runtime Adapter Domain Design

**Project:** Agent-memory
**Unit ID:** UNIT-03
**Date:** 2026-06-04

## Approval Status

Approved by user on 2026-06-04. Generated from approved `docs/02-construction/02-design-plan/domain_design_plan.md`.

## Unit Summary

- **Business Capability / Outcome:** Expose Agent-memory through framework-agnostic surfaces and optional runtime orchestration.
- **Linked Story IDs:** US-005, US-007
- **Related NFRs:** NFR-005, NFR-013, NFR-014, NFR-015
- **Related Risks:** R-006, R-011

## Domain Model

### Ubiquitous Language

| Term | Definition | Notes |
|------|------------|-------|
| Memory Capability | A user-meaningful operation Agent-memory can perform, such as request context, inspect memory, query, export, delete, rebuild, or write approved memory. | Independent of transport or framework. |
| Integration Surface | A way for a user, agent, or local tool to invoke memory capabilities. | Domain design names capability semantics, not protocol details. |
| Runtime Adapter | Optional boundary that lets an external orchestration runtime trigger or observe memory jobs. | Core behavior must work without any adapter. |
| Memory Job | A domain-level indexing, rebuild, consolidation, export, or delete operation. | Can be started by local user action or optional runtime trigger. |
| Adapter Observation | Job status, timing, result, and provenance evidence reported through an adapter boundary. | Does not expose runtime internals as domain objects. |

### Aggregates

| Aggregate | Consistency Boundary | Invariants | Linked Stories |
|-----------|----------------------|------------|----------------|
| MemoryCapabilityRequest | One requested memory capability and its domain outcome. | Capability name is required; actor and purpose are required; governance policy must be checked for writes, deletes, and exports. | US-005 |
| RuntimeAdapterBinding | One optional adapter relationship between Agent-memory and an external runtime. | Core local mode remains valid when binding is absent; binding cannot own domain model identity; adapter status is observable. | US-007 |
| MemoryJob | One domain job and its lifecycle state. | Job has type, initiator, target scope, status, provenance link, and result. | US-005, US-007 |

### Entities

| Entity | Identity | Behaviors | Parent Aggregate |
|--------|----------|-----------|------------------|
| CapabilityInvocation | Invocation ID. | Request context, inspect memory, query memory, request export, request delete, request rebuild, request approved write. | MemoryCapabilityRequest |
| AdapterBinding | Binding ID. | Enable, disable, mark unavailable, attach observation capability. | RuntimeAdapterBinding |
| MemoryJobRun | Job run ID. | Start, complete, fail, record observation, link provenance. | MemoryJob |

### Value Objects

| Value Object | Attributes | Equality Rule | Validation |
|--------------|------------|---------------|------------|
| CapabilityName | Name, intent, required policy checks. | Equal when name matches. | Must map to a business memory capability. |
| InvocationContext | Actor, workspace, requested surface, purpose. | Equal when actor, workspace, and purpose match. | Actor and workspace are required. |
| AdapterStatus | State, reason, last observed time. | Equal when state and reason match. | Core mode must remain available when adapter is disabled. |
| JobResultSummary | Status, result category, provenance link, errors. | Equal when status and provenance link match. | Failed jobs must include human-readable reason. |

### Domain Events

| Event | Meaning | Trigger | Consumers |
|-------|---------|---------|-----------|
| MemoryCapabilityInvoked | A user, agent, or local tool requested a memory capability. | Capability request is accepted. | Governance, retrieval, storage, audit. |
| MemoryJobStarted | A memory job began. | Capability request or adapter trigger starts a job. | Operators, adapter observation. |
| MemoryJobCompleted | A memory job completed with result provenance. | Job reaches completed state. | Operators, retrieval, traceability. |
| MemoryJobFailed | A memory job failed with an explainable reason. | Job cannot complete. | Operators, retry policy in later design. |
| RuntimeAdapterEnabled | An optional adapter boundary became available. | Binding is approved and enabled. | Operators, memory jobs. |
| RuntimeAdapterDisabled | An adapter boundary was disabled while core local mode remains available. | Binding is removed or unavailable. | Operators, local mode. |

### Repositories (Interfaces)

| Repository | Intent-Based Operations | Aggregate |
|------------|-------------------------|-----------|
| MemoryCapabilityRequestRepository | saveInvocation, findInvocationsByActor, findPendingPolicyChecks | MemoryCapabilityRequest |
| RuntimeAdapterBindingRepository | findActiveBinding, saveBinding, disableBinding | RuntimeAdapterBinding |
| MemoryJobRepository | startJob, completeJob, failJob, findJobsByWorkspace | MemoryJob |

### Factories

| Factory | Purpose | Inputs | Output |
|---------|---------|--------|--------|
| CapabilityRequestFactory | Create validated memory capability requests. | CapabilityName, InvocationContext, targets. | MemoryCapabilityRequest |
| RuntimeAdapterBindingFactory | Create optional adapter bindings without importing runtime internals. | Adapter label, supported triggers, observation policy. | RuntimeAdapterBinding |
| MemoryJobFactory | Create job runs from capability requests or adapter triggers. | Job type, initiator, target scope. | MemoryJob |

### Domain Services

| Service | Responsibility | Why It Is Not Entity/Aggregate Behavior |
|---------|----------------|-----------------------------------------|
| CapabilityRoutingService | Maps capability requests to domain operations without depending on a specific agent framework. | Routing spans retrieval, governance, rebuild, export, and delete capabilities. |
| RuntimeAdapterPolicyService | Ensures optional runtime adapters do not become hard dependencies. | Policy applies across binding, job, and local-mode behavior. |
| JobObservationService | Converts memory job lifecycle into observable domain facts. | Observation spans jobs and adapter boundaries. |

## Open Questions

- OQ-002: Required-vs-optional status for the iii-engine adapter remains deferred to the technology decision gate.
- Which integration surfaces are required in the first implementation slice should be decided in Logical Design or code-generation planning.

## Validation Checklist

- [x] Aggregates have clear consistency boundaries.
- [x] Invariants are explicit and testable.
- [x] Entities have stable identities.
- [x] Value objects are immutable and value-based.
- [x] Domain events are named as past-tense facts.
- [x] Repositories expose intent-based interfaces only.
- [x] Domain services do not become generic transaction scripts.
- [x] Technology choices, databases, frameworks, cloud services, schemas, and implementation code are absent from Domain Design.
