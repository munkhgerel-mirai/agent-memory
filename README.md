# AI-DLC Project Template

A simple starter repo for the **[AI-Driven Development Lifecycle (AI-DLC)](https://prod.d13rzhkk8cj2z0.amplifyapp.com)**.

---

## What This Template Provides

- A ready-made folder structure for all AI-DLC phases
- Skills that enforce plan-first and human approval gates
- `AGENTS.md` that ties the workflow together
- Example template documents for each phase
- Minimal placeholder code and tests you can replace

---

## Quick Start

1. **Clone and rename** this repository.
2. **Read** `AGENTS.md` and `PROJECT_STATUS.md` to understand how progress is tracked.
3. **Start the agent** and run `ai-dlc-setup` to validate structure, templates, placeholders, and git readiness.
4. **Approve** `docs/02-construction/02-design-plan/setup_plan.md`; let the agent replace project identity placeholders only as approved.
5. **Begin the workflow:** agent proposes a checkbox plan -> human approves -> agent executes one checkbox at a time -> human validates outputs.

---

## Template Upgrade And Adoption

**Policy Version:** v0.2.0  
**Default Tool:** Copier  

### Core Rule

Template upgrades may update reusable AI-DLC methodology assets, including `session-logs/README.md`, but they must not overwrite project-owned files. In particular, root `README.md` and `.gitignore` are preserved during both Template-Adopted Project upgrades and Newly Adopting Project brownfield adoption.

### Template-Adopted Project Upgrade Flow

Use this flow when a project already adopted an earlier AI-DLC template version.

1. Confirm the project has `.ai-dlc-template.yml` and `.copier-answers.yml`, and that `.copier-answers.yml` contains Copier's `_src_path` value.
2. Create an upgrade branch, for example `upgrade/ai-dlc-template-v0.2.1`.
3. Run the sync wrapper from the project root:

```bash
python tools/ai_dlc_template_sync.py update --vcs-ref v0.2.1
```

4. Review the policy report:
   - Project-owned changes must be blocked.
   - `README.md` must remain unchanged.
   - `.gitignore` must remain unchanged.
   - `AGENTS.md` changes require manual merge.
5. Review `.gitignore` recommendations and apply them only if approved.
6. Run `ai-dlc-setup` in audit mode.
7. Commit the upgrade as a single template-governance change.

Troubleshooting:

- `update` is only for Copier-managed Template-Adopted Projects. Do not run it from the `ai_dlc_template` source repository.
- If `.copier-answers.yml` is missing or does not contain `_src_path`, use the Newly Adopting Project `copier copy --vcs-ref v0.2.1 ... .` flow first.
- If Copier is installed but not on `PATH`, pass the executable path with `--copier-bin`, for example `python tools/ai_dlc_template_sync.py update --copier-bin "C:\path\to\copier.exe" --vcs-ref v0.2.1`.

### Newly Adopting Project Brownfield Adoption Flow

Use this flow when an existing project never used the AI-DLC template.

Run these commands from the root of the Newly Adopting Project, not from the template repository.

1. Confirm the existing project has a clean or intentionally understood git baseline:

```bash
git status --short
copier --version
```

If unrelated changes exist, either commit them first or keep them clearly out of the adoption commit. If Copier is not installed, install it using the team's approved Python tooling before continuing.

2. Create an adoption branch from the project root:

```bash
git checkout -b adopt/ai-dlc-template-v0.2.1
```

3. Apply the AI-DLC template into the existing repository:

```bash
copier copy --vcs-ref v0.2.1 https://github.com/miraitechnologies/ai_dlc_template.git .
```

Use the project-specific answers when Copier prompts for project name, project intent, template source, template version, and template commit. For `template_version`, use `v0.2.1`; for `template_commit`, use the template commit SHA when known, otherwise `unknown`.

4. Preserve existing project identity, source code, tests, root `README.md`, and root `.gitignore`.

Copier is configured with `skip_if_exists` for the highest-risk project-owned paths, but the adoption branch must still be reviewed before commit. Do not accept accidental changes to root `README.md`, `.gitignore`, `PROJECT_STATUS.md`, `src/**`, or `src/tests/**` unless a human explicitly approved those project-owned edits.

5. Add the AI-DLC governance layer:
   - `AGENTS.md` through manual merge
   - `docs/00-methodology/**`
   - reusable `*_TEMPLATE.md` lifecycle artifacts
   - `TEMPLATE_CHECKLIST.md`
   - template sync metadata

6. Generate `.gitignore` recommendations without editing `.gitignore` automatically:

```bash
python tools/ai_dlc_template_sync.py gitignore-report
```

Review `docs/00-methodology/gitignore_recommendations_report.md`. Apply any recommended `.gitignore` entries only as an approved project-owned change. If no `.gitignore` exists, create a minimal starter `.gitignore` only after setup approval.

7. Run the sync policy report against the adoption branch:

```bash
python tools/ai_dlc_template_sync.py check-policy --base-ref main
```

Use the actual base branch name if it is not `main`, for example `master` or `origin/main`. The report must not show unapproved changes to project-owned files. `AGENTS.md` is expected to require manual merge review.

8. Run `ai-dlc-setup` in audit mode to validate required folders, root artifacts, template metadata, ownership rules, placeholders, and git readiness.

9. Run `ai-dlc-brownfield-discovery` before design or implementation changes so the existing codebase is documented before AI-DLC construction work begins.

10. Commit the adoption as a single governance change after review:

```bash
git status --short
git add AGENTS.md TEMPLATE_CHECKLIST.md .ai-dlc-template.yml .copier-answers.yml .gitignore.jinja
git add docs/00-methodology docs/01-inception docs/02-construction docs/03-operations
git add session-logs/README.md tools/ai_dlc_template_sync.py
git diff --cached --name-only
git commit -m "Adopt AI-DLC template governance"
```

Stage only the approved adoption files. If the project already has documentation under `docs/`, inspect the cached diff before committing and unstage unrelated project docs. Do not include unrelated application changes in the adoption commit.

### Conflict Handling

- Keep project-owned content when conflicts involve root `README.md`, `.gitignore`, `PROJECT_STATUS.md`, `src/**`, `tests/**`, generated lifecycle artifacts, or real session log entries.
- Treat `session-logs/README.md` as template-owned.
- For `AGENTS.md`, merge reusable AI-DLC governance with existing project rules and keep deeper or more specific project instructions.
- For template-owned files, prefer the new template version unless a project-specific approved addendum says otherwise.

### Release Process

1. Draft release notes under `docs/00-methodology/releases/`.
2. Run the sync wrapper tests and compile checks.
3. Tag the baseline release, for example `v0.1.0`.
4. Commit governance updates.
5. Tag the governance release, for example `v0.2.0`.

---

## Repository Structure (Template)

```
ai_dlc_template/
├── AGENTS.md
├── PROJECT_STATUS.md
├── TEMPLATE_CHECKLIST.md
├── ai-dlc-paper.md
├── docs/
│   ├── 00-methodology/
│   │   └── 01-skills/
│   ├── 01-inception/
│   ├── 02-construction/
│   └── 03-operations/
├── session-logs/
├── src/
│   └── placeholder_app.py
└── tests/
    └── test_placeholder.py
```

---

## How to Use AI-DLC Here

- **Phase 0 (Setup):** Use the setup skill to validate structure and tooling.
- **Phase 1 (Inception):** Clarify intent, write user stories, NFRs, risks, units, and bolts.
- **Phase 2 (Construction):** Produce architecture, domain design, logical design, and code.
- **Phase 3 (Operations):** Define deployment, observability, and runbooks.

Lifecycle documentation and AI-DLC artifacts must live in `docs/` with the phase-specific folders. Implementation code and tests must live in approved runtime and test folders such as `src/` and `tests/`.

---

## Placeholder Notice

This template intentionally avoids domain-specific content. Replace all placeholders and examples before real work begins.

This template is intended to be updated and improved regularly. Comments and suggestions are welcome.
