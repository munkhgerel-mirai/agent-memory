---
name: ai-dlc-logical-design
description: Use when extending approved domain designs into logical designs that address NFRs, risks, integration boundaries, failure modes, and architecture decisions without prematurely committing to implementation.
---

# AI-DLC Logical Design

Use this skill to extend approved domain designs into logical designs that address NFRs, risks, integration boundaries, failure modes, and architecture trade-offs.

## Workflow

1. Confirm approved inputs exist: Units, domain designs, NFRs, and risk register.
2. Create a checkbox plan in `docs/02-construction/02-design-plan/logical_design_plan.md`.
3. Request explicit human approval before execution.
4. For each Unit design, create a logical design document in `docs/02-construction/03-domain-design/<unit_name>_logical_design.md` using `docs/02-construction/03-domain-design/logical_design_TEMPLATE.md`.
5. Build an NFR traceability matrix mapping each applicable NFR to design decisions, components, patterns, and trade-offs.
6. Apply architectural patterns with rationale and alternatives considered.
7. Define component architecture, ownership, interfaces, boundaries, and dependency direction.
8. Create or update `docs/02-construction/01-architecture/system_architecture.md` when cross-Unit architecture, component context, data flow, or architecture decisions need to be captured.
9. Define integration contracts for inbound and outbound interactions.
10. Add high-level technology mapping as non-binding guidance, including candidate databases, frameworks, programming languages, cloud services, confidence, risks, and reversibility. Do not install dependencies or commit to implementation choices in this step.
11. Describe data flow across components and external systems.
12. Describe failure modes and error handling, including timeout, retry, idempotency, partial failure, and backpressure where applicable.
13. Describe security and privacy considerations: authentication, authorization, data classification, secrets, auditability, and compliance.
14. Record ADR-lite decisions with decision, rationale, alternatives considered, and consequences.
15. Record open questions and trade-offs requiring human decision.

## Outputs

- `docs/02-construction/02-design-plan/logical_design_plan.md`
- `docs/02-construction/03-domain-design/<unit_name>_logical_design.md` per Unit
- `docs/02-construction/01-architecture/system_architecture.md` when cross-Unit architecture needs to be captured

Each Logical Design document should include:

- NFR traceability matrix
- Architecture patterns and rationale
- Component boundaries and dependency direction
- Integration contracts
- Non-binding technology mapping, including candidate databases, frameworks, programming languages, cloud services, confidence, risks, and reversibility
- Data flow
- Failure modes and error handling
- Security and privacy considerations
- ADR-lite decisions
- Open questions and trade-offs

## Approval Gate

- Do not execute beyond planning until the human approves.
- Ask before making critical architecture/trade-off decisions.
- Execute one checkbox at a time.
- Mark each checkbox complete after finishing it.
- Do not rewrite previously approved or completed plans except for append-only addenda or explicitly approved follow-up plans.
- Treat prior approved plans as historical evidence, not current-state documents.
- During execution, update only checkbox status and append execution notes, verification results, blockers, or addendum references.
- Placeholder audits and cleanup passes must distinguish active project debt from historical approved plan records.
