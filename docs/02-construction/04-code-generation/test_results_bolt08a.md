# Test Results - BOLT-08a / UNIT-01 + UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27
**Related Code Generation Report:** `docs/02-construction/04-code-generation/code_generation_report_bolt08a.md`

## Approval Status

Approved by user on 2026-07-27. The coverage measurement records the BOLT-08a state and is superseded by `test_results_bolt08b.md`.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Source and tests compile with `tsc -p tsconfig.json`. |
| TypeScript typecheck | `npm run typecheck` | Pass | Strict TypeScript check passes with no emit. |
| Unit/integration tests | `npm test` | Pass | 66 tests passed, 0 failed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, and 7 BOLT-08a tests. |
| Unchanged-classification test | BOLT-08a tests | Pass | A 13-entry baseline table captured before the change asserts each path keeps its exact primary and secondary categories, covering every pre-existing classification rule. |
| Category-count test | BOLT-08a tests | Pass | `V1_MEMORY_CATEGORY_NAMES` has exactly 13 entries, includes `SessionHandoffMemory`, and does not include `StatusMemory`. |
| Domain-design classification test | BOLT-08a tests | Pass | `unit_01_lifecycle_memory_core.md` and `unit_05_..._logical_design.md` map to `DecisionMemory` with `UnitMemory` secondary and rule name `path:domain-design-artifact`; `deriveArtifactType` returns `domain-design`. The directory's `README.md` and `domain_design_TEMPLATE.md` still throw, confirming the rule is scoped to `unit_` files. |
| Project-status classification test | BOLT-08a tests | Pass | `PROJECT_STATUS.md` maps to `SessionHandoffMemory` with `PlanMemory` secondary and rule name `path:project-status`; `deriveArtifactType` returns `project-status`. |
| Path anchoring test | BOLT-08a tests | Pass | A root-level `session-logs/*.md` classifies as `SessionHandoffMemory` by path even when the declared artifact type is `unknown`, which was impossible before anchoring. |
| Non-memory rule tests | BOLT-08a tests | Pass | At least seven `non_memory` rules exist, each with a stated reason. Eight representative paths across methodology, operations, README, template, template-checklist, agent-instructions, and reference-paper all resolve to a rule. A category-directory README still classifies as project memory, confirming classification wins over the non-memory rule. |
| Coverage test | BOLT-08a tests | Pass | Scanning this repository reports zero `unclassified_artifact` skips. Every skip is `excluded_by_rule` and carries a `non-memory:` label. Observations plus skips equal the candidate count. `PROJECT_STATUS.md` is present as an observation and exactly ten domain-design unit documents are present. |
| Tripwire inversion | BOLT-08 tests | Pass | The BOLT-08 assertion that `PROJECT_STATUS.md` is skipped is replaced by an assertion that it is an observation with artifact type `project-status`. The temporary-tree test still requires a genuinely unrecognised document to report `unclassified_artifact`. |
| Regression suite | BOLT-01 to BOLT-08 tests | Pass | All prior suites pass unchanged, including the BOLT-06 and BOLT-07 domain import boundary scans. |

## Coverage Measurement

| Metric | Before BOLT-08a | After BOLT-08a |
|--------|-----------------|----------------|
| Candidate files | 152 | 156 |
| Observations | 100 | 115 |
| `excluded_by_rule` | reason did not exist | 41 |
| `unclassified_artifact` | 52 | **0** |

The four extra candidates are lifecycle documents added during this session. Of the 15 extra observations, 11 come from the two new classification rules and 4 are the new documents.

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| None | No failed checks in final verification. | N/A | N/A | No |

One design conflict was found before implementation and resolved within the approved scope rather than becoming a test failure.

| Conflict | Detection | Resolution |
|----------|-----------|------------|
| A blanket README non-memory rule would have removed memory | Capturing the before-baseline showed directory READMEs already classified, for example `docs/01-inception/03-nfrs/README.md` as `NfrMemory`. A full enumeration afterwards counted ten such READMEs against ten excluded ones. | Non-memory rules are consulted only after classification fails, so they relabel unclassified files without removing anything already classified. This matches the plan's counts, which were measured from the 52 skipped files. |

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | US-002 AC-002 is now fully demonstrated: every discovered Markdown file is classified into a lifecycle category or excluded by an explicit rule. US-001 AC-001's source document is in memory. US-002 AC-004 template suppression is unchanged from BOLT-08. | US-002 AC-003 stale-metadata removal on rebuild still belongs to BOLT-09. |
| Domain invariants | The unchanged-baseline table and the category-count guard together prove the classifier was extended, not reshaped. | Lifecycle edge extraction between artifacts remains unimplemented. |
| Integration points | Classification runs through the approved `classifyArtifactSource`; discovery runs through the BOLT-08 reader; no new type was introduced. | Observations are still not persisted or projected; that is BOLT-09. |
| NFR / risk scenarios | NFR-016 category mapping is now machine-enforced by the coverage test. NFR-001 and NFR-006 are served because the status document reaches memory with provenance. R-010 divergence remains detectable. | NFR-001 latency and NFR-009 scale remain unmeasured until BOLT-14. |

## Follow-Ups

- BOLT-08a Test Results approved on 2026-07-27.
- Keep the coverage test as the gate for new document types; `unclassified_artifact` is now an alarm rather than a routine outcome.
- Decide whether directory READMEs should be memory at all. Both current outcomes are correct under the approved rules, but the rule set is incoherent on this point. Best resolved at BOLT-14 when the context pack can be inspected end to end.
- Revisit `DEFAULT_ARTIFACT_TYPE_RULES` once BOLT-09 is stable; anchoring made it redundant for paths the classifier now matches directly.
