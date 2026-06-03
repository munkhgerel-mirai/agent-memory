---
name: ai-dlc-code-generation
description: Use when generating implementation code and tests from approved AI-DLC domain and logical designs with traceability, test coverage, verification reports, and human approval for critical changes.
---

# AI-DLC Code Generation

Use this skill to implement code and tests from approved AI-DLC designs with traceability and verification.

## Workflow

1. Confirm approved inputs exist: Units, user stories, domain designs, logical designs, NFRs, and risk register.
2. Inspect existing repo structure, runtime, dependency manager, source folders, test folders, and existing implementation patterns.
3. Treat placeholder code in `src/` and `tests/` as non-production unless the human says otherwise.
4. Create a checkbox plan in `docs/02-construction/02-design-plan/code_generation_plan.md`.
5. Request explicit human approval before execution.
6. Map each planned implementation task to the relevant Unit, user story, acceptance criteria, domain model element, logical design decision, NFR, or risk.
7. Before using any database, framework, programming language, cloud SDK, dependency, infrastructure tool, or runtime platform, confirm it has an `Approved` ADR in `docs/02-construction/01-architecture/technology_decisions.md`, or record explicit human approval in the code-generation plan. Non-binding technology mapping in Logical Design is not sufficient approval for implementation.
8. Implement code per Unit in `src/` or the approved runtime folder.
9. Add tests in `tests/` covering unit behavior, integration points, acceptance criteria, domain invariants, regression risks, and applicable NFR/risk-driven scenarios.
10. Produce `docs/02-construction/04-code-generation/code_generation_report.md` with changed files, traceability mapping, assumptions, and deviations from design.
11. Run available verification checks: tests, lint, typecheck, formatting check, and any project-specific checks.
12. Document verification results in `docs/02-construction/04-code-generation/test_results.md` using `docs/02-construction/04-code-generation/test_results_TEMPLATE.md` when starting from the template.
13. If tests or checks fail, document the failure, propose fixes, and request approval before applying them.
14. Request approval before adding dependencies, changing runtime structure, or deviating from approved designs.
15. Keep implementation aligned with approved designs and plan.

## Outputs

- `docs/02-construction/02-design-plan/code_generation_plan.md`
- Code in `src/` or approved runtime folder
- Tests in `tests/`
- `docs/02-construction/04-code-generation/code_generation_report.md`
- `docs/02-construction/04-code-generation/test_results.md`

## Approval Gate

- Do not execute beyond planning until the human approves.
- Do not apply fixes for failed tests/checks without human approval.
- Ask before using any database, framework, programming language, cloud SDK, dependency, infrastructure tool, or runtime platform unless it has an `Approved` ADR in `docs/02-construction/01-architecture/technology_decisions.md` or explicit approval in the code-generation plan.
- Ask before adding dependencies, changing runtime structure, relying on non-binding Logical Design technology mapping as implementation approval, or deviating from approved designs.
- Ask before making critical implementation decisions.
- Execute one checkbox at a time.
- Mark each checkbox complete after finishing it.
- Do not rewrite previously approved or completed plans except for append-only addenda or explicitly approved follow-up plans.
- Treat prior approved plans as historical evidence, not current-state documents.
- During execution, update only checkbox status and append execution notes, verification results, blockers, or addendum references.
- Placeholder audits and cleanup passes must distinguish active project debt from historical approved plan records.
