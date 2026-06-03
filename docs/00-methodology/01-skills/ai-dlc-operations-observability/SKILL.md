---
name: ai-dlc-operations-observability
description: Use when defining operational readiness, observability goals, logging, metrics, traces, alerts, dashboards, incident runbooks, and validation drills for an AI-DLC system.
---

# AI-DLC Operations Observability

Use this skill to define observability and operational readiness artifacts for an AI-DLC system.

## Workflow

1. Confirm approved inputs exist: logical design, deployment guide, rollback plan, NFRs, and risk register.
2. Create a checkbox plan in `docs/03-operations/02-observability/observability_plan.md`.
3. Request explicit human approval before execution.
4. Define observability goals tied to user outcomes, NFRs, and operational risks.
5. Define logging strategy: structured logs, levels, correlation IDs, audit logs, PII/secrets redaction, storage, retention, rotation, and sampling.
6. Define metrics strategy: SLIs, SLOs, SLA notes if applicable, dashboards, owners, and review cadence.
7. Define tracing strategy for key user journeys, service boundaries, external calls, and latency/error investigation.
8. Define health checks: startup, readiness, liveness, dependency checks, and synthetic checks where applicable.
9. Define alerting strategy: severity, thresholds, duration, owners, escalation paths, runbook links, and false-positive controls.
10. Define incident response runbooks covering detect, triage, mitigate, communicate, recover, and post-incident review.
11. Define maintenance runbooks for routine operations, backups, restores, scaling, and dependency updates where applicable.
12. Define observability validation: smoke checks, synthetic checks, alert tests, dashboard review, and rollback/restore drills.
13. Define retention, compliance, privacy, and cost considerations for logs, metrics, and traces.
14. Record open questions and decisions requiring human approval, using the observability guide templates when starting from the template.

## Outputs

- `docs/03-operations/02-observability/observability_plan.md`
- `docs/03-operations/02-observability/logging_guide.md`
- `docs/03-operations/02-observability/metrics_guide.md`
- `docs/03-operations/02-observability/alerting_guide.md`
- `docs/03-operations/02-observability/runbooks.md`

Each observability/runbook package should include:

- Observability goals
- Logging guide
- Metrics, SLI/SLO, and dashboard guide
- Tracing guide
- Health checks
- Alerting guide
- Incident response runbooks
- Maintenance runbooks
- Validation drills
- Retention, compliance, privacy, and cost notes
- Open questions and approvals

## Approval Gate

- Do not execute beyond planning until the human approves.
- Ask before making critical operations, monitoring, alerting, retention, compliance, privacy, escalation, or incident-response decisions.
- Do not connect to production systems or change monitoring/alerting configuration unless explicitly approved.
- Execute one checkbox at a time.
- Mark each checkbox complete after finishing it.
- Do not rewrite previously approved or completed plans except for append-only addenda or explicitly approved follow-up plans.
- Treat prior approved plans as historical evidence, not current-state documents.
- During execution, update only checkbox status and append execution notes, verification results, blockers, or addendum references.
- Placeholder audits and cleanup passes must distinguish active project debt from historical approved plan records.
