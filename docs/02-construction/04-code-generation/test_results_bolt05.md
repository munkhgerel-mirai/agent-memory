# Test Results - BOLT-05 / UNIT-03

**Project:** Agent-memory
**Date:** 2026-07-06
**Related Code Generation Report:** `docs/02-construction/04-code-generation/code_generation_report_bolt05.md`

## Approval Status

Pending human review.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Source and tests compile with `tsc -p tsconfig.json`. |
| TypeScript typecheck | `npm run typecheck` | Pass | Strict TypeScript check passes with no emit. |
| Unit/integration tests | `npm test` | Pass | 33 tests passed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, and 7 BOLT-05 tests. |
| Capability validation tests | BOLT-05 tests | Pass | Validates capability names, invocation context, request creation, and unknown capability rejection. |
| Descriptor consistency tests | BOLT-05 tests | Pass | MCP, CLI, and local API descriptor maps expose the same approved capabilities and contain no function/runtime bindings. |
| Governance-required operation tests | BOLT-05 tests | Pass | Export, delete, and write are marked governance-required and routed through governance decisions. |
| Projection routing tests | BOLT-05 tests | Pass | Query and inspect capabilities use the existing local projection repository port when attached. |
| Job lifecycle tests | BOLT-05 tests | Pass | Memory job runs and observations cover completed, failed, retryable, and invalid target-scope behavior. |
| Boundary tests | BOLT-05 tests | Pass | Package dependencies do not include MCP SDK, CLI parser, HTTP server, or iii runtime packages. |

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| None | No failed checks in final verification. | N/A | N/A | No |

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | Tests cover US-005 MCP descriptor, CLI descriptor, local API descriptor, query/inspect routing, and approved memory write contract shape. | Actual MCP server connection, CLI command execution, and HTTP API requests are deferred. |
| Domain invariants | Tests cover required actor/workspace/purpose invocation context, known capability names, governance-required flags, data-only descriptors, and memory job target-scope validation. | Full adapter-specific error translation remains deferred until adapters exist. |
| Integration points | Router integrates with existing local projection query/inspect ports and BOLT-04 memory operation governance decisions. | Context retriever, rebuild coordinator, export package, delete execution, and write persistence handlers are out of scope. |
| NFR / risk scenarios | Tests and implementation address NFR-005, NFR-011, NFR-013, NFR-015, R-005, R-006, R-011, and R-013 for BOLT-05. | Runtime iii observability and no-iii adapter fallback execution are deferred to BOLT-06. |

## Follow-Ups

- Submit BOLT-05 Test Results for human review and approval.
- Keep actual MCP server, CLI binary/parser, local HTTP API server, iii adapter, semantic retrieval, filesystem delete/export execution, deployment, and README rewrite behind later approved plans.
- Preserve descriptor-map contract tests when implementing adapters so surface behavior cannot drift.