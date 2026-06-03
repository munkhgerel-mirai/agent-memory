# <PROJECT_NAME> - AI-DLC Agent Guide

## Purpose

This file defines how AI agents and humans collaborate on this project using the **AI-Driven Development Lifecycle (AI-DLC)**.

---

## Core Rules (Non-Negotiable)

1. **Plan First**
   - Always create a written plan with checkboxes before doing work.
   - Plans must be stored in the correct phase folder (see below).

2. **Approval Gate**
   - Do not execute work until a human explicitly approves the plan.
   - If approval is not granted, stop and wait.

3. **Step-by-Step Execution**
   - Execute one checkbox at a time.
   - Mark each checkbox as complete when done.

4. **Artifact Discipline**
   - All documentation and lifecycle artifacts must be stored under `docs/` in the correct phase folder.
   - Implementation code and tests must be stored in the approved source and test folders, such as `src/` and `tests/`, or another human-approved runtime structure.
   - Do not move or rename existing documentation, code, test, or lifecycle artifacts without explicit approval.

5. **No Silent Decisions**
   - If requirements are unclear, ask clarifying questions and document answers.

6. **Approved Plan Integrity**
   - Once a plan is approved and execution has started, its original context, decisions, scope, and approval rationale are historical record and must not be semantically rewritten.
   - During execution, update only checkbox status and append execution notes, verification results, blockers, or addendum references.
   - After completion, treat the plan as a decision record, not a current-state document.
   - Later workflows must not edit prior approved plans to match new project state. Record current state in `PROJECT_STATUS.md`, setup validation, the current plan, or session logs.
   - If a prior approved plan needs correction, create an explicitly approved addendum or follow-up plan and link it from the original plan.

---

## Where Plans Live

- Inception: `docs/01-inception/99-plans/`
- Construction and setup: `docs/02-construction/02-design-plan/`
- Operations: `docs/03-operations/01-deployment/` or `docs/03-operations/02-observability/`

---

## Session Start Checklist (Do Every Session)

1. Read `ai-dlc-paper.md`
2. Read `PROJECT_STATUS.md`
3. Read the latest session log in `session-logs/`
4. Review the latest artifacts in the active phase folder
5. Choose the most appropriate skill from `docs/00-methodology/01-skills/`
6. Create a plan with checkboxes and request approval

These steps are mandatory and should be performed automatically at the start of every session.

If no working session log exists in `session-logs/`, document that in the new plan or session log and continue.

Always choose the most appropriate skill from `docs/00-methodology/01-skills/` for the current situation; do not invent a new workflow unless a skill is missing.

Whenever a skill is used, record it in the current `session-logs/` entry under `Skills Used` with the date and a short label.

---

## Session End Checklist (Do Every Session)

1. Update all necessary documents and `PROJECT_STATUS.md`
2. Write a session log in `session-logs/`

These steps are mandatory and should be performed automatically at the end of every session.

---

## Session Logs

Maintain a session log at the end of each working session.

- **Location:** `session-logs/`
- **Filename format:** `YYYYMMDD_HHMM_agent-name_short-summary.md`
- **Example:** `20260201_0930_codex_inception-plan.md`
- **Required contents:**
  - Duration
  - Skills Used, when applicable
  - Summary of work completed
  - Decisions made
  - Next steps

On fresh clones, `session-logs/` may contain only this README. In that case, record "no prior active session log" in the next plan or session log and proceed with the rest of the session-start checklist.


---

## Placeholders

Replace any placeholders such as:
- `<PROJECT_NAME>`
- `<INTENT>`
- `<UNIT_NAME>`
- `<DOMAIN_ENTITY>`

---

## Minimal Code

This template includes only placeholders in `src/` and `tests/`. Do not treat them as production code.

---

## Git Usage (Clear and Deliberate)

Use git to keep changes small, reviewable, and traceable when the project clone is a git repository. If `.git/` is unavailable, document git as unavailable in the plan or session log and continue without blocking the work.

**Before starting work, when git is available:**
1. `git status` to confirm a clean baseline
2. `git log --oneline -10` to understand recent context

**During work:**
- Use `git add <files>` to stage only the files for the current logical unit
- Commit after completing a logical unit (plan step, artifact set, or feature slice)
- Avoid mixing unrelated changes in a single commit
- Prefer descriptive, concise commit messages

**After each logical unit, when git is available (recommended):**
1. `git add <files>` (stage only the relevant changes)
2. `git commit -m "docs: <summary>"` (or other appropriate type)

**Pushing, when git remote access is available:**
- Push after a meaningful milestone or at least once per session
- Always push after updating session logs and `PROJECT_STATUS.md`
```
git push
```

**Before ending a session, when git is available:**
1. `git status` to review changes
2. Ensure documentation and `PROJECT_STATUS.md` are updated
3. Create the session log, then commit it
4. Push commits to the remote

**Commit message format (suggested):**
```
<type>: <short summary>

- key changes (if needed)
```

**Common types:** `docs`, `feat`, `fix`, `refactor`, `test`, `chore`

**Attribution (commits + code comments):**
- Commits must clearly state who performed the work: **agent** or **developer** name.
- If git author is not the human, add a footer line in the commit message:
  - `Authored-By: <name>` (agent or developer)
- If you leave a code comment for future context, tag it with the author name:
  - Example: `# Note (codex): rationale here`
