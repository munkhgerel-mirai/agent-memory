---
name: ai-dlc-brownfield-discovery
description: Use when inspecting an existing or brownfield codebase before AI-DLC Inception, Domain Design, Logical Design, or Code Generation to produce a traceable discovery report covering repository structure, runtime, dependencies, domain concepts, integrations, data stores, tests, risks, and open questions without making code changes.
---

# AI-DLC Brownfield Discovery

Use this skill to understand an existing codebase before planning design or implementation changes.

## Inputs / Preconditions

- Existing repository or codebase
- Change intent, project intent, or discovery goal
- Target module, service, workflow, or component, if known
- Existing documentation, architecture notes, issue links, or source references, if available
- Approval to begin brownfield discovery planning

## Workflow

1. Confirm discovery scope, change intent, target areas, and any known constraints.
2. Create a checkbox discovery plan in `docs/02-construction/02-design-plan/brownfield_discovery_plan.md`.
3. Request explicit human approval before execution.
4. Inspect repository structure, source roots, test roots, documentation, configuration, and generated or vendored folders.
5. Identify runtime, programming languages, frameworks, dependency managers, build tools, and package boundaries.
6. Identify entry points, public APIs, executable commands, background jobs, scheduled tasks, and deployment/runtime entry surfaces.
7. Map major components, responsibilities, ownership boundaries, dependency direction, and shared modules.
8. Discover domain concepts, workflows, business rules, invariants, and terminology already present in code or docs.
9. Identify integrations, external systems, data stores, schemas, migrations, queues, events, files, and third-party services.
10. Inspect tests and available verification checks without modifying code.
11. Identify operational, security, privacy, compliance, data, and delivery risks.
12. Document assumptions, unknowns, and open questions that require human clarification.
13. Save the discovery report to `docs/02-construction/01-architecture/brownfield_discovery.md` using `docs/02-construction/01-architecture/brownfield_discovery_TEMPLATE.md` when starting from the template.
14. Recommend the next AI-DLC step: Inception refinement, Units update, Domain Design, Logical Design, Code Generation, or additional discovery.
15. Confirm exit criteria and request human approval before design or code changes.

## Discovery Guidance

The discovery report should include:

- Discovery scope and intent
- Repository map
- Runtime and tooling summary
- Entry points and execution surfaces
- Component map and responsibilities
- Dependency direction and coupling notes
- Domain concepts and terminology
- Workflows and business rules found in code
- Data stores, schemas, migrations, and ownership notes
- Integrations and external systems
- Tests, verification commands, and coverage notes
- Operational, security, privacy, compliance, data, and delivery risks
- Assumptions and open questions
- Recommended next AI-DLC step

Classify findings as:

- Confirmed from code
- Confirmed from documentation
- Inferred from structure or naming
- Assumption requiring human validation
- Unknown or blocker

When inspecting code:

- Prefer read-only commands first.
- Avoid installing dependencies unless the human approves.
- Avoid running commands that mutate local state, start services, contact external systems, or require credentials unless the human approves.
- Treat generated, vendored, build-output, and dependency folders as low-signal unless they are directly relevant.
- Record exact files or folders that support important conclusions.

## Outputs

- `docs/02-construction/02-design-plan/brownfield_discovery_plan.md`
- `docs/02-construction/01-architecture/brownfield_discovery.md`

## Exit Criteria

- Discovery scope and target areas are documented.
- Repository structure and key runtime/tooling are documented.
- Entry points and major components are identified.
- Dependency direction and integration points are documented.
- Existing domain concepts and workflows are captured.
- Data stores and external systems are identified or marked unknown.
- Available tests and verification commands are documented.
- Risks, assumptions, and open questions are documented.
- Recommended next AI-DLC step is stated.
- Human approval is recorded before moving to design or implementation changes.

## Approval Gate

- Do not execute beyond planning until the human approves.
- Do not modify source code, tests, configuration, dependencies, generated files, or runtime structure during discovery.
- Ask before running commands that install dependencies, start services, contact external systems, require credentials, write outside approved artifact files, or may mutate local state.
- Ask before making critical architecture, domain, technology, data, or security conclusions.
- Execute one checkbox at a time.
- Mark each checkbox complete after finishing it.
- Do not rewrite previously approved or completed plans except for append-only addenda or explicitly approved follow-up plans.
- Treat prior approved plans as historical evidence, not current-state documents.
- During execution, update only checkbox status and append execution notes, verification results, blockers, or addendum references.
- Placeholder audits and cleanup passes must distinguish active project debt from historical approved plan records.
