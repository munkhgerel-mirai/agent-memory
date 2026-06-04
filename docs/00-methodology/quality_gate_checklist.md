# AI-DLC Quality Gate Checklist

Use this reference to review AI-DLC artifacts before approving the next phase.

## Universal Gates

Every artifact should satisfy these gates:

- [ ] Stored in the correct folder.
- [ ] Linked to the relevant plan.
- [ ] Created after human approval of the plan.
- [ ] Uses the applicable template when starting from the template.
- [ ] States assumptions, open questions, and decisions.
- [ ] Links to upstream artifacts where relevant.
- [ ] Records `Approval Status`, or is explicitly named as approved in the governing plan before downstream use.
- [ ] Avoids unresolved placeholders except in reusable `*_TEMPLATE.md` files.
- [ ] Does not introduce unapproved technology, dependency, infrastructure, data, or security decisions.
- [ ] Previously approved plans were not semantically rewritten by later workflows.
- [ ] Any correction to a completed plan was recorded as an addendum or follow-up plan.

## Setup Validation

- [ ] Project name, draft intent status, and setup mode are recorded.
- [ ] Required root artifacts are present or gaps are documented.
- [ ] Required `docs/` phase folders and subfolders are present or gaps are documented.
- [ ] Expected skill files are present or gaps are documented.
- [ ] Expected active `_TEMPLATE.md` files are present or gaps are documented.
- [ ] Placeholder audit distinguishes active project identity issues, reusable template placeholders, skill/example placeholders, historical approved plan records, and legacy/reference placeholders.
- [ ] Historical approved plan records are not treated as blockers unless an explicitly approved addendum or follow-up plan is needed.
- [ ] Git readiness is checked or documented as unavailable.
- [ ] Blockers and open questions have owners.

## Intent Clarification

- [ ] Working intent is clear enough to decompose into user stories.
- [ ] Stakeholders and users are identified or marked unknown.
- [ ] Business outcomes have success measures.
- [ ] Scope and out-of-scope items are explicit.
- [ ] Workflows, edge cases, data, integrations, constraints, and assumptions are captured.
- [ ] Compliance or policy concerns are addressed or marked not applicable.
- [ ] Open questions have owners and needed-by dates or phases.

## User Stories

- [ ] Each story has a stable Story ID.
- [ ] Each story has priority: `Must`, `Should`, or `Nice`.
- [ ] Each story identifies user role, goal, and business value.
- [ ] Acceptance criteria are testable.
- [ ] Acceptance criteria use `Given / When / Then` where useful.
- [ ] Dependencies and assumptions are documented.
- [ ] No `Must` story is vague or untestable.
- [ ] Stories link back to intent or business outcomes.

## NFRs

- [ ] Performance, reliability, usability, security, scalability, compliance, operability, maintainability, privacy, and cost are addressed.
- [ ] Non-applicable categories are marked `Not applicable` with a reason.
- [ ] Deferred categories have an owner, reason, and needed-by phase.
- [ ] Each applicable NFR has a measurable target.
- [ ] Each applicable NFR has rationale and verification method.
- [ ] NFRs avoid vague words such as "fast", "secure", or "scalable" without a target.
- [ ] NFRs are linked to user outcomes, risks, or operational constraints.

## Risk Register

- [ ] Risks are categorized consistently.
- [ ] Likelihood and impact are assigned.
- [ ] Mitigations are concrete enough to execute or track.
- [ ] Triggers/signals are observable where possible.
- [ ] Owners and statuses are recorded.
- [ ] Security, compliance, operational, data, delivery, and product/scope risks are considered.

## Units

- [ ] Every `Must` story is assigned to a Unit.
- [ ] No story is orphaned.
- [ ] Duplicated stories are explained.
- [ ] Each Unit represents one clear business capability or outcome.
- [ ] Unit boundaries are cohesive and loosely coupled.
- [ ] Dependencies and integration points are classified.
- [ ] NFR and risk impacts are considered.
- [ ] Open questions are documented before moving to Domain Design.

## Bolts

- [ ] Each Bolt maps to a Unit.
- [ ] Each Bolt is small enough for hours/days execution.
- [ ] Included stories and expected outputs are explicit.
- [ ] Dependencies are documented.
- [ ] Validation method is clear.
- [ ] Parallel or sequential status is justified.

## Brownfield Discovery

- [ ] Discovery scope and target areas are documented.
- [ ] Repository structure and key runtime/tooling are documented.
- [ ] Entry points and major components are identified.
- [ ] Dependency direction and integration points are documented.
- [ ] Domain concepts and workflows are captured from code or docs.
- [ ] Data stores and external systems are identified or marked unknown.
- [ ] Tests and verification commands are documented.
- [ ] Findings are classified as confirmed, inferred, assumption, unknown, or blocker.
- [ ] No source, test, dependency, configuration, generated file, or runtime structure changes were made during discovery.

## Domain Design

- [ ] Domain design is technology-agnostic.
- [ ] Unit summary and linked user stories are present.
- [ ] Ubiquitous language is defined.
- [ ] Aggregates have clear consistency boundaries.
- [ ] Invariants are explicit and testable.
- [ ] Entities have stable identities.
- [ ] Value objects are immutable and value-based.
- [ ] Domain events are named as past-tense facts.
- [ ] Repository interfaces are intent-based and implementation-free.
- [ ] Domain services are justified and do not become generic transaction scripts.

## Logical Design

- [ ] Approved domain design is referenced.
- [ ] NFR traceability matrix maps NFRs to decisions and trade-offs.
- [ ] Component boundaries and dependency direction are clear.
- [ ] Integration contracts include error handling.
- [ ] Non-binding technology mapping states confidence, risks, and reversibility.
- [ ] Data flow is documented.
- [ ] Failure modes include timeouts, retries, idempotency, partial failure, and backpressure where applicable.
- [ ] Security and privacy concerns are addressed.
- [ ] ADR-lite decisions include context, decision, rationale, alternatives, and consequences.

## Technology Decisions

- [ ] Decision scope and drivers are documented.
- [ ] Candidate options and defer/no-decision option are considered where reasonable.
- [ ] Trade-offs and rejected alternatives are documented.
- [ ] Security, privacy, compliance, operability, cost, and migration impacts are considered.
- [ ] Reversibility and confidence are recorded.
- [ ] ADR entries link to relevant Units, NFRs, risks, and design artifacts.
- [ ] Decisions remain `Proposed` until human selection and approval are both recorded.
- [ ] Human Selection Gate outcome, selector/date, and rationale are recorded before an ADR is marked `Approved`.
- [ ] AI recommendations, defaults, or non-binding logical-design mappings are not treated as human-selected technology choices.
- [ ] Downstream authorization is recorded before Logical Design, Code Generation, Deployment, Operations, dependencies, runtime structure, or infrastructure use the selected technology.
- [ ] Follow-ups for Logical Design, Code Generation, Deployment, or Operations are documented.
- [ ] No dependencies, runtime structure, infrastructure, implementation, or deployment changes are made during decision work.

## Code Generation

- [ ] Implementation tasks map to Units, stories, acceptance criteria, domain elements, logical decisions, NFRs, or risks.
- [ ] Code is placed in `src/` or an approved runtime folder.
- [ ] Tests are placed in `src/tests/` or an approved test folder.
- [ ] New dependencies, frameworks, database choices, cloud SDKs, infrastructure tools, runtime platforms, or runtime structure changes have an `Approved` ADR with a recorded Human Selection Gate in `technology_decisions.md`, or the code-generation plan records the same human selection fields and explicit approval.
- [ ] Non-binding Logical Design technology mapping is not treated as implementation approval.
- [ ] Deviations from approved design are documented.
- [ ] Available checks are run or documented as unavailable.
- [ ] Failed checks are documented before proposing fixes.

## Deployment

- [ ] Deployment units, owners, versions, and release scope are documented.
- [ ] Environments and promotion path are defined.
- [ ] Build and packaging instructions are reproducible.
- [ ] Configuration and secrets management are separate.
- [ ] Infrastructure assumptions are explicit.
- [ ] Pre-deployment and post-deployment checks are defined.
- [ ] Release risks link to NFRs and risk register entries.
- [ ] Rollback and rollforward triggers, steps, owners, and data considerations are documented.

## Observability And Operations

- [ ] Observability goals link to user outcomes, NFRs, and risks.
- [ ] Logging strategy includes structure, levels, correlation IDs, audit logs, redaction, storage, retention, rotation, and sampling.
- [ ] Metrics strategy includes SLIs, SLOs, dashboards, owners, and review cadence.
- [ ] Tracing strategy covers key journeys, service boundaries, external calls, and latency/error investigation.
- [ ] Health checks cover startup, readiness, liveness, dependency, and synthetic checks where applicable.
- [ ] Alerts include severity, thresholds, duration, owners, escalation paths, runbook links, and false-positive controls.
- [ ] Runbooks cover detect, triage, mitigate, communicate, recover, and post-incident review.
- [ ] Validation drills are documented.
- [ ] Retention, compliance, privacy, and cost considerations are addressed.
