# AI-DLC `.gitignore` Recommendations

**Policy Version:** v0.2.0  
**Purpose:** Keep template ignore guidance reusable without taking ownership of downstream project `.gitignore` files.

## Policy

The AI-DLC template does not own a downstream project's root `.gitignore` after project creation.

- New greenfield projects may receive a starter `.gitignore` only when the destination has no `.gitignore`.
- Existing project `.gitignore` files are preserved during upgrade and brownfield adoption.
- New ignore guidance is reported as recommendations.
- Humans decide whether to apply recommendations to a project-owned `.gitignore`.

## Recommended Entries

```gitignore
# Local Python and test caches
__pycache__/
*.py[cod]
.pytest_cache/
.ruff_cache/
.mypy_cache/

# Local environment files
.env
.env.*
!.env.example

# Operating-system noise
.DS_Store
Thumbs.db
```

## Upgrade Handling

During Template-Adopted Project upgrades, the sync wrapper compares the recommendations above with the current project `.gitignore` and writes a recommendation report. It must not edit `.gitignore` automatically.

During Newly Adopting Project brownfield adoption, the existing `.gitignore` is preserved. If no `.gitignore` exists, a starter file may be created only as an approved setup action.
