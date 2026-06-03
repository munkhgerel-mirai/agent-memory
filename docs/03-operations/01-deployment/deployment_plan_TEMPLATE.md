# Deployment Plan - Template

**Project:** <PROJECT_NAME>
**Date:** <YYYY-MM-DD>
**Scope:** <DEPLOYMENT_SCOPE>

## Approval Status

<Pending approval / Approved by <APPROVER> on <DATE> / Blocked>

## Approved Inputs

- **Logical Design:** <LOGICAL_DESIGN_DOC>
- **Code Generation Report:** <CODE_GENERATION_REPORT>
- **Test Results:** <TEST_RESULTS>
- **Related NFRs:** <NFR_IDS>
- **Related Risks:** <RISK_IDS>

## Execution Plan

- [ ] Define deployment units and release scope.
- [ ] Define deployment targets and environments.
- [ ] Define promotion path and approval gates.
- [ ] Define packaging and reproducible build instructions.
- [ ] Define configuration management.
- [ ] Define secrets management separately from configuration.
- [ ] Define infrastructure assumptions and provisioning boundaries.
- [ ] Create pre-deployment readiness checklist.
- [ ] Create post-deployment smoke and health checks.
- [ ] Tie release risks to NFRs and risk register entries.
- [ ] Define rollback and rollforward strategy.
- [ ] Produce `deployment_guide.md` using `deployment_guide_TEMPLATE.md`.
- [ ] Produce `rollback_plan.md` using `rollback_plan_TEMPLATE.md`.
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
- Do not deploy to any environment unless explicitly approved.
