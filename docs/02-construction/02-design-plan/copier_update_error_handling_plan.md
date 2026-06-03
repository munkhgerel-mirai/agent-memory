# Copier Update Error Handling Plan

**Approval Status:** Approved by user request on 2026-05-20  
**Plan Type:** Construction / template sync wrapper hardening  

## Context

`python tools/ai_dlc_template_sync.py update --vcs-ref v0.2.0` failed with Copier's `TypeError: Template not found` when run without valid Copier answers metadata. Copier update requires a destination project with `.copier-answers.yml` containing `_src_path`.

Unrelated working-tree change detected and preserved:

- Root `README.md` removed `git log --oneline -10` from the Newly Adopting preflight commands.

## Approved Checklist

- [x] Record the approved error-handling plan.
- [x] Add preflight validation for `.copier-answers.yml`.
- [x] Add friendly errors for missing `_src_path`, missing Copier executable, and Copier `Template not found`.
- [x] Update root README with update troubleshooting guidance.
- [x] Add tests for missing answers, missing `_src_path`, and valid Copier invocation.
- [x] Run verification and record results.
- [x] Write a session log.

## Verification Results

- `python -m pytest tests/test_template_sync_policy.py` passed.
- `python -m compileall tools tests` passed.
- `python tools\ai_dlc_template_sync.py update --vcs-ref v0.2.0` now fails with a clear preflight error when run from the template source repo.
- `python tools\ai_dlc_template_sync.py update --skip-copier` runs policy checks without requiring Copier metadata.
