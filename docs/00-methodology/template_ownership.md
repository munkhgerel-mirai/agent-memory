# AI-DLC Template Ownership Policy

**Policy Version:** v0.2.0  
**Purpose:** Define which files the AI-DLC template may update automatically and which files are owned by downstream projects.

## Ownership Classes

### Template-Owned

Template-owned files are reusable method, governance, and template assets. Template upgrades may update these files automatically.

- `docs/00-methodology/**`
- `docs/**/*_TEMPLATE.md`
- AI-DLC skill files under `docs/00-methodology/01-skills/**`
- Quality gates and methodology maps
- `TEMPLATE_CHECKLIST.md`
- `ai-dlc-paper.md`
- `copier.yml`
- `.ai-dlc-template.yml`
- `.copier-answers.yml`
- `.gitignore.jinja`
- `session-logs/README.md`
- `tools/ai_dlc_template_sync.py`

### Project-Owned

Project-owned files are specific to a downstream project. Template upgrades and brownfield adoption must not overwrite them automatically.

- `README.md`
- `.gitignore`
- `PROJECT_STATUS.md`
- Session log entries under `session-logs/**`, except `session-logs/README.md`
- Approved plans and generated lifecycle artifacts that do not end in `_TEMPLATE.md`
- Real implementation code under `src/**`
- Real test code under `tests/**`

### Manual-Merge

Manual-merge files combine reusable governance with project-specific operating rules. Template upgrades may report changes, but a human must merge them.

- `AGENTS.md`

## Required Sync Behavior

- Block automatic changes to project-owned files during template upgrades.
- Allow template upgrades to update `session-logs/README.md`.
- Preserve downstream `README.md` during Template-Adopted Project upgrades and Newly Adopting Project brownfield adoption.
- Preserve downstream `.gitignore` during Template-Adopted Project upgrades and Newly Adopting Project brownfield adoption.
- Report `AGENTS.md` as manual-merge whenever it changes.
- Produce `.gitignore` recommendations as a report, not as an automatic root `.gitignore` edit.
- Require explicit human approval before any project-owned file is changed.

## Brownfield Adoption Rule

For an existing project that never used the template, add the AI-DLC governance layer first and do not overwrite existing project identity, source code, tests, or ignore rules. After adoption, run `ai-dlc-setup` and, if code already exists, `ai-dlc-brownfield-discovery`.
