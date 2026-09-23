# BOLT-14 Preview Release Gap Audit

**Project:** Agent-memory  
**Date:** 2026-09-22  
**Release Target:** `0.1 MCP/CLI preview`  
**Status:** Execution evidence in progress

## Purpose

Map every retained preview criterion to current evidence or an explicit gap before BOLT-14 adds verification tests. Per approved BOLT-14-Q3-A, this audit does not authorize product-feature fixes.

## Story And Surface Audit

| Criterion | Current Evidence | Audit State | BOLT-14 Action |
|-----------|------------------|-------------|----------------|
| US-001 startup context | BOLT-10a real-workspace pack and BOLT-12 MCP call carry goal, current status, and next steps within 2000 tokens. | Candidate pass | Reverify through fresh CLI and MCP processes and at approved scale. |
| US-002 lifecycle-aware indexing | Workspace source reader, classification coverage, non-memory precedence, and persisted projection tests pass. | Candidate pass | Reverify through a real file-to-index-to-context flow. |
| US-003 lifecycle relationships | Edge types exist, but no extractor, repository, persisted edge, or trace query exists. Governed delete reports lifecycle-edge cleanup as `not_applicable`. | **Capability gap** | Stop this criterion and require a separate approved implementation plan. Do not add edge persistence in BOLT-14. |
| US-004 local search/rebuild | CLI, file-backed SQLite, JSONL replay, restart persistence, and deterministic rebuild exist. | Candidate pass | Reverify through fresh processes and index deletion/rebuild. |
| US-005 AC-001 MCP | Official client and VS Code smoke are approved. | Candidate pass | Add release-level file-to-MCP-context evidence. |
| US-005 AC-002 CLI | Context/query/inspect/rebuild/export/delete commands exist. | Candidate pass | Add fresh-process preview acceptance. |
| US-005 AC-003 local API | BOLT-13 deferred by approved Amendment 4. | Explicitly deferred | Do not expose a listener or represent this criterion as passed. |
| US-006 export/delete | Governed portable export and tombstone deletion exist; source Markdown is preserved. | Candidate pass with US-003 caveat | Verify export contents and delete durability after restart/rebuild. |

## NFR And Risk Audit

| Criterion | Current Evidence | Audit State | BOLT-14 Action |
|-----------|------------------|-------------|----------------|
| NFR-001 retrieval <=10 seconds | Real-workspace context succeeds, but no isolated fresh-process benchmark is recorded. | Evidence missing | Measure multiple fresh retrievals from a persisted index. |
| NFR-002 / NFR-020 token bounds | Startup pack is capped at 2000 tokens; baseline used 1977/2000. | Candidate pass | Assert at small and scale fixtures. |
| NFR-003 / R-010 rebuildability | BOLT-09 restart and index-deletion tests pass. | Candidate pass | Reverify end to end with real files and events. |
| NFR-005 / NFR-019 local/no-hosted operation | CLI and MCP operate locally; local API clause is deferred. | Partial by approved scope | Document preview boundary in README and verdict. |
| NFR-009 1,000/10,000 scale | No approved-scale measurement exists. | Evidence missing | Generate the approved dataset and record rebuild/retrieval timings. |
| NFR-011 / R-005 deletion | Tombstone and active-index cleanup exist; semantic cleanup is explicit; lifecycle-edge target is vacuous. | Partial due US-003 gap | Verify implemented stores and report the edge limitation. |
| R-014 contributor confusion | Root README still describes the template. | Open | Replace README with Agent-memory preview instructions. |

## Baseline Evidence

- `npm run build`: pass.
- `npm run typecheck`: pass.
- `npm test`: 120 passed after rerun with child-process permission; the restricted run failed only at `spawnSync ... EPERM` before assertions.
- `npm audit --omit=dev`: 0 vulnerabilities.
- `npm audit`: 0 vulnerabilities.
- Real-workspace CLI context: completed, 1977/2000 estimated tokens, with Project Goal, Current Status, Next Steps, and provenance.

## Gap Disposition

US-003 lifecycle-edge extraction/persistence is a real product-capability gap and is outside approved BOLT-14 scope. The final preview verdict must remain `not ready` unless a later approved decision explicitly defers US-003 from the preview or a separate approved implementation slice closes it. BOLT-14 continues collecting independent evidence for all other criteria.
