# Observability Plan - Template

**Project:** <PROJECT_NAME>
**Date:** <YYYY-MM-DD>
**Scope:** <OBSERVABILITY_SCOPE>

## Approval Status

<Pending approval / Approved by <APPROVER> on <DATE> / Blocked>

## Approved Inputs

- **Logical Design:** <LOGICAL_DESIGN_DOC>
- **Deployment Guide:** <DEPLOYMENT_GUIDE>
- **Rollback Plan:** <ROLLBACK_PLAN>
- **Related NFRs:** <NFR_IDS>
- **Related Risks:** <RISK_IDS>

## Execution Plan

- [ ] Define observability goals tied to user outcomes, NFRs, and operational risks.
- [ ] Define logging strategy and produce `logging_guide.md` using `logging_guide_TEMPLATE.md`.
- [ ] Define metrics, SLI/SLO, dashboard, tracing, and health-check strategy.
- [ ] Produce `metrics_guide.md` using `metrics_guide_TEMPLATE.md`.
- [ ] Define alerting strategy and escalation paths.
- [ ] Produce `alerting_guide.md` using `alerting_guide_TEMPLATE.md`.
- [ ] Define incident response runbooks.
- [ ] Define maintenance runbooks.
- [ ] Produce `runbooks.md` using `runbooks_TEMPLATE.md`.
- [ ] Define validation drills: smoke checks, synthetic checks, alert tests, dashboard review, and rollback/restore drills.
- [ ] Define retention, compliance, privacy, and cost considerations.
- [ ] Record open questions and decisions requiring human approval.

## Clarifications Needed

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| Q-001 | <QUESTION> | <OWNER> | <Open / Answered / Deferred> |

## Open Questions And Approvals

- <OPEN_QUESTION_OR_APPROVAL>

## Execution Notes

- Do not execute beyond this plan until the human approves.
- Execute one checkbox at a time.
- Mark each checkbox complete after finishing it.
- Do not connect to production systems or change monitoring/alerting configuration unless explicitly approved.
