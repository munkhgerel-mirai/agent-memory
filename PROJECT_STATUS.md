# Agent-memory Project Status

**Last Updated:** 2026-09-23

---

## Project Goal

To build an agentic memory system that provides persistent, framework-agnostic context for any Large Language Model (LLM) operating within the AI-Driven Development Lifecycle (AI-DLC) methodology.

Key Objectives:
- Persistent Context: Maintain session states across different AI interactions.
- LLM Agnostic: Seamlessly integrate with any underlying language model.
- Workflow Alignment: Support rapid, iterative AI-DLC software engineering phases.

---

## Current Status

**Phase:** CONSTRUCTION - CODE GENERATION PLANNING
**Status:** UNIT-02 DEAD ASYNC PORT CLEANUP REVIEWED AND APPROVED; CHANGES UNCOMMITTED

---

## Recent Decisions

- Setup plan approved by the user on 2026-06-03.
- Active project identity placeholders were replaced with approved template metadata.
- Reusable `*_TEMPLATE.md` placeholders remain intact for future generated artifacts.
- Setup validation completed and recorded in `docs/00-methodology/setup_validation.md`.
- Setup validation was reviewed by the user on 2026-06-04.
- Inception planning started with `docs/01-inception/99-plans/inception_plan.md`.
- Inception plan approved by the user on 2026-06-04.
- Mob Elaboration open-question answers approved by the user on 2026-06-04.
- Inception artifacts generated: intent clarification, user stories, NFRs, and risk register.
- Inception artifacts reviewed and approved by the user on 2026-06-04.
- Units and Bolts planning started with `docs/01-inception/99-plans/units_and_bolts_plan.md`.
- Units and Bolts plan approved by the user on 2026-06-04.
- Units composition generated in `docs/01-inception/05-units/units_composition.md`.
- Bolts plan generated in `docs/01-inception/06-bolts/bolts_plan.md`.
- Repository content boundary clarified: root `docs/` is reserved for Agent-memory development AI-DLC artifacts; Agent-memory product templates, classified Markdown examples, and fixtures belong under `src/docs/`.
- Units composition and Bolts plan reviewed and approved by the user on 2026-06-04.
- Domain Design planning started with `docs/02-construction/02-design-plan/domain_design_plan.md`.
- Domain Design plan approved by the user on 2026-06-04.
- Technology-agnostic Domain Design artifacts generated for UNIT-01 through UNIT-05.
- Domain Design artifacts reviewed and approved by the user on 2026-06-04.
- Technology Decision planning started with `docs/02-construction/02-design-plan/technology_decision_plan.md`.
- Technology Decision plan approved by the user on 2026-06-04.
- Proposed technology ADRs created in `docs/02-construction/01-architecture/technology_decisions.md`; all remain pending human selection and approval.
- Human Selection Gate completed on 2026-06-04; user approved all AI-recommended selections.
- Approved technology decisions: TypeScript/Node primary runtime, iii-engine optional adapter, local-first rebuildable storage posture, no automatic raw observation retention by default with configurable TTL when enabled, and embeddings deferred from v1 with a v1.1 extension boundary.
- Logical Design planning started with `docs/02-construction/02-design-plan/logical_design_plan.md`.
- Logical Design plan approved by the user on 2026-06-04.
- Unit Logical Design artifacts generated for UNIT-01 through UNIT-05.
- Cross-Unit system architecture synthesis generated in `docs/02-construction/01-architecture/system_architecture.md`.
- System architecture and all Unit Logical Design artifacts reviewed and approved by the user on 2026-06-05.
- Code Generation planning started with `docs/02-construction/02-design-plan/code_generation_plan.md`.
- Code Generation plan approved by the user on 2026-06-05.
- First implementation slice completed for BOLT-01 / UNIT-01 Lifecycle Memory Core.
- TypeScript/Node package scaffold created with approved minimal dev tooling.
- Non-production Python placeholder source/test files removed.
- Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report.md`.
- Test Results created in `docs/02-construction/04-code-generation/test_results.md`.
- Code Generation Report reviewed and approved by the user on 2026-06-12.
- Test Results reviewed and approved by the user on 2026-06-12.
- BOLT-02 / UNIT-02 Code Generation follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt02.md` on 2026-06-15.
- BOLT-02 / UNIT-02 Code Generation follow-up plan approved by the user on 2026-06-15.
- BOLT-02 implementation completed with local storage/rebuild/search foundation, JSONL event validation, `node:sqlite` derived projection, rebuild coordinator, and BOLT-02 tests.
- BOLT-02 Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt02.md`.
- BOLT-02 Test Results created in `docs/02-construction/04-code-generation/test_results_bolt02.md`.
- BOLT-02 Code Generation Report reviewed and approved by the user on 2026-06-16.
- BOLT-02 Test Results reviewed and approved by the user on 2026-06-16.
- BOLT-03 / UNIT-02 Code Generation follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt03.md` on 2026-06-16.
- BOLT-03 / UNIT-02 Code Generation follow-up plan approved by the user on 2026-06-16.
- BOLT-03 implementation completed with retrieval intent, token budget, deterministic estimator, lifecycle-aware ranking, startup context pack builder, and BOLT-03 tests.
- BOLT-03 Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt03.md`.
- BOLT-03 Test Results created in `docs/02-construction/04-code-generation/test_results_bolt03.md`.
- BOLT-03 Code Generation Report reviewed and approved by the user on 2026-06-16.
- BOLT-03 Test Results reviewed and approved by the user on 2026-06-16.
- BOLT-04 / UNIT-04 Code Generation follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt04.md` on 2026-06-16.
- BOLT-04 / UNIT-04 Code Generation follow-up plan approved by the user on 2026-06-16.
- BOLT-04 implementation completed with governance metadata, provenance validation, sensitive-content guard, retention validation, governed write decisions, memory operation decisions, and BOLT-04 tests.
- BOLT-04 Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt04.md`.
- BOLT-04 Test Results created in `docs/02-construction/04-code-generation/test_results_bolt04.md`.
- BOLT-04 Code Generation Report reviewed and approved by the user on 2026-06-16.
- BOLT-04 Test Results reviewed and approved by the user on 2026-06-16.
- BOLT-05 / UNIT-03 Code Generation follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt05.md` on 2026-06-16.
- BOLT-05 / UNIT-03 Code Generation follow-up plan approved by the user on 2026-07-06.
- BOLT-05 implementation completed with framework-agnostic capability contracts, invocation context, request/response envelopes, MCP/CLI/local API descriptor maps, capability router foundation, governance-required operation routing, and memory job lifecycle types.
- BOLT-05 tests added for capability validation, descriptor consistency, governance-required flags, local projection query/inspect routing, memory job observations, and no-transport dependency boundaries.
- BOLT-05 final verification passed on 2026-07-06: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 33 tests.
- BOLT-05 Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt05.md`.
- BOLT-05 Test Results created in `docs/02-construction/04-code-generation/test_results_bolt05.md`.
- BOLT-05 Code Generation Report reviewed and approved by the user on 2026-07-06.
- BOLT-05 Test Results reviewed and approved by the user on 2026-07-06.
- BOLT-06 / UNIT-03 Code Generation follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt06.md` on 2026-07-06.
- BOLT-06 / UNIT-03 Code Generation follow-up plan approved by the user on 2026-07-27.
- BOLT-06 implementation completed with an optional runtime adapter binding and status model, runtime trigger descriptors, adapter policy validation with no-iii fallback, trigger-to-capability mapping through the Capability Router, an in-process trigger coordinator, and job observation publication contracts.
- BOLT-06 tests added for trigger/capability consistency, no-iii fallback across all adapter states, binding validation and status transitions, trigger routing and rejection, governance preservation for adapter-triggered deletes, observation redaction and target-scope digesting, and a no-concrete-iii dependency/import boundary.
- BOLT-06 final verification passed on 2026-07-27: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 41 tests and no failures.
- No new runtime or dev dependency was added for BOLT-06; the iii SDK remains uninstalled by design.
- BOLT-06 Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt06.md`.
- BOLT-06 Test Results created in `docs/02-construction/04-code-generation/test_results_bolt06.md`.
- BOLT-06 Code Generation Report reviewed and approved by the user on 2026-07-27.
- BOLT-06 Test Results reviewed and approved by the user on 2026-07-27.
- LD-UNIT05-OQ-002 resolved by the user on 2026-07-27: semantic retrieval enters v1 as a disabled extension boundary with ports, fusion, conflict, and delete-cleanup contracts and no embedding provider. A documentation-only design note and a plan deviation toward a concrete MCP/CLI surface were considered and not selected.
- BOLT-07 / UNIT-05 Code Generation follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt07.md` on 2026-07-27.
- BOLT-07 / UNIT-05 Code Generation follow-up plan approved by the user on 2026-07-27.
- BOLT-07 implementation completed with a disabled-by-default semantic retrieval profile, `SemanticProviderPort` and `SemanticIndexPort` interfaces, opaque semantic representations, secondary-only semantic signals, governed-reference and eligibility validation, lifecycle-authoritative fusion, conflict assessment, delete-aware semantic cleanup, and an optional extension coordinator for degraded modes.
- BOLT-07 tests added for profile transitions, disabled-mode pack equality with baseline, degraded fallbacks, candidate rejection rules, fusion authority, baseline annotation, conflict outcomes, delete cleanup idempotency and incompleteness, port-backed recall, and a no-embedding-dependency boundary.
- BOLT-07 final verification passed on 2026-07-27: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 51 tests and no failures.
- No new runtime or dev dependency was added for BOLT-07; no embedding provider or vector index was selected, and no embedding or vector was computed or stored.
- BOLT-07 Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt07.md`.
- BOLT-07 Test Results created in `docs/02-construction/04-code-generation/test_results_bolt07.md`.
- Repository gap review on 2026-07-27 found no filesystem access in `src/`, an in-memory-by-default SQLite projection, no JSONL event log on disk, no `bin` entrypoint, and no integration or performance evidence. No approved Must story is deliverable end to end.
- V1 release plan created in `docs/02-construction/02-design-plan/v1_release_plan.md` on 2026-07-27, proposing BOLT-08 through BOLT-14 as a bolts plan addendum.
- V1 release plan approved by the user on 2026-07-27 with no scope option cut; the full BOLT-08 through BOLT-14 scope stands.
- Bolts plan addendum created in `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md`, recording BOLT-08 through BOLT-14 without modifying the approved `bolts_plan.md`, per NFR-004.
- BOLT-08 / UNIT-02 Code Generation follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08.md` on 2026-07-27. Pending human review.
- BOLT-12 MCP server work is additionally gated behind a new ADR-006 technology decision, because `@modelcontextprotocol/sdk` would be the project's first runtime dependency.
- BOLT-08 / UNIT-02 Code Generation follow-up plan approved by the user on 2026-07-27.
- BOLT-08 implementation completed with the first filesystem access in the package: a read-only workspace scanner, declarative include and exclude rules, deterministic content-hash versioning, approval-status extraction, template approval suppression, durable source observation production, and typed skip reporting.
- BOLT-08 tests added for scan rules, version determinism across line endings, approval extraction, tree scanning with exclusions, template suppression, resilience, size limits, a real-tree scan of this repository, and a no-filesystem-write guarantee.
- BOLT-08 final verification passed on 2026-07-27: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 59 tests and no failures.
- BOLT-08 real-tree scan of this repository produced 100 observations from 152 candidates. 52 candidates match no BOLT-01 classification rule, including `PROJECT_STATUS.md` and all ten UNIT domain-design and logical-design documents.
- Three defects surfaced by the real-tree scan were fixed within BOLT-08 scope: root-level directories were unclassifiable because classifier path rules assume a leading slash, the approval section over-captured body content, and template placeholder text was read as a real verdict.
- No new runtime or dev dependency was added for BOLT-08; `node:fs` and `node:crypto` keep the domain import boundary tests passing unchanged.
- BOLT-08 Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt08.md`.
- BOLT-08 Test Results created in `docs/02-construction/04-code-generation/test_results_bolt08.md`.
- BOLT-08a / UNIT-01 + UNIT-02 classification-coverage follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08a.md` on 2026-07-27.
- BOLT-07 Code Generation Report and Test Results reviewed and approved by the user on 2026-07-27.
- BOLT-08 Code Generation Report and Test Results reviewed and approved by the user on 2026-07-27.
- BOLT-08a follow-up plan approved by the user on 2026-07-27, including its decision to map `PROJECT_STATUS.md` to `SessionHandoffMemory` rather than add a fourteenth memory category. Recorded in `docs/02-construction/02-design-plan/bolt07_bolt08_review_approval_plan.md`.
- BOLT-08a implementation completed: leading-slash classifier path anchoring, a domain-design rule mapping `unit_*` documents to `DecisionMemory` with `UnitMemory` secondary, a `PROJECT_STATUS.md` rule mapping to `SessionHandoffMemory` with `PlanMemory` secondary, a `non_memory` scan rule kind with an `excluded_by_rule` skip reason, and seven non-memory rules.
- BOLT-08a classification coverage reached zero unclassified candidates: 156 candidates, 115 observations, 41 `excluded_by_rule`, 0 `unclassified_artifact`. `unclassified_artifact` is now an alarm rather than a routine outcome, enforced by test.
- BOLT-08a added no memory category; `V1_MEMORY_CATEGORY_NAMES` remains at 13 entries, asserted by test. No previously classified artifact changed category, asserted by a 13-entry before-baseline table.
- BOLT-08a final verification passed on 2026-07-27: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 66 tests and no failures.
- Amendment 1 appended to `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` recording BOLT-08a without modifying existing entries, per NFR-004.
- BOLT-08a Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt08a.md`.
- BOLT-08a Test Results created in `docs/02-construction/04-code-generation/test_results_bolt08a.md`.
- Directory-README question resolved by the user on 2026-07-27: all twenty README files are non-memory, so the ten that currently classify leave memory.
- BOLT-08b / UNIT-02 follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08b.md` on 2026-07-27. Pending human review.
- Measurement while planning BOLT-08b found that 26 classified artifacts match some non-memory rule, not 10. Precedence is therefore per rule rather than a global ordering change.
- BOLT-08b second decision point answered by the user on 2026-07-27: both recommendations accepted, so the 15 classifying `*_TEMPLATE.md` files also lose memory status while `docs/00-methodology/setup_validation.md` is retained.
- BOLT-08b implementation completed: an opt-in `overridesClassification` rule flag honoured before a file is opened, a `fileName` exact base-name matcher, `findOverridingNonMemoryRule` so rule order cannot mask precedence, and precedence on the README and template rules only.
- BOLT-08b coverage: 161 candidates, 95 observations, 66 `excluded_by_rule`, 0 `unclassified_artifact`. Twenty-five artifacts left memory, being 10 READMEs and 15 templates. These numbers supersede the BOLT-08a coverage tables, which were left untouched because they are still under review.
- BOLT-08b retained `setup_validation.md` without narrowing the methodology rule, because a non-overriding rule already yields to classification. The classifier itself was not touched, proven by the BOLT-08a unchanged-baseline table still passing.
- BOLT-08b final verification passed on 2026-07-27: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 73 tests and no failures.
- Amendment 2 appended to `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` recording BOLT-08b without modifying existing entries or Amendment 1, per NFR-004.
- BOLT-08b Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt08b.md`.
- BOLT-08b Test Results created in `docs/02-construction/04-code-generation/test_results_bolt08b.md`.
- BOLT-08a and BOLT-08b Code Generation Reports and Test Results reviewed and approved by the user on 2026-07-27, recorded in `docs/02-construction/02-design-plan/bolt08a_bolt08b_review_approval_plan.md`. The BOLT-08a coverage tables were approved as a record of that slice and carry a superseded-measurement note rather than being rewritten, per NFR-004.
- BOLT-09 / UNIT-02 Code Generation follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt09.md` on 2026-07-27.
- All five BOLT-09 open questions answered by the user on 2026-07-27: `.agent-memory/` sits directly under the workspace root; `.gitignore` gains that directory; a malformed JSONL line is skipped with a warning; Markdown holds content authority while the event log holds history authority including deliberate removals; and rebuild never rewrites the log, only appends.
- Recorded for BOLT-11: because rebuild cannot reconstruct a lost `memory_removed` event from the filesystem, partial cleanup combined with a lost removal event could let deleted memory return. The BOLT-11 plan must address this rather than leaving it to BOLT-14. See NFR-011 and R-005.
- BOLT-09 / UNIT-02 Code Generation follow-up plan approved by the user on 2026-07-27.
- **BOLT-09 implementation completed: workspace memory now survives process exit.** Added `.agent-memory/` layout resolution with write guards, an append-only JSONL event log with per-line validation, a file-backed SQLite index, and a `WorkspaceMemoryStore` facade that scans, replays applicable events, rebuilds, and records removals.
- BOLT-09 designed out a resurrection hazard found by reading `applyMemoryEvent` before implementing: a `memory_indexed` event re-creates a projection, so appending one per artifact per rebuild would have resurrected deleted memory. The workspace sync therefore appends `memory_removed` only, and events whose source path the current scan can see are filtered out before replay. Markdown holds content authority; the log holds history authority.
- BOLT-09 appended `.agent-memory/` to `.gitignore`, the only `.gitignore` change authorized.
- BOLT-09 tests added for layout and write guards, append-only behaviour, malformed-line tolerance, cross-process persistence via a separately spawned Node process, delete-then-rebuild determinism, stale removal, restoration precedence, warning status propagation, write containment, and self-exclusion.
- BOLT-09 final verification passed on 2026-07-27: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 83 tests and no failures.
- BOLT-09 smoke run against this repository persisted 101 projections with status `completed`, zero warnings, and a ~1.5 MB index. No event log was created, because nothing had been removed.
- BOLT-09 Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt09.md`.
- BOLT-09 Test Results created in `docs/02-construction/04-code-generation/test_results_bolt09.md`.
- BOLT-10 / UNIT-03 CLI operator surface follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt10.md` on 2026-07-27. Pending human review, and additionally gated behind approval of the BOLT-09 review artifacts.
- The BOLT-10 plan raises two open questions: whether a read command should rebuild automatically when the index is missing, and whether the unexecuted `export`, `delete`, and `write` commands should still appear in `--help`.
- The BOLT-10 plan records an exit-code scheme in which `accepted` maps to a non-zero "not available yet" code. Once `rebuild_index` has a real handler, `accepted` only occurs for capabilities that were validated but never executed, so exiting zero there would tell an operator an export succeeded when no file was written.
- BOLT-09 Code Generation Report and Test Results reviewed and approved by the user on 2026-07-27.
- BOLT-10 follow-up plan approved by the user on 2026-07-27, with both open questions answered as recommended: read commands never rebuild automatically, and unavailable commands stay visible in `--help` with an honest marker.
- **BOLT-10 implementation completed: Agent-memory is now runnable.** Added the `agent-memory` bin, an `engines.node >=22.5.0` declaration, `parseArgs` command handling, descriptor-generated help, and Capability Router handlers for `get_context` and `rebuild_index`, which previously returned `not_implemented` and an unexecuted `accepted`.
- BOLT-10 delivered `rebuild`, `context`, `query`, and `inspect` as working commands, and `export`, `delete`, and `write` as visible commands that refuse with exit 3 and the message `Nothing was changed.`
- BOLT-10 added required-argument validation derived from the approved BOLT-05 input fields, after a test showed a missing argument surfacing as `not_implemented` rather than a usage error.
- BOLT-10 final verification passed on 2026-07-27: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 96 tests and no failures.
- BOLT-10 Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt10.md`.
- BOLT-10 Test Results created in `docs/02-construction/04-code-generation/test_results_bolt10.md`.
- Supersession marking applied on 2026-07-27 (the "T1" action). `code_generation_report_bolt08a.md` now carries the word "superseded" in its approval verdict paragraph, which the BOLT-08 extractor classifies as `historical` rather than `approved`. `test_results_bolt08a.md` already did so incidentally; the pair is now deliberate and consistent.
- Measured effect of that marking, with no code change: on a "classification coverage" query the current BOLT-08b report and test results rank 3rd and 5th at score 168, while the superseded BOLT-08a pair ranks 46th and 47th at score 115. A 53-point, 43-position demotion that keeps stale coverage numbers out of retrieval. Blast radius verified: exactly two artifacts became `historical` and nothing else changed.
- The BOLT-03 ranking gives `approved` +50 and `historical` 0, so supersession currently demotes by omission rather than by explicit penalty. An explicit `historical` penalty remains an open improvement.
- Supersession is still expressed as prose in an approval sentence, not as a typed lifecycle edge. US-003 covers `supersedes` relationships but they are unimplemented, so nothing links the superseded artifact to the one that replaced it as data.
- Supersession convention captured in the two Code Generation templates on 2026-07-27. `test_results_TEMPLATE.md` gained the superseded placeholder form and a retrieval note; `code_generation_report_TEMPLATE.md` gained a `## Approval Status` section, which had been missing entirely even though every real report carries one. Both templates remain `non-memory:template`, so neither enters memory. `docs/00-methodology/` was rejected as the primary home because that directory is declared non-memory and an agent would never retrieve the convention from it.
- The convention still depends on the word landing in the verdict paragraph, which is the trap that caused the original inconsistency. Widening the extractor to accept "superseded by" anywhere in the `## Approval Status` section would remove it, and is verified safe because the phrase occurs exactly twice in the repository, both intentional. This is folded into the proposed BOLT-10a scope.
- BOLT-10a / UNIT-02 + UNIT-01 context-packing follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt10a.md` on 2026-07-27. Pending human review, and additionally gated behind approval of the BOLT-10 review artifacts.
- BOLT-10a changes the unit of context packing from the whole document to the section, adds a per-section cap with direction-aware truncation, reserves budget per lifecycle category, and folds in the approval-extractor widening. It carries a falsifiable acceptance criterion: the pack must contain the `Project Goal`, `Current Status`, and `Next Steps` sections of `PROJECT_STATUS.md` within 2000 tokens.
- BOLT-10a raises two open questions: how to stop penalising the continuity document for being `draft`, and whether to add a 20,000-token expanded retrieval mode wired to the existing `audit` and `handoff` modes.
- BOLT-10a changes approved BOLT-03 behaviour, so it plans a before-baseline and an unchanged-behaviour test, mirroring the guards BOLT-08a used when it extended the approved classifier.
- BOLT-10a follow-up plan approved by the user on 2026-07-27 with both open questions answered as recommended: the `draft` penalty no longer applies to `SessionHandoffMemory`, and a 20,000-token budget was added for the `handoff` and `audit` modes while `startup` stays capped at 2000.
- **BOLT-10a implementation completed, and US-001 is now demonstrable.** Context packing works on Markdown sections rather than whole documents, with a per-item token cap, direction-aware truncation, category reservations with spill-over, and heading-level ranking signals.
- BOLT-10a measured outcome against this repository: the startup pack went from **1 item to 13**, at 1982 of 2000 tokens, and now carries `PROJECT_STATUS.md § Project Goal`, `§ Current Status`, and `§ Next Steps`. The `audit` mode returns 84 items at 19,967 of 20,000 tokens.
- BOLT-10a also widened the approval extractor so `superseded by` is honoured anywhere in the `## Approval Status` section, removing the paragraph-placement trap recorded earlier.
- BOLT-10a fixed two defects found during development: sections were initially packed in document order, so `Recent Decisions` displaced `Next Steps`, which produced the heading-signal ranking; and the section cap did not bound the packed item because the provenance header was added after capping.
- BOLT-10a final verification passed on 2026-07-27: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 106 tests and no failures. All four original BOLT-03 tests pass unmodified.
- Amendment 3 appended to `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` recording BOLT-10a, leaving existing entries and Amendments 1 and 2 unchanged.
- BOLT-10a Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt10a.md`.
- BOLT-10a Test Results created in `docs/02-construction/04-code-generation/test_results_bolt10a.md`.
- BOLT-10 and BOLT-10a Code Generation Reports and Test Results reviewed and approved by the user on 2026-07-27, recorded in `docs/02-construction/02-design-plan/bolt10_bolt10a_review_approval_plan.md`. The BOLT-10 follow-ups that BOLT-10a resolved were annotated as resolved rather than deleted.
- BOLT-11 / UNIT-04 governed delete and export follow-up plan created in `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt11.md` on 2026-07-27. Pending human review.
- The BOLT-11 plan surfaces a decision BOLT-09 left open. US-006 AC-003 requires deleted memory to leave the **active retrieval indexes, lifecycle edges, and vector indexes**; it does not require deleting the durable Markdown artifact, and NFR-004 says an approved artifact must remain a stable record. But BOLT-09 makes rebuild ignore a removal event whenever the scan still sees the path, so purging only the index lets the next rebuild resurrect the memory. The plan recommends a `memory_deleted` tombstone that rebuild honours regardless of scan presence, which also closes the resurrection path BOLT-09 recorded.
- The BOLT-11 plan notes that the `lifecycle-edges` cleanup target is currently vacuous: `EDGE_TYPE_NAMES` and `LifecycleEdge` exist from BOLT-01, including a `supersedes` type, but no edge is ever extracted or persisted.
- All three BOLT-11 open questions answered by the user on 2026-07-27, adopting the recommendations. A governed delete records a `memory_deleted` tombstone and leaves the Markdown artifact on disk; export emits a single JSON document with provenance; export is implemented before delete.
- Consequence of the Q1 answer, recorded so it is not a surprise: **`agent-memory delete` removes memory, not the repository file.** The source text stays readable on disk, and the CLI must say so plainly. Deleting or modifying any Markdown artifact is explicitly not authorized, and a durable-source safety test will enforce it.
- BOLT-11 follow-up plan approved by the user on 2026-08-26.
- **BOLT-11 implementation completed.** Governed export writes one caller-selected JSON document containing exact target records, provenance, the operation request and decision, and an export timestamp.
- Governed delete appends a `memory_deleted` tombstone, removes the active SQLite projections, invokes the BOLT-07 semantic cleanup contract, and leaves every Markdown source unchanged. Rebuild honours deliberate tombstones even while the source file remains visible.
- Delete cleanup reports explicit outcomes for `durable-record`, `local-index`, `lifecycle-edges`, and `future-vector-index`. Lifecycle-edge cleanup is `not_applicable` until US-003; partial semantic or projection cleanup is `incomplete` and retryable.
- CLI `export` and confirmation-gated `delete` are enabled. Delete output states that source files were not modified or removed. Governed `write` remains unavailable.
- BOLT-11 final verification passed on 2026-08-26: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 112 tests and no failures. No dependency was added.
- BOLT-11 Code Generation Report created in `docs/02-construction/04-code-generation/code_generation_report_bolt11.md`.
- BOLT-11 Test Results created in `docs/02-construction/04-code-generation/test_results_bolt11.md`.
- BOLT-11 Code Generation Report and Test Results reviewed and approved by the user on 2026-08-26, recorded in `docs/02-construction/02-design-plan/bolt11_review_approval_plan.md`.
- ADR-006 technology-decision planning started on 2026-08-26. `technology_decision_followup_plan_adr006.md` defines an approval-gated comparison of the official TypeScript MCP SDK, a dependency-free stdio JSON-RPC implementation, and deferral.
- User selected Candidate A, the official TypeScript MCP SDK, on 2026-08-26 for ADR approval consideration. The selection is non-binding until the decision plan is approved, primary-source comparison is completed, and ADR-006 receives explicit approval. No dependency or BOLT-12 code is authorized yet.
- ADR-006 technology-decision follow-up plan approved by the user on 2026-08-26. Primary-source research and comparison are authorized; dependency installation and BOLT-12 implementation are not.
- ADR-006 primary-source comparison completed on 2026-08-26. The selected Candidate A is refined to the current stable v2 package `@modelcontextprotocol/server@2.0.0`, not legacy `@modelcontextprotocol/sdk`. The TypeScript SDK is Tier 1, supports modern and 2025-era stdio clients, requires Node >=20, and has two runtime dependencies. ADR-006 is appended as Proposed with High confidence and High reversibility; final user approval is pending.
- ADR-006 approved by the user on 2026-08-26. BOLT-12 planning may use `@modelcontextprotocol/server@2.0.0` with the recorded conditions. No dependency installation or implementation is authorized until a separate BOLT-12 Code Generation follow-up plan is explicitly approved.
- BOLT-12 / UNIT-03 Code Generation follow-up plan created on 2026-08-26. It proposes the official SDK v2 stdio adapter, descriptor-generated tools, shared CLI/MCP capability assembly, domain-scoped boundary enforcement, real-host validation, and explicit concurrency handling. Three reviewer decisions remain open; no dependency or implementation is authorized yet.
- BOLT-12 follow-up plan approved by the user on 2026-08-26 with recommendations A/A/A: high-level Zod registration, VS Code plus official client/Inspector acceptance, and a shared cross-process workspace mutation lock.
- **BOLT-12 implementation completed.** Added the official dual-era stdio MCP server, seven descriptor-generated tools and strict schemas, shared CLI/MCP capability assembly, cross-process mutation locking, governance-preserving error mapping, and an `agent-memory-mcp` executable.
- BOLT-12 introduced exact runtime dependencies `@modelcontextprotocol/server@2.0.0` and `zod@4.2.0`, plus exact dev dependency `@modelcontextprotocol/client@2.0.0`. Production resolves only official MCP core and deduplicated Zod; no vulnerability or install-script issue was found.
- Delete confirmation evidence is now required by the shared capability descriptor, preventing MCP from bypassing CLI destructive-action confirmation semantics.
- BOLT-12 final automated verification passed on 2026-08-26: build and strict typecheck clean, 120 tests passed, zero audit vulnerabilities. Legacy and modern stdio clients both pass, child shutdown is verified, and cross-process lock contention is retryable.
- Real-workspace MCP command smoke passed with seven tools and a 13-item startup context pack at 1993 of 2000 tokens. `.vscode/mcp.json` is present; interactive VS Code trust and Agent-mode tool approval remain pending human execution.
- BOLT-12 Code Generation Report and Test Results created and pending human review.
- BOLT-12 manual VS Code UI smoke reported PASS by the user on 2026-09-17; report and test-results approval remains pending.
- BOLT-12 Code Generation Report approved by the user on 2026-09-17; Test Results approval remains pending.
- BOLT-12 Test Results also approved by the user on 2026-09-17. The BOLT-12 report-pair review gate is complete.
- User requested a new plan on 2026-09-22 to defer BOLT-13 and proceed with BOLT-14; the request is recorded as planning intent, not yet an approved scope change.
- `v1_release_scope_addendum_bolt13_defer_bolt14.md` proposes preserving the historical V1 plan, appending a new scope amendment only after approval, deferring US-005 AC-003, and targeting an honest `0.1 MCP/CLI preview` rather than claiming full V1.
- `code_generation_followup_plan_bolt14.md` proposes evidence-first release verification, 1,000/10,000 scale measurement, end-to-end CLI/MCP/export/delete coverage, and a project-specific README. No BOLT-14 execution is authorized yet.
- User selected SCOPE-Q1/Q2/Q3 as A/A/A on 2026-09-22: target a `0.1 MCP/CLI preview`, reopen BOLT-13 only for a named consumer, and stop/report discovered feature gaps behind separate approval. This selection does not approve BOLT-14 decisions or execution.
- User selected BOLT-14-Q1/Q2/Q3 as A/A/A on 2026-09-22: use 1,000 lifecycle artifacts plus 10,000 valid event records, measure fresh-process retrieval from a persisted index, and stop/report feature gaps behind separate approval. Both plans still require explicit execution approval.
- User explicitly approved both the BOLT-13 deferral scope addendum plan and BOLT-14 follow-up plan on 2026-09-22.
- Amendment 4 appended to `bolts_plan_addendum_v1_release.md`: BOLT-13 is deferred until a named consumer, BOLT-14 targets a `0.1 MCP/CLI preview`, and full V1 remains blocked on US-005 AC-003.
- BOLT-14 release-gap audit found that US-003 lifecycle edge types exist but extraction, persistence, and trace queries do not; the criterion was stopped rather than implemented inside the verification bolt, per approved Q3-A.
- BOLT-14 added deterministic small and scale fixtures, fresh-process CLI acceptance, official MCP acceptance, export/delete restart-and-rebuild verification, and focused `test:v1-readiness` / `test:v1-scale` scripts with no new dependency.
- BOLT-14 scale evidence passed on 2026-09-22 with 1,000 lifecycle artifacts, 10,000 valid event records, and 7,000 final projections. Fresh CLI samples were 175.30ms, 186.13ms, and 189.60ms; fresh MCP connect plus retrieval was 555.96ms, below the 10-second target. Rebuild took 35,885.55ms and is reported separately per Q2-A.
- BOLT-14 final automated verification passed: build and strict typecheck clean, 120 existing regression tests passed, 2 focused readiness tests passed, 1 scale test passed, and production/full audits reported zero vulnerabilities.
- Root `README.md` is now Agent-memory-specific and documents CLI, MCP, storage, governance, verification, deferred API/full-V1 boundary, and known limitations, closing the template-documentation portion of R-014.
- BOLT-14 Code Generation Report and Test Results created and pending human review. The evidence verdict is `preview not ready` because US-003 remains a retained product-capability gap; full V1 also remains blocked by deferred US-005 AC-003.
- BOLT-14 Code Generation Report and Test Results approved by the user on 2026-09-23. The evidence-review gate is complete; approval preserves the `preview not ready` verdict and does not resolve or defer US-003.
- User selected US-003 deferral from the `0.1 MCP/CLI preview` on 2026-09-23. `preview_scope_addendum_us003_defer.md` records the proposed consequences; the deferral is not binding until that plan is explicitly approved.
- User approved `preview_scope_addendum_us003_defer.md` on 2026-09-23. Amendment 5 now defers US-003 from the preview while retaining it for full V1.
- `bolt14_release_verdict_addendum_us003_deferred.md` supersedes only the current preview verdict: all retained preview evidence passes, so the `0.1 MCP/CLI preview` is evidence-ready in the current working tree. No release, packaging, tag, publication, or distribution action was performed.
- Preview baseline was committed as `28dd9b2` (`0.1 MCP/CLI preview`); release, tagging, and publication remain intentionally deferred.
- `code_generation_followup_plan_unit02_port_cleanup.md` proposes resolving the next roadmap item by removing the unused, Promise-based `DurableSourceReader` and `MemoryEventLogReader` declarations. No cleanup implementation is authorized yet.
- User selected UNIT02-PORT-Q1 Option A and approved the UNIT-02 port cleanup plan on 2026-09-23. The narrow behavior-preserving cleanup is in progress.
- UNIT-02 port cleanup completed on 2026-09-23: removed only the unused `DurableSourceReader` and `MemoryEventLogReader` declarations; no runtime behavior, dependency, package, release, tag, or publication change was made.
- Cleanup verification passed: build/typecheck clean, focused UNIT-02 suites 25/25, full regression 120/120, preview readiness 2/2, and zero source/test references to the removed types. Report pair is pending human review.
- UNIT-02 cleanup Code Generation Report and Test Results approved by the user on 2026-09-23. The cleanup review gate is complete; the cleanup changes remain uncommitted.
- **US-001 is not yet satisfiable on a realistic workspace, discovered by running the finished CLI against this repository.** `agent-memory context` returns one artifact and omits 99, without the goal, phase, blockers, or next steps. `PROJECT_STATUS.md` is ~6459 tokens against a 2000-token budget and ranks 9th of 105, and the top two candidates are 3233 and 6359 tokens. `buildContextPack` includes whole documents, so the first artifact that fits consumes most of the budget. This is a BOLT-03 design gap that BOLT-10 surfaced rather than caused.

---

## Next Steps

1. Commit the approved UNIT-02 cleanup and its review artifacts when ready.
2. Implement US-003 before full V1 through a separate approved plan.
3. Reopen BOLT-13 only for a named consumer with concrete transport and trust-boundary requirements.
4. Keep release, tagging, deployment, and npm publication deferred.

---

## Risks / Blockers

- **Distribution blocker:** The evidence-ready implementation remains in a dirty, largely uncommitted working tree; a fresh clone does not reproduce the current preview baseline.
- **Full-V1 blockers:** US-003 remains unimplemented and BOLT-13 / US-005 AC-003 remains deferred until a named local API consumer. No HTTP or gRPC transport is currently authorized.
- BOLT-14 report/test artifacts and the current preview-verdict addendum are approved evidence records; they do not constitute a release or production-readiness claim.
- Scale rebuild took 35.9 seconds for 1,000 lifecycle artifacts and 10,000 events. Startup retrieval passed the approved target, but rebuild performance is an operability observation for future profiling.
- BOLT-11 tombstones have no supported restore/undo flow.
- Governed `write_memory` execution remains unavailable.
- The `node:sqlite` experimental warning remains visible on stderr, and the CLI has no `--version` flag.
- The event log has no compaction and may grow without bound in a high-churn workspace.
- `memory.consolidate` remains a descriptor-only runtime trigger without a domain execution port.
- Deployment, npm publication, hosted storage, multi-user tenancy, concrete iii integration, and embedding/vector providers remain outside the approved preview scope.
