---
name: ai-dlc-setup
description: Use when initializing, repairing, or auditing AI-DLC project readiness, including required folders, root artifacts, skill pack setup, placeholders, lifecycle status, git readiness, and approval rules.
---

# AI-DLC Setup

Use this skill to initialize, repair, or audit an AI-DLC project structure.

## Inputs / Preconditions

- Project name
- Draft intent
- Setup mode: `initialize`, `repair`, or `audit`
- Existing repository or template state
- Approval to begin setup planning

## Workflow

1. Confirm setup mode: `initialize`, `repair`, or `audit`.
2. Confirm project name, draft intent, and unresolved placeholders.
3. Create a checkbox setup plan in `docs/02-construction/02-design-plan/setup_plan.md`.
4. Request explicit human approval before execution.
5. Validate required root artifacts:

- `AGENTS.md`
- `PROJECT_STATUS.md`
- `README.md`
- `ai-dlc-paper.md`
- `session-logs/`
- `src/`
- `tests/`

6. Check or create required AI-DLC folders:

- `/docs/00-methodology/01-skills/`
- `/docs/01-inception/`
  - `01-intent-clarification/`
  - `02-user-stories/`
  - `03-nfrs/`
  - `04-risks/`
  - `05-units/`
  - `06-bolts/`
  - `99-plans/`
- `/docs/02-construction/`
  - `01-architecture/`
  - `02-design-plan/`
  - `03-domain-design/`
  - `04-code-generation/`
- `/docs/03-operations/`
  - `01-deployment/`
  - `02-observability/`

7. Validate the skill pack and confirm expected skill files exist.
8. Validate expected active reusable `_TEMPLATE.md` files. Legacy prompt files are historical and should not satisfy active template validation.
9. Audit unresolved placeholders such as `<PROJECT_NAME>`, `<INTENT>`, `<UNIT_NAME>`, and `<DOMAIN_ENTITY>`; document whether to replace or defer them.
10. Check git readiness with `git status` and `git log --oneline -10` when available. If the directory is not a git repository, document it as a setup note or blocker.
11. Create or update `docs/00-methodology/setup_validation.md` using `docs/00-methodology/setup_validation_TEMPLATE.md` when starting from the template.
12. Confirm plan-first, approval-gated execution rules.
13. Update `PROJECT_STATUS.md`.
14. Write a session log in `session-logs/` at the end of the session.

## Quality Guidance

The setup validation report should include:

- Setup mode
- Project name and draft intent status
- Required folders present or missing
- Required root artifacts present or missing
- Skill pack files present or missing
- Expected active template files present or missing
- Session logging rule status
- Placeholders found and replacement/defer decisions
- Git readiness result
- Repair actions taken
- Blockers and open questions

## Outputs

- Required `docs/` phase folders
- `docs/00-methodology/setup_validation.md`
- Updated `PROJECT_STATUS.md`
- Session log in `session-logs/`

## Exit Criteria

- Required folders exist or missing items are documented.
- Required root artifacts exist or gaps are documented.
- Expected skill files exist.
- Expected active template files exist or gaps are documented.
- `PROJECT_STATUS.md` reflects the current setup state.
- Placeholder audit is complete.
- Git readiness is checked or documented as unavailable.
- Session log is written and includes `Skills Used` when a skill was used.
- Human approval is recorded before moving to Inception.

## Approval Gate

- Always create a checkbox plan before execution.
- Do not execute setup changes until a human explicitly approves the plan.
- Execute one checkbox at a time.
- Mark each plan checkbox complete after finishing it.
- Store outputs under the correct `docs/` phase folder.
- Do not rewrite previously approved or completed plans except for append-only addenda or explicitly approved follow-up plans.
- Treat prior approved plans as historical evidence, not current-state documents.
- During execution, update only checkbox status and append execution notes, verification results, blockers, or addendum references.
- Placeholder audits and cleanup passes must distinguish active project debt from historical approved plan records.
