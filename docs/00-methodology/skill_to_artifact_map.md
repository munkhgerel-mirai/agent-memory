# AI-DLC Skill To Artifact Map

Use this reference to choose the right skill and understand which artifacts it should read, plan, produce, and hand off to the next AI-DLC step.

## Core Rules

- Create the plan artifact first.
- Get human approval before execution.
- Execute one checkbox at a time.
- Store documentation and lifecycle artifacts under `docs/`.
- Store implementation code and tests in approved runtime folders such as `src/` and `tests/`.
- Treat an upstream artifact as approved only when its `Approval Status` is `Approved`, or when the governing approved plan explicitly names that output path as approved.
- Treat approved plans as historical decision records after execution starts.
- Do not semantically rewrite prior approved plans to match current state; use current plans, status files, setup validation, session logs, addenda, or follow-up plans instead.
- Record used skills in the session log under `Skills Used`.

## Skill Map

| Skill | Use When | Required Inputs | Plan Artifact | Main Outputs | Templates | Next Step |
|-------|----------|-----------------|---------------|--------------|-----------|-----------|
| `ai-dlc-setup` | Initializing, repairing, or auditing template readiness | Project name, draft intent, setup mode, existing repo/template state | `docs/02-construction/02-design-plan/setup_plan.md` | `docs/00-methodology/setup_validation.md`, updated `PROJECT_STATUS.md`, session log | `docs/00-methodology/setup_validation_TEMPLATE.md` | Inception or Brownfield Discovery |
| `ai-dlc-inception` | Clarifying intent and producing initial requirements artifacts | Project goal, stakeholders, constraints, source docs | `docs/01-inception/99-plans/inception_plan.md` | `intent_clarification.md`, `all_user_stories.md`, `nfrs.md`, `risk_register.md` | Inception templates under `docs/01-inception/` | Units |
| `ai-dlc-units` | Grouping approved stories into Units and Bolts | Approved intent, user stories, NFRs, risks, open questions | `docs/01-inception/99-plans/units_and_bolts_plan.md` | `docs/01-inception/05-units/units_composition.md`, `docs/01-inception/06-bolts/bolts_plan.md` | `units_composition_TEMPLATE.md`, `bolts_plan_TEMPLATE.md` | Domain Design |
| `ai-dlc-brownfield-discovery` | Inspecting an existing codebase before design or code changes | Existing repo, change intent, target module, docs | `docs/02-construction/02-design-plan/brownfield_discovery_plan.md` | `docs/02-construction/01-architecture/brownfield_discovery.md` | `brownfield_discovery_TEMPLATE.md` | Inception refinement, Domain Design, Logical Design, or Code Generation |
| `ai-dlc-domain-design` | Modeling approved Units with technology-agnostic DDD | Approved Units, user stories, NFRs, risks | `docs/02-construction/02-design-plan/domain_design_plan.md` | `docs/02-construction/03-domain-design/<unit_name>.md` | `domain_design_TEMPLATE.md` | Logical Design |
| `ai-dlc-logical-design` | Extending domain design into architecture decisions and NFR trade-offs | Approved Units, domain designs, NFRs, risks | `docs/02-construction/02-design-plan/logical_design_plan.md` | `<unit_name>_logical_design.md`, optionally `system_architecture.md` | `logical_design_TEMPLATE.md`, `system_architecture_TEMPLATE.md` | Code Generation |
| `ai-dlc-technology-decision` | Selecting databases, frameworks, languages, cloud services, dependencies, integration technologies, infrastructure tools, or runtime platforms | Approved NFRs, risks, logical design, brownfield discovery, constraints, candidate options | `docs/02-construction/02-design-plan/technology_decision_plan.md` | `docs/02-construction/01-architecture/technology_decisions.md` | `technology_decisions_TEMPLATE.md` | Logical Design update, Code Generation, Deployment, or Operations |
| `ai-dlc-code-generation` | Implementing approved designs with traceability and verification | Units, user stories, domain designs, logical designs, NFRs, risks | `docs/02-construction/02-design-plan/code_generation_plan.md` | Code in `src/` or approved runtime folder, tests in `tests/`, `code_generation_report.md`, `test_results.md` | `code_generation_report_TEMPLATE.md`, `test_results_TEMPLATE.md` | Deployment |
| `ai-dlc-deployment` | Preparing deployment units and release readiness | Logical design, code generation report, test results, NFRs, risks | `docs/03-operations/01-deployment/deployment_plan.md` | `deployment_guide.md`, `rollback_plan.md` | `deployment_plan_TEMPLATE.md`, `deployment_guide_TEMPLATE.md`, `rollback_plan_TEMPLATE.md` | Observability |
| `ai-dlc-operations-observability` | Defining operational readiness and observability | Logical design, deployment guide, rollback plan, NFRs, risks | `docs/03-operations/02-observability/observability_plan.md` | `logging_guide.md`, `metrics_guide.md`, `alerting_guide.md`, `runbooks.md` | Observability templates under `docs/03-operations/02-observability/` | Operations validation and ongoing maintenance |

## Choosing The Next Skill

- Use `ai-dlc-setup` when folder structure, root artifacts, placeholders, or git readiness are unclear.
- Use `ai-dlc-brownfield-discovery` before changing an existing codebase whose structure or behavior is not yet understood.
- Use `ai-dlc-inception` when the product intent, users, outcomes, NFRs, or risks are unclear.
- Use `ai-dlc-units` after Inception artifacts are approved.
- Use `ai-dlc-domain-design` after Units are approved and before architecture or technology decisions.
- Use `ai-dlc-logical-design` after domain design is approved and NFR trade-offs need to be designed.
- Use `ai-dlc-technology-decision` when a technology choice must become binding before implementation, deployment, or operations work.
- Use `ai-dlc-code-generation` only after implementation inputs are approved.
- Use `ai-dlc-deployment` after code and verification outputs are approved.
- Use `ai-dlc-operations-observability` after deployment readiness artifacts exist.

## Handoff Notes

- Every handoff should link back to intent, user stories, NFRs, risks, and open questions where applicable.
- If an upstream artifact is missing or unapproved, stop and create a plan to produce, review, approve, or repair it.
- If a downstream step requires a technology, dependency, cloud service, or data decision that is not human-selected and approved, run `ai-dlc-technology-decision` before proceeding.
