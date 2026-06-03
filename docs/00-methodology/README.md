# AI-DLC Methodology Reference

**Purpose:** Reference documentation for the AI-Driven Development Lifecycle (AI-DLC) used in this project template.

---

## What is AI-DLC?

AI-DLC is a development methodology where:
- **AI proposes** plans and designs
- **Humans validate** and approve
- **AI executes** with rapid, verifiable iterations

**Key Principles:**
1. Plan-first workflow
2. Approval gates before execution
3. Rapid iterations ("Bolts")
4. Domain-driven thinking early
5. Artifacts stored by phase

---

## AI-DLC Phases

### Phase 0: Setup
- Initialize structure and skills

### Phase 1: Inception
- Clarify intent
- User stories and acceptance criteria
- Non-functional requirements (NFRs)
- Risks
- Units and Bolts

### Phase 2: Construction
- Architecture
- Domain design (DDD)
- Logical design
- Code generation and testing

### Phase 3: Operations
- Deployment packaging
- Observability and runbooks

---

## Skill Pack

Skills live in `docs/00-methodology/01-skills/` and should be chosen according to the current AI-DLC task.

The canonical methodology reference is `ai-dlc-paper.md`.

## Practical References

- `skill_to_artifact_map.md` - Maps each AI-DLC skill to inputs, plans, outputs, templates, approval gates, and next steps.
- `quality_gate_checklist.md` - Review checklist for approving AI-DLC artifacts before moving to the next phase.
- `template_ownership.md` - Defines template-owned, project-owned, and manual-merge files for managed upgrades.
- Root `README.md` / `Template Upgrade And Adoption` - Explains Template-Adopted Project upgrades and Newly Adopting Project brownfield adoption.
- `gitignore_recommendations.md` - Reusable ignore guidance that does not overwrite project `.gitignore` files.
- `01-skills/ai-dlc-inception/references/nfr_catalog.md` - Examples and questions for writing measurable non-functional requirements.
- `01-skills/ai-dlc-domain-design/references/ddd_reference.md` - Domain-Driven Design reference for technology-agnostic Domain Design.

---

## Status

This file is a stable reference and should rarely change.
