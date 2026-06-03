# <UNIT_NAME> Domain Design - Template

**Project:** <PROJECT_NAME>
**Unit ID:** <UNIT_ID>
**Date:** <YYYY-MM-DD>

## Approval Status

<Pending review / Approved by <APPROVER> on <DATE> / Changes requested / Deferred>

## Unit Summary

- **Business Capability / Outcome:** <CAPABILITY_OR_OUTCOME>
- **Linked Story IDs:** <US-001, US-002>
- **Related NFRs:** <NFR-001>
- **Related Risks:** <R-001>

## Domain Model

### Ubiquitous Language

| Term | Definition | Notes |
|------|------------|-------|
| <TERM> | <DEFINITION> | <NOTES> |

### Aggregates

| Aggregate | Consistency Boundary | Invariants | Linked Stories |
|-----------|----------------------|------------|----------------|
| <AGGREGATE_NAME> | <BOUNDARY> | <TESTABLE_INVARIANTS> | <US_IDS> |

### Entities

| Entity | Identity | Behaviors | Parent Aggregate |
|--------|----------|-----------|------------------|
| <ENTITY_NAME> | <IDENTITY> | <BEHAVIORS> | <AGGREGATE_NAME> |

### Value Objects

| Value Object | Attributes | Equality Rule | Validation |
|--------------|------------|---------------|------------|
| <VALUE_OBJECT_NAME> | <ATTRIBUTES> | <EQUALITY_RULE> | <VALIDATION> |

### Domain Events

| Event | Meaning | Trigger | Consumers |
|-------|---------|---------|-----------|
| <PAST_TENSE_EVENT_NAME> | <MEANING> | <TRIGGER> | <CONSUMERS> |

### Repositories (Interfaces)

| Repository | Intent-Based Operations | Aggregate |
|------------|-------------------------|-----------|
| <REPOSITORY_NAME> | <OPERATIONS> | <AGGREGATE_NAME> |

### Factories

| Factory | Purpose | Inputs | Output |
|---------|---------|--------|--------|
| <FACTORY_NAME> | <PURPOSE> | <INPUTS> | <OUTPUT> |

### Domain Services

| Service | Responsibility | Why It Is Not Entity/Aggregate Behavior |
|---------|----------------|-----------------------------------------|
| <SERVICE_NAME> | <RESPONSIBILITY> | <RATIONALE> |

## Open Questions

- <OPEN_QUESTION>

## Validation Checklist

- [ ] Aggregates have clear consistency boundaries.
- [ ] Invariants are explicit and testable.
- [ ] Entities have stable identities.
- [ ] Value objects are immutable and value-based.
- [ ] Domain events are named as past-tense facts.
- [ ] Repositories expose intent-based interfaces only.
- [ ] Domain services do not become generic transaction scripts.
- [ ] Technology choices, databases, frameworks, cloud services, schemas, and implementation code are absent from Domain Design.
