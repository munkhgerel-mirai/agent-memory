# UNIT-01 Lifecycle Memory Core Domain Design

**Project:** Agent-memory
**Unit ID:** UNIT-01
**Date:** 2026-06-04

## Approval Status

Pending human review. Generated from approved `docs/02-construction/02-design-plan/domain_design_plan.md`.

## Unit Summary

- **Business Capability / Outcome:** Model, classify, and trace AI-DLC artifact-aware memories as the product's core domain.
- **Linked Story IDs:** US-002, US-003
- **Related NFRs:** NFR-004, NFR-006, NFR-015, NFR-016
- **Related Risks:** R-001, R-010

## Domain Model

### Ubiquitous Language

| Term | Definition | Notes |
|------|------------|-------|
| Lifecycle Artifact | A human-reviewable AI-DLC document or record that carries project intent, planning, decision, risk, design, verification, or handoff context. | Source of durable project truth. |
| Lifecycle Memory | A typed memory derived from a lifecycle artifact or approved lifecycle event. | Must include category and provenance. |
| Memory Category | The AI-DLC-native classification of a lifecycle memory, such as Intent, Plan, Decision, UserStory, NFR, Risk, Unit, Bolt, Verification, or SessionHandoff. | Prevents generic memory drift. |
| Artifact Classifier | Domain rule set that maps an artifact into one or more memory categories. | Does not choose parser or storage technology. |
| Lifecycle Edge | A typed relationship between lifecycle memories, such as derives-from, approves, mitigates, blocks, or verifies. | Enables explainable traceability. |
| Approval State | The review status of an artifact or memory: draft, pending review, approved, changes requested, deferred, or historical. | Approved state outranks draft state in downstream retrieval. |
| Historical Record | A previously approved artifact that must remain stable even when newer project state changes. | New state belongs in current artifacts or addenda. |

### Aggregates

| Aggregate | Consistency Boundary | Invariants | Linked Stories |
|-----------|----------------------|------------|----------------|
| LifecycleMemoryRecord | One classified memory plus its category, source provenance, approval state, and lifecycle status. | Category is required; source provenance is required; approved records cannot be silently reclassified without a new lifecycle event; reusable templates cannot become approved project memory. | US-002, US-003 |
| ArtifactClassification | The classification result for one lifecycle artifact at one observed version. | Every classification has a source artifact, observed timestamp, category rationale, and template-vs-project distinction. | US-002 |
| LifecycleRelationshipSet | The typed edges that connect one source lifecycle memory to related downstream or upstream memories. | Edge type is required; both endpoints are lifecycle memories; edge rationale is explainable from source artifacts or approved decisions. | US-003 |

### Entities

| Entity | Identity | Behaviors | Parent Aggregate |
|--------|----------|-----------|------------------|
| LifecycleMemoryRecord | Memory ID derived from source identity and lifecycle category. | Mark approval state, mark historical, attach provenance, expose category rationale, reject template-as-approved-memory transitions. | LifecycleMemoryRecord |
| ArtifactClassification | Classification ID for source artifact version. | Assign categories, record classification rationale, supersede stale classification when artifact version changes. | ArtifactClassification |
| LifecycleEdge | Edge ID formed from source memory, target memory, and edge type. | Link memories, explain relationship, retire stale relationship when source evidence no longer exists. | LifecycleRelationshipSet |

### Value Objects

| Value Object | Attributes | Equality Rule | Validation |
|--------------|------------|---------------|------------|
| MemoryCategory | Name, lifecycle phase, description. | Equal when category name and phase match. | Must be one of the approved AI-DLC-native categories or an explicitly approved extension. |
| ArtifactSource | Workspace path, artifact type, observed version, timestamp. | Equal when path and observed version match. | Path is required; source cannot point to generated runtime examples as approved lifecycle truth. |
| ApprovalState | Status, approver, decision date, rationale. | Equal when status and decision metadata match. | Approved status requires approval evidence; pending status cannot be ranked as team truth. |
| EdgeType | Name, direction, meaning. | Equal when name and direction match. | Must express lifecycle meaning, not storage mechanics. |
| ClassificationRationale | Evidence excerpt reference, rule name, confidence. | Equal when evidence reference and rule name match. | Rationale must be explainable to a human reviewer. |

### Domain Events

| Event | Meaning | Trigger | Consumers |
|-------|---------|---------|-----------|
| LifecycleArtifactClassified | An artifact was classified into AI-DLC memory categories. | Classifier accepts an artifact observation. | Storage/retrieval, governance, context pack. |
| LifecycleMemoryApproved | A memory became approved project truth. | Human approval is recorded. | Retrieval ranking, traceability, session handoff. |
| LifecycleMemoryMarkedHistorical | An approved memory was preserved as history while newer state moved elsewhere. | A later artifact supersedes current operational state. | Retrieval, audit, context pack. |
| LifecycleRelationshipRecorded | A traceability edge was recorded between memories. | A plan, decision, risk, NFR, story, Unit, Bolt, or verification link is detected or approved. | Traceability queries, impact review. |
| ArtifactClassificationSuperseded | A prior classification became stale after source change. | Source artifact changes or is removed. | Rebuild validation, retrieval. |

### Repositories (Interfaces)

| Repository | Intent-Based Operations | Aggregate |
|------------|-------------------------|-----------|
| LifecycleMemoryRepository | findBySource, findApprovedByCategory, saveLifecycleMemory, markHistorical, findTemplateClassifications | LifecycleMemoryRecord |
| ArtifactClassificationRepository | findCurrentClassificationForSource, saveClassification, supersedeClassification | ArtifactClassification |
| LifecycleRelationshipRepository | findRelatedMemories, saveRelationshipSet, removeStaleRelationshipsForSource | LifecycleRelationshipSet |

### Factories

| Factory | Purpose | Inputs | Output |
|---------|---------|--------|--------|
| LifecycleMemoryFactory | Create valid lifecycle memory records from classified artifacts. | ArtifactSource, MemoryCategory, ApprovalState, ClassificationRationale. | LifecycleMemoryRecord |
| LifecycleRelationshipFactory | Create valid typed lifecycle relationships. | Source memory, target memory, EdgeType, rationale. | LifecycleRelationshipSet |

### Domain Services

| Service | Responsibility | Why It Is Not Entity/Aggregate Behavior |
|---------|----------------|-----------------------------------------|
| ArtifactClassificationService | Applies category rules across artifact types and produces classifications. | Classification spans artifact conventions and cannot belong to one memory record before classification exists. |
| LifecycleTraceService | Determines upstream/downstream relationships across multiple memories. | Traceability crosses aggregates and Units. |
| HistoricalRecordPolicy | Decides whether a changed approved artifact should be preserved, superseded, or linked to an addendum. | It applies lifecycle governance across many record types. |

## Open Questions

- OQ-001: Implementation language and runtime surface remain deferred to the technology decision gate.
- Which category extension process should be used after v1 if teams add custom AI-DLC artifacts?

## Validation Checklist

- [x] Aggregates have clear consistency boundaries.
- [x] Invariants are explicit and testable.
- [x] Entities have stable identities.
- [x] Value objects are immutable and value-based.
- [x] Domain events are named as past-tense facts.
- [x] Repositories expose intent-based interfaces only.
- [x] Domain services do not become generic transaction scripts.
- [x] Technology choices, databases, frameworks, cloud services, schemas, and implementation code are absent from Domain Design.
