---
name: ai-dlc-inception
description: Use when running the AI-DLC Inception / Mob Elaboration ritual to clarify intent and produce quality-gated, traceable intent clarification, user stories, NFRs, and risks with human approval.
---

# AI-DLC Inception

Use this skill to run the AI-DLC Inception phase. Inception uses the Mob Elaboration ritual, a collaborative requirements clarification session where AI proposes artifacts and humans validate them.

## Inputs / Preconditions

- Project goal or draft intent
- Known stakeholders or users, if available
- Existing constraints, assumptions, or source documents, if available
- Approval to begin Inception planning

## Workflow

1. Confirm inputs and the draft working intent.
2. Create a checkbox plan in `docs/01-inception/99-plans/inception_plan.md`.
3. Request explicit human approval before execution.
4. Ask categorized clarifying questions covering users and stakeholders, business outcomes, scope and non-scope, workflows and edge cases, data and integrations, constraints and assumptions, and compliance or policy concerns.
5. Document answers, assumptions, and open questions in `docs/01-inception/01-intent-clarification/intent_clarification.md`.
6. Write prioritized user stories with testable acceptance criteria in `docs/01-inception/02-user-stories/all_user_stories.md`.
7. Define measurable NFRs in `docs/01-inception/03-nfrs/nfrs.md`, considering the categories in `docs/00-methodology/01-skills/ai-dlc-inception/references/nfr_catalog.md`: performance, reliability, usability, security, scalability, compliance, operability, maintainability, privacy, and cost. Mark non-applicable categories as `Not applicable` with a short reason and human validation.
8. Create a categorized risk register with mitigation ideas in `docs/01-inception/04-risks/risk_register.md`.
9. Link stories, NFRs, and risks back to the clarified intent and major assumptions.
10. Confirm exit criteria and request human approval before moving to Units.

## Quality Guidance

Each user story should include:

- Story ID
- Priority: `Must`, `Should`, or `Nice`
- User role
- Goal
- Business value
- Acceptance criteria
- Dependencies or assumptions

Acceptance criteria should be testable and written in `Given / When / Then` format where useful.

For each applicable NFR, include:

- Category
- Requirement
- Target measure
- Rationale
- Verification method

Use the NFR catalog to ask category-specific questions. Do not drop operability, maintainability, privacy, or cost without recording why they are not applicable or deferred.

Classify risks as:

- Technical
- Product / scope
- Security
- Compliance
- Operational
- Delivery

## Outputs

- `docs/01-inception/99-plans/inception_plan.md`
- `docs/01-inception/01-intent-clarification/intent_clarification.md`
- `docs/01-inception/02-user-stories/all_user_stories.md`
- `docs/01-inception/03-nfrs/nfrs.md`
- `docs/01-inception/04-risks/risk_register.md`

## Exit Criteria

- Intent is clarified enough to decompose into Units.
- User stories have priorities and acceptance criteria.
- NFR catalog categories are addressed, deferred with owner/reason, or marked `Not applicable` with human validation.
- Risks include mitigation ideas.
- Open questions are documented.
- Human approval is recorded before moving to Units.

## Approval Gate

- Do not execute beyond planning until the human approves.
- Ask before making critical decisions.
- Execute one checkbox at a time.
- Mark each checkbox complete after finishing it.
- Do not rewrite previously approved or completed plans except for append-only addenda or explicitly approved follow-up plans.
- Treat prior approved plans as historical evidence, not current-state documents.
- During execution, update only checkbox status and append execution notes, verification results, blockers, or addendum references.
- Placeholder audits and cleanup passes must distinguish active project debt from historical approved plan records.
