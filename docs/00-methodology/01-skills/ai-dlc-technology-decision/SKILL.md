---
name: ai-dlc-technology-decision
description: Use when selecting or approving databases, frameworks, programming languages, cloud services, dependencies, integration technologies, infrastructure tools, runtime platforms, or other technology choices in AI-DLC through trade-off analysis, ADR entries, reversibility assessment, a human selection gate, and human approval before implementation.
---

# AI-DLC Technology Decision

Use this skill to turn technology choices into explicit, traceable, approval-gated ADR entries.

## Inputs / Preconditions

- Approved intent, user stories, NFRs, and risk register
- Approved Units, Domain Design, Logical Design, or Brownfield Discovery report, if applicable
- Explicit technology decision request or unresolved technology question
- Candidate options, constraints, preferences, or existing standards, if available
- Approval to begin technology decision planning

## Workflow

1. Confirm decision scope, decision areas, and whether the decision is required now or can be deferred.
2. Create a checkbox decision plan in `docs/02-construction/02-design-plan/technology_decision_plan.md`.
3. Request explicit human approval before execution.
4. Review decision drivers: user outcomes, NFRs, risks, domain model needs, logical design constraints, brownfield discovery findings, team constraints, operational constraints, and compliance needs.
5. Identify candidate options, including a defer/no-decision option when reasonable.
6. Compare candidates across fitness, trade-offs, risks, reversibility, migration cost, lock-in, security, privacy, compliance, operability, scalability, maintainability, cost, team familiarity, and ecosystem maturity.
7. Present the comparison and recommendation at the Human Selection Gate.
8. Require the human to select a candidate, explicitly defer/no-decision, reject all candidates, or request more analysis.
9. Record the selection outcome, selector/date, selection rationale, conditions, and downstream authorization boundaries.
10. Mark each recommendation as `Proposed` until human selection and approval are both recorded.
11. Record each decision as an ADR entry in `docs/02-construction/01-architecture/technology_decisions.md` using `docs/02-construction/01-architecture/technology_decisions_TEMPLATE.md` when starting from the template.
12. Link ADR entries to related Units, NFRs, risks, logical design decisions, brownfield findings, and implementation/deployment impacts.
13. Record rejected alternatives and why they were not selected.
14. Record downstream follow-ups for Logical Design, Code Generation, Deployment, or Operations.
15. Request human approval before decisions become binding or downstream artifacts are updated.

## Decision Guidance

Evaluate each candidate with:

- Fit to business outcomes and user workflows
- Fit to NFR targets
- Risk reduction or risk introduction
- Security and privacy impact
- Compliance and data residency impact
- Operational complexity
- Cost and cost growth
- Scalability and performance characteristics
- Maintainability and team familiarity
- Ecosystem maturity and supportability
- Migration path from existing systems
- Reversibility and lock-in
- Testing and observability implications

Use decision status values:

- `Proposed`
- `Approved`
- `Rejected`
- `Superseded`
- `Deferred`

Use confidence values:

- `Low`
- `Medium`
- `High`

Use reversibility values:

- `Low` - difficult to reverse; major migration or rewrite likely
- `Medium` - reversible with planned migration effort
- `High` - easy to swap or defer with limited impact

## Human Selection Gate

At this gate, the human must choose one of these outcomes:

- `Selected` - one candidate is selected for ADR approval consideration.
- `Deferred` - the decision is intentionally postponed.
- `Rejected` - all current candidates are rejected.
- `More Analysis Needed` - the AI must gather or compare more information before selection.

Record:

- Gate status
- Selected option, or `None` when deferred or rejected
- Human selector and date
- Selection rationale
- Conditions or constraints attached to the selection
- Downstream artifacts authorized to use the selection

AI may recommend an option, but must not select on the human's behalf. If the Human Selection Gate is not recorded, the ADR remains `Proposed` or `Deferred`, and downstream design, code, dependency, deployment, or operations work must not assume the candidate is approved.

## ADR Entry Guidance

Each ADR entry should include:

- ADR ID and title
- Status
- Decision area
- Context
- Decision
- Human selection status
- Selected option
- Human selector and date
- Selection rationale
- Downstream authorization boundaries
- Rationale
- Alternatives considered
- Consequences
- Risks
- Reversibility
- Confidence
- Related Units, NFRs, risks, and design artifacts
- Follow-ups
- Approval record

Do not treat an ADR as approved until human approval is recorded.

## Outputs

- `docs/02-construction/02-design-plan/technology_decision_plan.md`
- `docs/02-construction/01-architecture/technology_decisions.md`

## Exit Criteria

- Decision scope and drivers are documented.
- Candidate options and defer/no-decision option are considered where reasonable.
- Trade-offs and rejected alternatives are documented.
- Security, privacy, compliance, operability, cost, and migration impacts are considered.
- Reversibility and confidence are recorded.
- Human selection gate outcome, selector/date, and rationale are recorded before ADR approval.
- ADR entries link to relevant Units, NFRs, risks, and design artifacts.
- Human approval is recorded before decisions become binding.
- Downstream authorization boundaries are documented for approved choices.
- Follow-ups for Logical Design, Code Generation, Deployment, or Operations are documented.

## Approval Gate

- Do not execute beyond planning until the human approves.
- Do not install dependencies, change runtime structure, update implementation, provision infrastructure, connect cloud services, or alter deployment configuration during technology decision work.
- Do not mark an ADR `Approved` until the Human Selection Gate records the human's selected, deferred, rejected, or more-analysis outcome.
- Do not treat AI recommendations, defaults, or non-binding logical-design mappings as human selection.
- Ask before making any technology choice binding.
- Ask before updating downstream design, implementation, deployment, or operations artifacts based on a selected or proposed decision.
- Execute one checkbox at a time.
- Mark each checkbox complete after finishing it.
- Do not rewrite previously approved or completed plans except for append-only addenda or explicitly approved follow-up plans.
- Treat prior approved plans as historical evidence, not current-state documents.
- During execution, update only checkbox status and append execution notes, verification results, blockers, or addendum references.
- Placeholder audits and cleanup passes must distinguish active project debt from historical approved plan records.
