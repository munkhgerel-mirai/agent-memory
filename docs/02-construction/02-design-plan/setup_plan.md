# AI-DLC Setup Plan

**Project:** Agent-memory
**Date:** 2026-06-03
**Setup Mode:** Audit
**Approval Status:** Pending human approval

---

## Context

`ai-dlc-setup` is not installed as a shell command in this workspace. The setup request is therefore being handled through the repository-local workflow skill at `docs/00-methodology/01-skills/ai-dlc-setup/SKILL.md`.

Project identity metadata is present in `.ai-dlc-template.yml` and `.copier-answers.yml`:

- **Project Name:** Agent-memory
- **Draft Intent:** It's agentic memory system for any LLM
- **Template Version:** v0.2.1
- **Template Commit:** unknown

`PROJECT_STATUS.md` is still in the template-start state: `SETUP` / `NOT STARTED`. No active prior session log exists; `session-logs/` contains only its README.

---

## Pre-Approval Findings

- Required root artifacts appear present: `AGENTS.md`, `PROJECT_STATUS.md`, `README.md`, `ai-dlc-paper.md`, `session-logs/`, `src/`, and `tests/`.
- Required AI-DLC phase folders appear present under `docs/00-methodology/`, `docs/01-inception/`, `docs/02-construction/`, and `docs/03-operations/`.
- The expected AI-DLC skill pack folders and `SKILL.md` files appear present.
- Active `_TEMPLATE.md` files appear present across methodology, inception, construction, and operations folders.
- Unresolved active project identity placeholders remain in `AGENTS.md`, `PROJECT_STATUS.md`, and `TEMPLATE_CHECKLIST.md`.
- Reusable lifecycle templates intentionally retain placeholders such as `<PROJECT_NAME>`, `<INTENT>`, `<UNIT_NAME>`, `<DOMAIN_ENTITY>`, `<YYYY-MM-DD>`, and table examples.
- Git is available, the working tree was clean before this plan, and the recent history contains `2427e7b initial commit`.

---

## Approval Gate

Human approval of this plan is required before executing setup changes, including placeholder replacement, setup validation report creation, `PROJECT_STATUS.md` updates, or other repair actions.

---

## Execution Checklist

- [ ] Record explicit approval to execute this setup plan.
- [ ] Confirm setup mode remains `audit` or document any human-approved change to `initialize` or `repair`.
- [ ] Confirm project name and draft intent from `.ai-dlc-template.yml` and `.copier-answers.yml`.
- [ ] Validate required root artifacts and document present or missing status.
- [ ] Validate required AI-DLC phase folders and document present or missing status.
- [ ] Validate expected AI-DLC skill pack files.
- [ ] Validate expected active reusable `_TEMPLATE.md` files.
- [ ] Audit unresolved placeholders and classify each as active project identity debt, reusable template placeholder, skill/example placeholder, or historical record.
- [ ] Decide which active project identity placeholders should be replaced now and which should be deferred.
- [ ] Check git readiness with `git status --short` and `git log --oneline -10`.
- [ ] Create `docs/00-methodology/setup_validation.md` from `docs/00-methodology/setup_validation_TEMPLATE.md`.
- [ ] Update `PROJECT_STATUS.md` to reflect setup validation state and remaining blockers.
- [ ] Write or update a session log under `session-logs/` with `Skills Used`.
- [ ] Review the resulting diff and verification evidence before requesting inception approval.

---

## Planned Outputs

- `docs/00-methodology/setup_validation.md`
- Updated `PROJECT_STATUS.md`
- Session log in `session-logs/`

---

## Open Questions

- Should active project identity placeholders be replaced with `Agent-memory` and `It's agentic memory system for any LLM` during setup execution?
- Should setup remain audit-only, or should approved execution include repair of active project-owned placeholders?
