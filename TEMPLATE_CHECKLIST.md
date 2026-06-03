# Template Checklist (After Cloning)

Use this checklist immediately after cloning the template.

---

## Project Identity

- [x] Replace project name and intent in active project identity files and generated project artifacts available at setup
- [x] Leave reusable `*_TEMPLATE.md` placeholders intact
- [x] Set repository name and default branch

## Process Setup

- [x] Read `AGENTS.md` and confirm plan-first workflow
- [x] Review skill pack in `docs/00-methodology/01-skills/`
- [x] Review template ownership rules in `docs/00-methodology/template_ownership.md`
- [x] Use `ai-dlc-setup` to create the initial setup plan in `docs/02-construction/02-design-plan/setup_plan.md`
- [x] Get approval before executing

## Documentation

- [ ] Update `README.md`
- [x] Preserve `README.md` during future template upgrades unless a human explicitly approves a project-specific edit
- [x] Update `PROJECT_STATUS.md`
- [x] Preserve existing `.gitignore`; apply `docs/00-methodology/gitignore_recommendations.md` entries only after approval
- [ ] Add a license file if required

## Code Skeleton

- [ ] Replace `src/placeholder_app.py` with real entry point
- [ ] Replace `tests/test_placeholder.py` with real tests
