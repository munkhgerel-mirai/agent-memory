# UNIT-05 Optional Semantic Retrieval Extension Domain Design

**Project:** Agent-memory
**Unit ID:** UNIT-05
**Date:** 2026-06-04

## Approval Status

Pending human review. Generated from approved `docs/02-construction/02-design-plan/domain_design_plan.md`.

## Unit Summary

- **Business Capability / Outcome:** Add semantic recall as a secondary retrieval signal after lifecycle-aware local retrieval works.
- **Linked Story IDs:** US-008
- **Related NFRs:** NFR-010, NFR-015, NFR-020
- **Related Risks:** R-003, R-008, R-009, R-011

## Domain Model

### Ubiquitous Language

| Term | Definition | Notes |
|------|------------|-------|
| Semantic Retrieval Extension | Optional capability that finds conceptually related memory beyond exact lifecycle terms. | Not part of authoritative v1 lifecycle truth. |
| Semantic Memory Signal | A secondary relevance signal derived from conceptual similarity. | Must never outrank approved lifecycle evidence by itself. |
| Retrieval Fusion | The domain decision that combines lifecycle, exact, graph, governance, and semantic signals. | Lifecycle-authoritative ranking remains primary. |
| Semantic Candidate | A memory candidate found through semantic similarity. | Must still pass governance and provenance checks. |
| Conflict With Approved Memory | A semantic result disagrees with an approved lifecycle artifact or decision. | Approved lifecycle artifact wins. |

### Aggregates

| Aggregate | Consistency Boundary | Invariants | Linked Stories |
|-----------|----------------------|------------|----------------|
| SemanticRetrievalProfile | Optional semantic retrieval mode and its enabled/disabled state. | Disabled mode leaves baseline retrieval fully functional; enabled mode requires governance and provenance checks. | US-008 |
| RetrievalFusionDecision | One fusion decision combining baseline and semantic candidates. | Approved lifecycle candidates outrank conflicting semantic candidates; final pack remains token-bounded; semantic candidates require provenance. | US-008 |
| SemanticCandidateSet | Candidate memories returned by optional semantic recall for one query. | Candidate must link to an existing governed memory; candidate cannot become durable truth without approval. | US-008 |

### Entities

| Entity | Identity | Behaviors | Parent Aggregate |
|--------|----------|-----------|------------------|
| SemanticProfileSetting | Setting ID. | Enable, disable, mark experimental, require approval. | SemanticRetrievalProfile |
| SemanticCandidate | Candidate ID. | Attach similarity rationale, mark eligible, mark conflicted, exclude from pack. | SemanticCandidateSet |
| FusionResultItem | Result item ID. | Record baseline rank, semantic signal, conflict outcome, final inclusion decision. | RetrievalFusionDecision |

### Value Objects

| Value Object | Attributes | Equality Rule | Validation |
|--------------|------------|---------------|------------|
| SemanticSignal | Signal label, similarity rationale, confidence band. | Equal when label and rationale match. | Must be marked secondary. |
| FusionPolicy | Priority order, conflict rule, budget behavior. | Equal when policy version and priority order match. | Approved lifecycle memory must remain authoritative. |
| ConflictAssessment | Conflicting memory, approved source, decision. | Equal when conflicting memory and approved source match. | Conflict must produce exclude, demote, or require-review outcome. |
| SemanticRetrievalMode | Disabled, enabled, experimental, expanded. | Equal when mode name matches. | Disabled mode is valid and must preserve baseline retrieval. |

### Domain Events

| Event | Meaning | Trigger | Consumers |
|-------|---------|---------|-----------|
| SemanticRetrievalEnabled | Optional semantic retrieval became active for a workspace or request mode. | Profile setting is approved. | Retrieval, governance. |
| SemanticRetrievalDisabled | Semantic retrieval was turned off while baseline retrieval remains active. | Profile setting changes. | Retrieval, operators. |
| SemanticCandidatesSuggested | Semantic candidates were proposed for a retrieval request. | Optional semantic recall runs. | Fusion decision, context pack. |
| RetrievalFusionCompleted | Baseline and semantic signals were combined with lifecycle-authoritative rules. | Fusion finishes. | Context pack builder, audit. |
| SemanticCandidateDemoted | A semantic candidate was demoted because approved lifecycle evidence had priority. | Conflict assessment finds approved contradiction. | Retrieval audit, operators. |

### Repositories (Interfaces)

| Repository | Intent-Based Operations | Aggregate |
|------------|-------------------------|-----------|
| SemanticRetrievalProfileRepository | findProfile, saveProfileSetting, disableProfile | SemanticRetrievalProfile |
| SemanticCandidateSetRepository | saveCandidateSet, findCandidatesForRequest, markCandidateConflicted | SemanticCandidateSet |
| RetrievalFusionDecisionRepository | saveFusionDecision, findFusionForRetrievalRequest | RetrievalFusionDecision |

### Factories

| Factory | Purpose | Inputs | Output |
|---------|---------|--------|--------|
| SemanticCandidateSetFactory | Create candidate sets that remain tied to governed memories. | Retrieval request, semantic signals, governed memory references. | SemanticCandidateSet |
| RetrievalFusionDecisionFactory | Create fusion decisions with lifecycle-authoritative rules. | Baseline candidates, semantic candidates, fusion policy, token budget. | RetrievalFusionDecision |

### Domain Services

| Service | Responsibility | Why It Is Not Entity/Aggregate Behavior |
|---------|----------------|-----------------------------------------|
| SemanticRecallService | Proposes conceptually related candidates when optional mode is enabled. | Recall operates across many memories and does not own final ranking. |
| RetrievalFusionService | Combines semantic and baseline signals while preserving lifecycle authority. | Fusion spans retrieval sessions, candidate sets, policy, and conflicts. |
| SemanticConflictPolicyService | Detects and resolves conflicts against approved lifecycle memory. | Conflict evaluation crosses many approved memories and decisions. |

## Open Questions

- OQ-003: Embedding model/provider choice remains deferred to v1.1 or a technology decision gate.
- Should semantic retrieval be absent from v1 implementation while Domain Design preserves the extension boundary?

## Validation Checklist

- [x] Aggregates have clear consistency boundaries.
- [x] Invariants are explicit and testable.
- [x] Entities have stable identities.
- [x] Value objects are immutable and value-based.
- [x] Domain events are named as past-tense facts.
- [x] Repositories expose intent-based interfaces only.
- [x] Domain services do not become generic transaction scripts.
- [x] Technology choices, databases, frameworks, cloud services, schemas, and implementation code are absent from Domain Design.
