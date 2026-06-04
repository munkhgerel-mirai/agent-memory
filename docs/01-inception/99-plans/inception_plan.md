# AI-DLC Inception Plan

**Project:** Agent-memory
**Date:** 2026-06-04
**Skill:** ai-dlc-inception
**Approval Status:** Pending human approval

---

## Context

Setup validation is complete and recorded in `docs/00-methodology/setup_validation.md`. The approved working intent is:

> It's agentic memory system for any LLM

This plan starts the AI-DLC Inception / Mob Elaboration phase. Inception will clarify the intent, identify stakeholders and outcomes, produce testable user stories, define measurable NFRs, and record risks before the project moves to Units.

---

## Inputs

- `PROJECT_STATUS.md`
- `docs/00-methodology/setup_validation.md`
- `docs/00-methodology/01-skills/ai-dlc-inception/SKILL.md`
- `docs/00-methodology/01-skills/ai-dlc-inception/references/nfr_catalog.md`
- Inception templates under `docs/01-inception/`
- Human answers to the Mob Elaboration questions collected during execution

---

## Approval Gate

Human approval of this plan is required before creating or editing the Inception output artifacts listed below.

Until approval is recorded, no requirements artifacts, user stories, NFRs, risk register entries, Units, domain design, code, or tests should be generated.

---

## Execution Checklist

- [ ] Record explicit approval to execute this Inception plan.
- [ ] Confirm the working intent and whether it should be reworded before artifact generation.
- [ ] Ask categorized Mob Elaboration questions covering users and stakeholders, business outcomes, scope and non-scope, workflows and edge cases, data and integrations, constraints and assumptions, and compliance or policy concerns.
- [ ] Document answers, assumptions, and open questions in `docs/01-inception/01-intent-clarification/intent_clarification.md`.
- [ ] Review the clarified intent with the human and record approval status or open corrections.
- [ ] Write prioritized user stories with business value, dependencies, assumptions, and testable acceptance criteria in `docs/01-inception/02-user-stories/all_user_stories.md`.
- [ ] Define NFRs in `docs/01-inception/03-nfrs/nfrs.md`, covering performance, reliability, usability, security, scalability, compliance, operability, maintainability, privacy, and cost.
- [ ] Mark any non-applicable or deferred NFR category with a rationale and human validation.
- [ ] Create `docs/01-inception/04-risks/risk_register.md` with technical, product/scope, security, compliance, operational, and delivery risks.
- [ ] Link stories, NFRs, and risks back to clarified intent, outcomes, assumptions, and open questions.
- [ ] Update `PROJECT_STATUS.md` with Inception progress and remaining blockers.
- [ ] Update the session log with skills used, decisions, completed artifacts, and next steps.
- [ ] Review generated artifacts and verification evidence before requesting approval to move to Units.

---

## Planned Outputs

- `docs/01-inception/01-intent-clarification/intent_clarification.md`
- `docs/01-inception/02-user-stories/all_user_stories.md`
- `docs/01-inception/03-nfrs/nfrs.md`
- `docs/01-inception/04-risks/risk_register.md`
- Updated `PROJECT_STATUS.md`
- Session log under `session-logs/`

---

## Initial Mob Elaboration Question Set

These questions will be asked after plan approval and answered before generating requirements artifacts.

### Users And Stakeholders

- Who are the primary users of Agent-memory: LLM application developers, autonomous agents, end users, operators, or another group?
- Which LLMs or agent runtimes must the system support first?
- Who approves memory writes, retention rules, and deletion behavior?

### Business Outcomes

- What outcome proves this memory system is useful: better task continuity, cross-session recall, lower prompt cost, user personalization, auditability, or something else?
- What is the first measurable success target for the project?
- Is this intended as a library, API service, local tool, hosted service, or embedded component?

### Scope And Non-Scope

- What memory types are in scope first: episodic session memory, semantic facts, preferences, task state, files/artifacts, vector embeddings, or audit logs?
- What should explicitly be out of scope for the first Unit?
- Should the project optimize for single-user local usage first or multi-tenant/team usage first?

### Workflows And Edge Cases

- What are the critical workflows: store memory, retrieve relevant memory, update memory, forget/delete memory, summarize memory, inspect provenance, or migrate memory?
- How should the system handle conflicting, stale, sensitive, or low-confidence memories?
- What should happen when retrieval returns irrelevant or unsafe context?

### Data And Integrations

- What storage backends are acceptable or preferred: files, SQLite/Postgres, document DB, vector DB, object storage, or pluggable adapters?
- Should memory retrieval use embeddings, keyword search, graph relationships, recency scoring, explicit tags, or a hybrid approach?
- What external integrations are expected: OpenAI API, local models, MCP tools, agent frameworks, IDE extensions, or browser automation?

### Constraints And Assumptions

- Are there language, runtime, deployment, cost, or offline-mode constraints?
- Does this need to work without network access?
- What is the expected data volume and retention horizon?

### Compliance Or Policy Concerns

- What personal, sensitive, or confidential data may enter memory?
- What retention, deletion, export, redaction, and audit requirements apply?
- Should the system prevent certain memory categories from being stored at all?

---

## Exit Criteria

- The working intent is clarified enough to decompose into Units.
- User stories are prioritized and include testable acceptance criteria.
- All NFR catalog categories are addressed, deferred with owner/reason, or marked `Not applicable` with human validation.
- Risks include mitigation ideas and ownership.
- Open questions are documented.
- Human approval is recorded before moving to `ai-dlc-units`.

---

## Known Constraints And Risks Before Execution

- `README.md` remains template-oriented and should be made project-specific before external use.
- `src/placeholder_app.py` and `tests/test_placeholder.py` remain template skeletons until an approved construction/code-generation plan replaces them.
- Technology choices are not yet approved; binding runtime, storage, embedding, or cloud decisions must go through the Human Selection Gate before downstream use.
