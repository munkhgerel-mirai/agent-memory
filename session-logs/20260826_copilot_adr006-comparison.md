# Session Log - ADR-006 MCP SDK Comparison

**Date:** 2026-08-26
**Duration:** Technology-decision research and comparison session

## Skills Used

- 2026-08-26: `ai-dlc-technology-decision` - executed the approved ADR-006 research, comparison, and Proposed ADR drafting workflow.

## Summary Of Work Completed

- Recorded approval of the ADR-006 decision plan.
- Verified the MCP 2026-07-28 stdio, lifecycle/versioning, tools, errors, cancellation, and security requirements from official sources.
- Verified the official TypeScript SDK v2 package layout, stdio API, dual-era support, Tier 1 status, runtime requirements, package provenance, dependencies, versioning, roadmap, and security policy.
- Compared the official SDK, dependency-free JSON-RPC, and deferral candidates.
- Appended Proposed ADR-006 to `technology_decisions.md` without modifying ADR-001 through ADR-005.
- Updated the ADR-006 plan and `PROJECT_STATUS.md`.

## Decisions Made

- Candidate A remains selected and recommended.
- The current package is `@modelcontextprotocol/server@2.0.0`; `@modelcontextprotocol/sdk` is the legacy v1 package and is not recommended for new BOLT-12 work.
- Use the SDK's default dual-era stdio posture to support modern and 2025-era clients.
- Keep SDK and schema-library imports outside `src/domain/`, with all calls routed through `CapabilityRouter`.
- ADR-006 remains Proposed until explicit final user approval.
- No dependency, package manifest, lockfile, source, test, or runtime structure was changed.

## Verification Evidence

- TypeScript SDK is official Tier 1 with 100% applicable conformance expectation and published maintenance commitments.
- `@modelcontextprotocol/server@2.0.0` requires Node >=20 and has two runtime dependencies: official core and Zod.
- Agent-memory's Node >=22.5 runtime satisfies the SDK runtime floor.
- SDK stdio serving supports both modern and legacy protocol eras by default.

## Next Steps

1. Human explicitly approves or requests changes to Proposed ADR-006.
2. After approval, create the BOLT-12 Code Generation plan and resolve schema API, real-host acceptance, and concurrency questions.