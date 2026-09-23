# Session Log - V1 Release Gap Review And Plan

**Date:** 2026-07-27
**Duration:** Post-BOLT-07 gap review and v1 release planning session

## Skills Used

- 2026-07-27: `ai-dlc-code-generation` - reviewed the repository against approved Must stories and NFRs, then created the v1 release plan.

## Summary

- Reviewed the shipped package against the approved user stories, NFRs, and risk register to answer whether Agent-memory can be released and adopted as v1.
- Verified by search that `src/` contains no `node:fs`, `readFileSync`, `readdirSync`, `readFile`, or `writeFile` usage.
- Verified that `LocalWorkspaceIndexProjection` defaults to `":memory:"`, that `WorkspaceIndexRebuilder.rebuild()` consumes caller-supplied arrays rather than files, and that `package.json` declares no `bin` entry.
- Verified that `CapabilityRouter.invokeBuiltInPort` wires only `query_memory` and `inspect_memory`, leaving the existing `StartupContextRetriever` and `WorkspaceIndexRebuilder` unreachable through the capability surface.
- Confirmed that US-005 AC-003, NFR-005, and NFR-019 all name the local API, so the local HTTP surface is inside approved v1 Must scope rather than optional.
- Created `docs/02-construction/02-design-plan/v1_release_plan.md` proposing BOLT-08 through BOLT-14, pending human review.
- Updated `PROJECT_STATUS.md` with the gap findings and the v1 release track.

## Decisions Made

- Treated the remaining work as a new planning gate rather than another code-generation follow-up plan, because BOLT-07 was the final bolt in the approved Bolts plan and the missing work has no pre-approved definition.
- Proposed a bolts plan addendum instead of editing the approved `bolts_plan.md`, per NFR-004's requirement that historical approved artifacts stay stable and new state be recorded in addenda.
- Placed workspace ingestion (BOLT-08) and durable persistence (BOLT-09) first and made them block every surface, because no interface is worth exposing before the tool can read a workspace and persist what it read.
- Sequenced delete and export execution (BOLT-11) after the CLI (BOLT-10), and required BOLT-10 to present `delete` and `export` as not-yet-executing, because a destructive command that silently does nothing is worse than an absent command.
- Gated the MCP server (BOLT-12) behind a new ADR-006 technology decision, because `@modelcontextprotocol/sdk` would be the project's first runtime dependency and no current ADR covers it.
- Recorded that BOLT-12 will require narrowing the BOLT-06 and BOLT-07 import boundary scan to the domain layer, and that this must be a deliberate recorded change rather than a silent test edit.
- Kept the local HTTP API in scope despite it being the weakest surface by user value, because dropping it would leave a Must acceptance criterion unmet; listed it as the reviewer's lowest-cost cut instead.
- Recommended tagging the BOLT-10 completion point as a `0.x` preview rather than cutting scope from v1 if speed is the priority.

## Verification

- Documentation-only update; no code changed and no verification rerun. Last verified state remains 51 tests passing from the BOLT-07 session.
- Gap findings were verified by direct repository inspection, not inferred from prior reports.

## Next Steps

1. Human reviews `docs/02-construction/02-design-plan/v1_release_plan.md`.
2. Human decides the four scope options the plan lists.
3. On approval, create the bolts plan addendum and the BOLT-08 follow-up plan.
4. Run the `ai-dlc-technology-decision` gate for ADR-006 before BOLT-12 execution.
