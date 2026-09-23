# Preview Scope Addendum Plan - Defer US-003 Lifecycle Relationships

**Project:** Agent-memory  
**Date:** 2026-09-23  
**Skill:** `ai-dlc-technology-decision`  
**Approval Status:** Approved by the user on 2026-09-23

## Purpose

Explicitly defer US-003 lifecycle-edge extraction, persistence, and trace queries from the `0.1 MCP/CLI preview`, while preserving US-003 as required work for full V1.

The user selected deferral on 2026-09-23 after approving the BOLT-14 report pair. This plan makes the consequences reviewable before the decision becomes binding. It does not rewrite the approved BOLT-14 Code Generation Report, Test Results, V1 plan, or existing amendments.

No source, test, dependency, package, release, tag, deployment, or publication change is authorized by creation of this plan.

## Current Evidence

| Area | Current State |
|------|---------------|
| BOLT-14 automated evidence | Build/typecheck pass; 120 regression, 2 readiness, and 1 scale test pass; audits report 0 vulnerabilities. |
| BOLT-14 human review | Code Generation Report and Test Results approved on 2026-09-23. |
| Preview verdict | `Not ready` only because US-003 remains inside the retained preview criteria. |
| US-003 implementation | Edge types exist; extraction, persistence, relationship query, and non-vacuous cleanup do not. |
| Local API | BOLT-13 / US-005 AC-003 already deferred from the preview and still blocks full V1. |
| Distribution | Working tree is not committed/pushed or published; readiness does not mean released or distributable. |

## Selected Scope Decision

| Item | Selected Disposition | Consequence |
|------|----------------------|-------------|
| US-003 in `0.1 MCP/CLI preview` | Deferred | Relationship tracing is not a preview acceptance criterion. |
| US-003 in full V1 | Retained | Full V1 still requires relationship extraction, persistence, trace queries, and cleanup. |
| Existing edge types/contracts | Preserve | Do not delete or redesign the future extension boundary. |
| Delete lifecycle-edge cleanup | Continue reporting `not_applicable` | Do not represent vacuous cleanup as completed. |
| Approved BOLT-14 reports | Preserve unchanged | Their `preview not ready` verdict remains historical evidence from the pre-deferral scope. |
| Current preview verdict | Supersede through a new addendum | After approval, record `preview evidence ready in the current working tree`, not “released.” |
| Re-entry trigger | Before full V1, or when a named consumer needs relationship traceability | Requires a separate approved implementation plan. |

## User-Visible Consequences

The preview can still:

- rebuild lifecycle memory from Markdown and JSONL;
- provide bounded context through CLI and MCP;
- query and inspect memory with provenance;
- export and confirmation-delete memory;
- operate at the measured 1,000-artifact / 10,000-event scale.

The preview cannot:

- answer “which artifact supersedes this one?” as structured data;
- traverse story, risk, decision, plan, and downstream-artifact relationships;
- persist or query lifecycle edges;
- prove non-vacuous edge cleanup during delete.

These limitations must remain visible in README, status, and the verdict addendum.

## Artifacts Authorized Only After Approval

- Append Amendment 5 to `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` without editing earlier entries.
- Create `docs/02-construction/04-code-generation/bolt14_release_verdict_addendum_us003_deferred.md` that supersedes only the preview verdict, not the approved evidence or full-V1 criteria.
- Update `PROJECT_STATUS.md` to `preview evidence ready in working tree; release/distribution pending`.
- Update README preview-boundary language while preserving US-003 as a known limitation and full-V1 requirement.
- Rebuild the local workspace index and verify current context reflects the new scope.
- Write a scope-decision session log.

## Execution Checklist

- [x] Record the user's explicit selection to defer US-003 from the preview. (User / 2026-09-23.)
- [x] Inspect the approved BOLT-14 report pair, review record, current status, and README boundary.
- [x] Record explicit human approval of this scope addendum plan. (User / 2026-09-23.)
- [x] Append Amendment 5 without changing approved historical artifacts.
- [x] Create the preview-verdict addendum with exact evidence and limitations.
- [x] Update current status and README boundary.
- [x] Rebuild local memory and verify the new current context. (210 candidates, 144 indexed, 0 warnings; context 1994/2000 tokens.)
- [x] Record the execution session log.

## Release Boundary After Approval

- `0.1 MCP/CLI preview`: evidence-ready in the current working tree after the verdict addendum is recorded.
- Preview release/distribution: still pending clean commit/history, any chosen release packaging, and applicable approval.
- Full V1: not ready; still blocked by US-003 and deferred BOLT-13 / US-005 AC-003.
- Production/team readiness: not claimed.

## Approval Gate

- The user's deferral instruction records the selected scope outcome but does not approve an unseen plan automatically.
- Execution requires explicit approval of this plan after review.
- Approval authorizes only Amendment 5, the verdict addendum, current README/status updates, local index refresh, and session logging.
- It does not authorize US-003 implementation, BOLT-13, HTTP/gRPC, new dependencies, source/test changes, deployment, publication, commits, tags, or pushes.

## Execution Notes

- 2026-09-23: Plan created after the user explicitly selected US-003 deferral from the preview scope. No binding addendum, verdict change, implementation, or release action was performed.
- 2026-09-23: User explicitly approved this plan. Amendment 5, the preview-verdict addendum, current documentation updates, local index refresh, and session logging are authorized; implementation and release actions remain out of scope.
- 2026-09-23: Amendment 5 and the preview-verdict addendum were recorded. README/status now state evidence-ready working-tree scope; local rebuild completed with 210 candidates, 144 indexed, zero warnings, and current context at 1994/2000 tokens.
