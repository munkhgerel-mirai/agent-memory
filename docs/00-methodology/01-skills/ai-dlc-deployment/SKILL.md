---
name: ai-dlc-deployment
description: Use when creating deployment units, environment strategy, packaging instructions, configuration and secrets approach, release verification, rollback/rollforward plans, and deployment readiness artifacts.
---

# AI-DLC Deployment

Use this skill to prepare deployment units and release readiness artifacts from approved implementation and verification outputs.

## Workflow

1. Confirm approved inputs exist: logical design, code generation report, test results, NFRs, and risk register.
2. Create a checkbox plan in `docs/03-operations/01-deployment/deployment_plan.md`.
3. Request explicit human approval before execution.
4. Define deployment units: artifact type, owner, versioning, naming, and release scope.
5. Define deployment targets and environments, including local/dev/staging/prod where applicable.
6. Define promotion path and approval gates between environments.
7. Create packaging/build instructions, including reproducible build commands and artifact outputs.
8. Define configuration management approach for environment-specific settings.
9. Define secrets management approach separately from configuration.
10. Define infrastructure assumptions and any required provisioning boundaries.
11. Create pre-deployment readiness checklist.
12. Create post-deployment verification checks, including smoke tests and health checks.
13. Create release risk checklist tied to NFRs and risk register.
14. Define rollback and rollforward strategy, including triggers, steps, data considerations, and owner.
15. Produce deployment guide and rollback plan using the deployment and rollback templates when starting from the template.
16. Record open questions and decisions requiring human approval.

## Outputs

- `docs/03-operations/01-deployment/deployment_plan.md`
- `docs/03-operations/01-deployment/deployment_guide.md`
- `docs/03-operations/01-deployment/rollback_plan.md`

Each deployment guide should include:

- Deployment units
- Environments and promotion path
- Build/package instructions
- Configuration management
- Secrets management
- Infrastructure assumptions
- Pre-deployment checklist
- Post-deployment verification
- Release risk checklist
- Rollback/rollforward summary
- Open questions and approvals

## Approval Gate

- Do not execute beyond planning until the human approves.
- Ask before making critical deployment, environment, infrastructure, production, secrets, or migration decisions.
- Do not deploy to any environment unless explicitly approved.
- Execute one checkbox at a time.
- Mark each checkbox complete after finishing it.
- Do not rewrite previously approved or completed plans except for append-only addenda or explicitly approved follow-up plans.
- Treat prior approved plans as historical evidence, not current-state documents.
- During execution, update only checkbox status and append execution notes, verification results, blockers, or addendum references.
- Placeholder audits and cleanup passes must distinguish active project debt from historical approved plan records.
