# Test Results - BOLT-08 / UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27
**Related Code Generation Report:** `docs/02-construction/04-code-generation/code_generation_report_bolt08.md`

## Approval Status

Approved by user on 2026-07-27.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Source and tests compile with `tsc -p tsconfig.json`. |
| TypeScript typecheck | `npm run typecheck` | Pass | Strict TypeScript check passes with no emit. |
| Unit/integration tests | `npm test` | Pass | 59 tests passed, 0 failed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, and 8 BOLT-08 tests. |
| Scan rule tests | BOLT-08 tests | Pass | The rule set is function-free data with a stated reason per rule. `docs/**.md`, `session-logs/**.md`, and root-level Markdown are candidates; `src/docs/`, `node_modules/`, `dist/`, `.git/`, non-Markdown files, and unlisted directories are not. |
| Determinism tests | BOLT-08 tests | Pass | `deriveObservedVersion` is stable for identical content, identical across LF and CRLF, different for changed content, and formatted as `sha256:` plus 16 hex characters. |
| Approval extraction tests | BOLT-08 tests | Pass | Approved with approver and date, pending, changes-requested, and superseded verdicts map correctly. A template placeholder, a missing section, an empty section, and an approval word outside the section all resolve to `draft`. A verdict followed by a table containing the word "Historical" still resolves to `approved`. |
| Tree scan tests | BOLT-08 tests | Pass | A temporary workspace yields exactly the four expected observations. `docs/empty.md` is reported `empty_artifact` and `docs/notes/unmatched_note.md` is reported `unclassified_artifact`. `node_modules/` and `src/docs/` appear in `excludedPaths` and produce no observation. Artifact type, approval, timestamp, source kind, and template flag are all correct. |
| Template suppression tests | BOLT-08 tests | Pass | A `*_TEMPLATE.md` file whose own text says "Approved by user on 2026-01-01" is still recorded as `draft`, satisfying US-002 AC-004. |
| Resilience tests | BOLT-08 tests | Pass | An empty workspace root, a missing root, and a file passed as a root all throw `WorkspaceSourceReadError`. `readArtifact` throws for a missing named file and succeeds for a present one. |
| Size limit tests | BOLT-08 tests | Pass | A file above the configured limit is skipped as `file_too_large` with the byte counts in the detail, and produces no observation. |
| Real-tree test | BOLT-08 tests | Pass | Scanning this repository produces 100 observations from 152 candidates with no hand-written fixtures. `nfrs.md` resolves to artifact type `nfr` and approval `approved`; `bolts_plan.md` resolves to `bolt` with decision date `2026-06-04`; session logs are present; nothing from `src/docs/` appears; no template is above `draft`. |
| Known-gap tripwire | BOLT-08 tests | Pass | `PROJECT_STATUS.md` is asserted to be skipped as `unclassified_artifact`, so the gap stays visible until a classifier decision is taken. |
| Read-only test | BOLT-08 tests | Pass | The reader source references none of `writeFile`, `appendFile`, `mkdir`, `rmSync`, `unlink`, `rename`, `copyFile`, `createWriteStream`, `truncate`, or `chmod`. |
| Boundary tests | BOLT-06 and BOLT-07 tests | Pass | Every `src/**/*.ts` import remains relative or `node:`-prefixed, and no dependency was added. |

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| None | No failed checks in final verification. | N/A | N/A | No |

Three defects were found and fixed during development, all surfaced by the real-tree scan rather than by hand-written fixtures. They are recorded here because they changed the implementation.

| Defect | Symptom | Cause | Fix |
|--------|---------|-------|-----|
| Root-level directories never classified | `session-logs/*.md` produced no observation | `matchCategoryRule` tests `/session-logs/` with a leading slash, which a root-level path cannot contain | The reader declares `artifactType` via `DEFAULT_ARTIFACT_TYPE_RULES`, so the classifier resolves it through its type rules. BOLT-01 is unmodified. |
| Approval section over-captured | `nfrs.md` resolved to `historical` instead of `approved` | The section slice ran to the next heading, but `nfrs.md` places its NFR table directly under the approval heading, and NFR-004's row contains the word "Historical" | Only the first verdict paragraph of the section decides the status. |
| Template placeholders read as verdicts | Ten `*_TEMPLATE.md` files resolved to `changes_requested` | Their placeholder text lists every option at once: `<Pending review / Approved by <APPROVER> on <DATE> / Changes requested / Deferred>` | Angle-bracket placeholder verdicts resolve to `draft`, and a template's approval is forced to `draft` regardless of content. |

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | US-002 AC-001 is covered: artifact type, source path, approval status, and timestamp are recorded per artifact. US-002 AC-004 is covered by template suppression. US-003 is partially served, since classification and provenance are produced. | US-002 AC-002 classification into every lifecycle category is only partially demonstrated: 52 of 152 candidates match no rule. US-002 AC-003 stale-metadata removal on rebuild belongs to BOLT-09. |
| Domain invariants | Tests cover deterministic versioning, template detection, approval defaulting, and the rule that an unmatched artifact is reported rather than fatal. | Lifecycle edge extraction is not attempted in this slice. |
| Integration points | Observations are produced through the approved `createDurableSourceObservation` factory and validated against the approved `classifyArtifactSource`. | The observations are not yet persisted or projected; that is BOLT-09. |
| NFR / risk scenarios | NFR-003 determinism, NFR-005 local-only operation, NFR-006 provenance through source path, NFR-016 category mapping, and R-010 divergence detectability are addressed. | NFR-001 and NFR-009 remain unmeasured; the real-tree scan of 152 candidates completed in roughly 54 ms but this is not a scale benchmark. |

## Follow-Ups

- BOLT-08 Test Results approved on 2026-07-27.
- The 52 unclassified candidates are addressed by the approved `code_generation_followup_plan_bolt08a.md`.
- The `PROJECT_STATUS.md` tripwire is inverted, not deleted, by BOLT-08a.
- Add scale measurement in BOLT-14; the current real-tree timing is incidental, not a benchmark.
- Revisit `DEFAULT_ARTIFACT_TYPE_RULES` if the BOLT-01 classifier is later fixed to match root-level directories.
