# V1 Release Scope Addendum Plan - Defer BOLT-13 And Rebaseline BOLT-14

**Project:** Agent-memory  
**Date:** 2026-09-22  
**Skills:** `ai-dlc-technology-decision`, `ai-dlc-code-generation`  
**Approval Status:** Approved by the user on 2026-09-22 with SCOPE A/A/A

## Purpose

Propose an approval-gated change to the approved V1 release track: defer the BOLT-13 Local HTTP API until a concrete local HTTP consumer exists, and rebaseline BOLT-14 to verify an honest MCP-and-CLI preview rather than claim the currently unmet local-API acceptance criterion.

This plan does not rewrite `v1_release_plan.md` or any existing entry in `bolts_plan_addendum_v1_release.md`. Those files remain historical decision records. If this plan is approved, the new state will be recorded through an append-only Amendment 4, current-status updates, BOLT-14 implementation evidence, and release documentation.

No BOLT-13 or BOLT-14 implementation is authorized by creation of this plan.

## Current Baseline

| Area | Current State | Consequence |
|------|---------------|-------------|
| BOLT-11 | Governed delete/export implemented and reviewed. | BOLT-14 can verify real destructive and export effects. |
| BOLT-12 | MCP surface implemented, automated checks pass, VS Code smoke passed, review artifacts approved. | Agent-facing acceptance is available for release verification. |
| BOLT-13 | Planned only; no follow-up plan, HTTP server, executable, tests, or reports exist. | US-005 AC-003 and the original three-surface V1 exit criterion are unmet. |
| BOLT-14 | High-level bolt definition only; no follow-up plan or execution exists. | Release readiness still needs approval-gated implementation. |
| README | Still describes the AI-DLC project template. | R-014 remains open and new contributors receive incorrect product guidance. |
| Performance evidence | NFR-001 latency and NFR-009 scale are explicitly unmeasured. | No full release-readiness claim is currently supported. |

## Requested Scope Change

The user requested BOLT-13 deferral on 2026-09-22 and asked for an updated BOLT-14 plan. The request establishes planning intent, but the following disposition becomes binding only after this plan and the companion BOLT-14 follow-up plan are explicitly approved.

| Item | Proposed Disposition | Rationale |
|------|----------------------|-----------|
| BOLT-13 | `Deferred` | MCP covers agent access and CLI covers human/operator access; no named HTTP consumer currently justifies another maintained surface. |
| HTTP descriptors | Preserve | Existing framework-agnostic descriptors keep the future adapter contract visible without opening a listener. |
| HTTP implementation | Do not create | No `node:http` server, port, executable, route tests, CORS policy, or HTTP status mapping in this release slice. |
| US-005 AC-003 | Explicitly deferred | Do not represent the local API acceptance criterion as passed. |
| NFR-005 / NFR-019 wording | Partially satisfied by MCP/CLI local operation; local API clause deferred | Local and no-hosted-infrastructure behavior remains proven, but the named local API surface is absent. |
| BOLT-14 | Rebaseline to MCP/CLI preview readiness | Preserve release evidence work without mislabeling a release with a known Must gap as full V1. |
| Full V1 | Not declared | Full V1 remains blocked until BOLT-13 or an approved replacement satisfies US-005 AC-003. |

## Human Decision Points

### SCOPE-Q1 - Release Label

| Option | Trade-Off |
|--------|-----------|
| **A. `0.1 MCP/CLI preview` (recommended)** | Honest about the deferred Must criterion, matches the original V1 plan's preview option, and lets BOLT-14 produce useful readiness evidence without claiming full V1. |
| B. `V1 with documented Must gap` | Keeps the V1 label but weakens the meaning of the approved V1 exit criteria and is not recommended. |

**Recommendation:** Option A.

**Decision:** Option A selected by the user on 2026-09-22. Target the `0.1 MCP/CLI preview`; do not claim full V1 while US-005 AC-003 is deferred.

### SCOPE-Q2 - BOLT-13 Re-entry Trigger

| Option | Trade-Off |
|--------|-----------|
| **A. Named consumer trigger (recommended)** | Reopen BOLT-13 only when a dashboard, IDE extension, local service, or other concrete consumer requires HTTP. Avoids speculative surface maintenance. |
| B. Fixed post-preview milestone | Guarantees the API is revisited, but may still build it without a user. |

**Recommendation:** Option A. Record the consumer, required operations, trust boundary, and whether HTTP or gRPC is preferred before reopening the transport decision.

**Decision:** Option A selected by the user on 2026-09-22. Reopen BOLT-13 only for a named consumer with documented transport and trust-boundary requirements.

### SCOPE-Q3 - Release Gap Handling

| Option | Trade-Off |
|--------|-----------|
| **A. Evidence-first stop gate (recommended)** | BOLT-14 audits every retained acceptance criterion first. If a missing product capability is found, record it and require a new approved follow-up plan rather than expanding BOLT-14 silently. |
| B. Permit BOLT-14 to implement discovered gaps | Faster in one pass, but destroys scope control and turns verification into an unbounded feature bolt. |

**Recommendation:** Option A.

**Decision:** Option A selected by the user on 2026-09-22. Stop and report any discovered product-capability gap; require a separate approved fix plan.

## Artifacts Authorized Only After Approval

- Append Amendment 4 to `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` recording BOLT-13 as deferred and BOLT-14 as MCP/CLI preview readiness.
- Update `PROJECT_STATUS.md` with the approved scope and current release label.
- Execute `code_generation_followup_plan_bolt14.md` one checkbox at a time.
- Create BOLT-14 Code Generation Report and Test Results.
- Update the root `README.md` from template content to Agent-memory product documentation.
- Write an execution session log.

The original approved V1 plan, BOLT-13 entry, BOLT-14 entry, and existing amendments must not be rewritten.

## Execution Checklist

- [x] Inspect the current status, approved V1 plan, bolts addendum, NFRs, risks, package scripts, tests, and README.
- [x] Confirm no BOLT-13 or BOLT-14 implementation/report artifact exists.
- [x] Record the user's request to defer BOLT-13 as planning intent.
- [x] Record explicit reviewer selections for SCOPE-Q1, SCOPE-Q2, and SCOPE-Q3. (A/A/A selected by user / 2026-09-22.)
- [x] Record explicit human approval of this scope addendum plan and the companion BOLT-14 follow-up plan. (User / 2026-09-22.)
- [x] Append Amendment 4 without editing historical approved entries. (Appended 2026-09-22.)
- [x] Update current project status and execute only the approved BOLT-14 scope.
- [x] Preserve BOLT-13 descriptors and document its deferred acceptance gap.
- [x] Do not declare full V1 until US-005 AC-003 is satisfied by a later approved slice.

## Approval Gate

- Approval requires explicit answers to SCOPE-Q1, SCOPE-Q2, and SCOPE-Q3.
- Approval of this plan may authorize only the append-only scope record and the separately enumerated BOLT-14 work.
- It does not authorize BOLT-13, HTTP, gRPC, another transport, deployment, npm publication, hosted services, or new dependencies.
- Until approval, current project status remains BOLT-13/BOLT-14 replanning pending review; no release-readiness implementation may begin.

## Execution Notes

- 2026-09-22: Plan created from the user's explicit request to defer BOLT-13 and produce an updated BOLT-14 plan. No approved historical plan, source, test, package, lockfile, README, or release implementation was changed.
- 2026-09-22: User selected and approved SCOPE-Q1/Q2/Q3 as A/A/A. BOLT-14-Q1/Q2/Q3 and explicit execution approval of both plans remain pending; Amendment 4 and implementation are not yet authorized.
- 2026-09-22: User subsequently selected BOLT-14-Q1/Q2/Q3 as A/A/A. All six decisions are resolved; explicit execution approval of both plans remains pending.
- 2026-09-22: User explicitly approved both this scope addendum plan and the BOLT-14 follow-up plan. Amendment 4 and bounded BOLT-14 execution are authorized.
