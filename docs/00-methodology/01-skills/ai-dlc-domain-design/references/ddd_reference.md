# AI-DLC DDD Reference

Use this reference when creating or reviewing Domain Design artifacts.

## Purpose

Domain-Driven Design keeps the model focused on business behavior before technical choices. In AI-DLC, Domain Design should remain technology-agnostic: do not choose databases, frameworks, cloud services, schemas, or implementation code in this step.

## Core Concepts

| Concept | Meaning | Use When | Watch For |
|---------|---------|----------|-----------|
| Ubiquitous Language | Shared vocabulary used by domain experts, developers, and artifacts | Naming concepts, workflows, events, and rules | Technical jargon replacing business language |
| Bounded Context | A boundary where a model and vocabulary have one clear meaning | Separating business areas or teams | One term meaning different things without context |
| Aggregate | Consistency boundary around related entities/value objects | Enforcing invariants that must be true together | Aggregates that are too large or transaction-script-like |
| Aggregate Root | Entry point that protects aggregate consistency | Controlling changes inside an aggregate | Other objects mutating aggregate internals directly |
| Entity | Object with stable identity over time | Modeling things tracked by identity | Entities with no meaningful behavior |
| Value Object | Immutable object defined by its values | Modeling quantities, ranges, names, money, addresses, states | Mutable value objects or hidden identity |
| Domain Event | Past-tense business fact that something important happened | Decoupling workflows and recording significant changes | Commands named as events |
| Repository Interface | Intent-based collection interface for aggregate persistence | Loading/saving aggregates without infrastructure detail | Database-specific operations in Domain Design |
| Factory | Object or function that creates valid complex domain objects | Creation requires rules, defaults, or invariants | Factories that only wrap constructors without value |
| Domain Service | Stateless domain operation that does not naturally belong to one entity/value object | Behavior spans multiple domain objects | Generic transaction scripts or application orchestration |
| Invariant | Rule that must always hold true inside a consistency boundary | Capturing business constraints | Rules that are vague or untestable |

## Aggregate Guidance

Good aggregates:

- Represent one consistency boundary.
- Protect invariants through aggregate root behavior.
- Expose behavior in business terms.
- Avoid exposing mutable internals.
- Stay small enough to understand and change.

Ask:

- What must be consistent immediately?
- What can be eventually consistent?
- Which object should control changes?
- Which invariants must be testable?

Avoid:

- One aggregate for the whole system.
- Aggregates grouped only by database tables.
- Aggregates that only contain getters and setters.
- Cross-aggregate transactions without a clear business reason.

## Entity Guidance

Use an entity when identity matters beyond its attributes.

Entity examples:

- User account
- Order
- Invoice
- Shipment

Ask:

- What identifies this object?
- Which behaviors change its state?
- Which invariants must it protect?
- Does it need lifecycle states?

Avoid:

- Treating every noun as an entity.
- Moving all behavior into services.
- Using database ID as the only domain meaning.

## Value Object Guidance

Use a value object when equality is based on attributes, not identity.

Value object examples:

- Money
- Email address
- Date range
- Quantity
- Address

Ask:

- Which fields define equality?
- What validation belongs inside this value?
- Should it be immutable?
- Can it make illegal states impossible?

Avoid:

- Mutable value objects.
- Value objects with hidden identity.
- Primitive strings/numbers where domain validation matters.

## Domain Event Guidance

Domain events describe facts that already happened.

Good names:

- `OrderPlaced`
- `PaymentAuthorized`
- `CustomerEmailChanged`
- `ShipmentDelivered`

Ask:

- Who cares that this happened?
- What business meaning does this event carry?
- Which aggregate raises it?
- What data is safe and necessary to include?

Avoid:

- Imperative names such as `PlaceOrder`.
- Events that expose private implementation details.
- Events with too much unrelated data.

## Repository Interface Guidance

Repositories should express domain intent, not database mechanics.

Prefer:

- `findOpenOrdersForCustomer(customerId)`
- `save(order)`
- `findByOrderNumber(orderNumber)`

Avoid:

- `selectFromOrdersTable(sql)`
- `updateOrderRow(columns)`
- Query shapes tied to a specific database engine.

## Domain Service Guidance

Use a domain service only when behavior is genuinely domain behavior and does not belong naturally to one aggregate, entity, or value object.

Good signs:

- The operation coordinates multiple domain objects.
- The operation has business meaning.
- The service is stateless.

Bad signs:

- The service just calls repositories in sequence.
- The service contains UI, API, database, or infrastructure concerns.
- Entities become anemic because all behavior moved into services.

## Factory Guidance

Use a factory when object creation has business rules.

Good factory responsibilities:

- Validate required combinations.
- Apply defaults.
- Create a valid aggregate.
- Enforce creation invariants.

Avoid:

- Factories that only call `new`.
- Factories that know database or framework details.

## Domain Design Review Questions

- Does the design use business language?
- Are all major model elements linked to user stories or Units?
- Are aggregate boundaries clear?
- Are invariants explicit and testable?
- Are entities and value objects separated correctly?
- Are events named as past-tense facts?
- Are repository interfaces technology-agnostic?
- Are domain services justified?
- Are open questions documented?
- Are technology choices absent from Domain Design?

## Handoff To Logical Design

After Domain Design is approved, Logical Design may add:

- Architecture patterns
- Component boundaries
- Integration contracts
- Non-binding technology mapping
- Failure modes
- Security and privacy decisions
- ADR-lite decisions

Do not move these concerns into Domain Design unless they directly describe business behavior.
