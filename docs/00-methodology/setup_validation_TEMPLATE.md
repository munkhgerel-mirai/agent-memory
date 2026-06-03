# Setup Validation - Template

**Project:** <PROJECT_NAME>
**Date:** <YYYY-MM-DD>
**Setup Mode:** <Initialize / Repair / Audit>

## Approval Status

<Pending review / Approved by <APPROVER> on <DATE> / Changes requested / Deferred>

## Project Identity

- **Project Name:** <PROJECT_NAME>
- **Draft Intent Status:** <Present / Missing / Needs clarification>
- **Project Identity Placeholders Remaining In Active Non-Template Artifacts:** <Yes / No>
- **Reusable Template Placeholders Preserved:** <Yes / No>

## Required Root Artifacts

| Artifact | Status | Notes |
|----------|--------|-------|
| `AGENTS.md` | <Present / Missing> | <NOTES> |
| `PROJECT_STATUS.md` | <Present / Missing> | <NOTES> |
| `README.md` | <Present / Missing> | <NOTES> |
| `ai-dlc-paper.md` | <Present / Missing> | <NOTES> |
| `session-logs/` | <Present / Missing> | <NOTES> |
| `src/` | <Present / Missing> | <NOTES> |
| `tests/` | <Present / Missing> | <NOTES> |

## Managed Template Metadata

| Artifact | Status | Notes |
|----------|--------|-------|
| `.ai-dlc-template.yml` | <Present / Missing / Not applicable> | <NOTES> |
| `.copier-answers.yml` | <Present / Missing / Not applicable> | <NOTES> |
| `docs/00-methodology/template_ownership.md` | <Present / Missing> | <NOTES> |
| `README.md` Template Upgrade And Adoption section | <Present / Missing> | <NOTES> |
| `docs/00-methodology/gitignore_recommendations.md` | <Present / Missing> | <NOTES> |

## Ownership Policy Validation

| File / Area | Ownership | Upgrade Behavior | Notes |
|-------------|-----------|------------------|-------|
| `README.md` | Project-owned | Preserve / do not overwrite | <NOTES> |
| `.gitignore` | Project-owned | Preserve / report recommendations only | <NOTES> |
| `AGENTS.md` | Manual-merge | Human review required | <NOTES> |
| `PROJECT_STATUS.md` | Project-owned | Preserve / do not overwrite | <NOTES> |
| `src/**` and `tests/**` | Project-owned | Preserve / do not overwrite | <NOTES> |

## Required Folders

| Folder | Status | Notes |
|--------|--------|-------|
| `docs/00-methodology/01-skills/` | <Present / Missing> | <NOTES> |
| `docs/01-inception/` | <Present / Missing> | <NOTES> |
| `docs/01-inception/01-intent-clarification/` | <Present / Missing> | <NOTES> |
| `docs/01-inception/02-user-stories/` | <Present / Missing> | <NOTES> |
| `docs/01-inception/03-nfrs/` | <Present / Missing> | <NOTES> |
| `docs/01-inception/04-risks/` | <Present / Missing> | <NOTES> |
| `docs/01-inception/05-units/` | <Present / Missing> | <NOTES> |
| `docs/01-inception/06-bolts/` | <Present / Missing> | <NOTES> |
| `docs/01-inception/99-plans/` | <Present / Missing> | <NOTES> |
| `docs/02-construction/` | <Present / Missing> | <NOTES> |
| `docs/02-construction/01-architecture/` | <Present / Missing> | <NOTES> |
| `docs/02-construction/02-design-plan/` | <Present / Missing> | <NOTES> |
| `docs/02-construction/03-domain-design/` | <Present / Missing> | <NOTES> |
| `docs/02-construction/04-code-generation/` | <Present / Missing> | <NOTES> |
| `docs/03-operations/` | <Present / Missing> | <NOTES> |
| `docs/03-operations/01-deployment/` | <Present / Missing> | <NOTES> |
| `docs/03-operations/02-observability/` | <Present / Missing> | <NOTES> |

## Skill Pack Validation

| Skill | `SKILL.md` Status | Notes |
|-------|-------------------|-------|
| `ai-dlc-setup` | <Present / Missing> | <NOTES> |
| `ai-dlc-inception` | <Present / Missing> | <NOTES> |
| `ai-dlc-units` | <Present / Missing> | <NOTES> |
| `ai-dlc-domain-design` | <Present / Missing> | <NOTES> |
| `ai-dlc-logical-design` | <Present / Missing> | <NOTES> |
| `ai-dlc-code-generation` | <Present / Missing> | <NOTES> |
| `ai-dlc-deployment` | <Present / Missing> | <NOTES> |
| `ai-dlc-operations-observability` | <Present / Missing> | <NOTES> |
| `ai-dlc-brownfield-discovery` | <Present / Missing> | <NOTES> |
| `ai-dlc-technology-decision` | <Present / Missing> | <NOTES> |

## Template File Validation

Validate expected active reusable templates.

| Template | Status | Notes |
|----------|--------|-------|
| `docs/00-methodology/methodology_notes_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/00-methodology/setup_validation_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/01-inception/01-intent-clarification/intent_clarification_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/01-inception/02-user-stories/user_stories_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/01-inception/03-nfrs/nfrs_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/01-inception/04-risks/risk_register_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/01-inception/05-units/units_composition_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/01-inception/06-bolts/bolts_plan_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/02-construction/01-architecture/brownfield_discovery_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/02-construction/01-architecture/system_architecture_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/02-construction/01-architecture/technology_decisions_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/02-construction/02-design-plan/design_plan_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/02-construction/03-domain-design/domain_design_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/02-construction/03-domain-design/logical_design_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/02-construction/04-code-generation/code_generation_report_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/02-construction/04-code-generation/test_results_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/03-operations/01-deployment/deployment_plan_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/03-operations/01-deployment/deployment_guide_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/03-operations/01-deployment/rollback_plan_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/03-operations/02-observability/observability_plan_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/03-operations/02-observability/logging_guide_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/03-operations/02-observability/metrics_guide_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/03-operations/02-observability/alerting_guide_TEMPLATE.md` | <Present / Missing> | <NOTES> |
| `docs/03-operations/02-observability/runbooks_TEMPLATE.md` | <Present / Missing> | <NOTES> |

## Placeholder Audit

Audit active project identity and generated artifacts. Classify each finding so current-state debt is not mixed with reusable templates or historical records.

Classify findings as:

- `Active project identity issue` - a placeholder in a current project-specific artifact that should usually be replaced or explicitly deferred.
- `Reusable template placeholder` - an intentional placeholder in a reusable `*_TEMPLATE.md` file.
- `Skill/example placeholder` - an intentional placeholder in skill instructions, prompts, examples, or copy/paste guidance.
- `Historical approved plan record` - a placeholder or obsolete assumption preserved inside a previously approved plan or completed execution record.

Historical approved plan records are not blockers by default. If a prior approved plan needs correction, create an explicitly approved addendum or follow-up plan instead of rewriting the original record.

Reusable `*_TEMPLATE.md` files may intentionally retain placeholders.

| Finding | Classification | Blocker? | Replace / Defer / Preserve | Notes |
|---------|----------------|----------|----------------------------|-------|
| <PLACEHOLDER_OR_FILE> | <Active project identity issue / Reusable template placeholder / Skill/example placeholder / Historical approved plan record> | <Yes / No> | <Replace / Defer / Preserve> | <NOTES> |

| Placeholder | Replace / Defer | Notes |
|-------------|-----------------|-------|
| `<PROJECT_NAME>` | <Replace / Defer> | <NOTES> |
| `<INTENT>` | <Replace / Defer> | <NOTES> |
| `<UNIT_NAME>` | <Replace / Defer> | <NOTES> |
| `<DOMAIN_ENTITY>` | <Replace / Defer> | <NOTES> |

## Git Readiness

- **Git Available:** <Yes / No>
- **Baseline Status:** <SUMMARY_OR_NOT_AVAILABLE>
- **Recent Context:** <SUMMARY_OR_NOT_AVAILABLE>

## Repair Actions Taken

- <ACTION_OR_NONE>

## Blockers And Open Questions

| ID | Blocker / Question | Owner | Needed By |
|----|--------------------|-------|-----------|
| OQ-001 | <BLOCKER_OR_QUESTION> | <OWNER> | <DATE_OR_PHASE> |
