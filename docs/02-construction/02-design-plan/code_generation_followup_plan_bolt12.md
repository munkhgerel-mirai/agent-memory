# AI-DLC Code Generation Follow-Up Plan - BOLT-12 / UNIT-03

**Project:** Agent-memory
**Date:** 2026-08-26
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by the user on 2026-08-26 with recommendations A/A/A

## Purpose

Ship Agent-memory's first agent-facing surface: a local stdio MCP server that exposes the approved BOLT-05 capability descriptors, routes every invocation through the shared Capability Router, and lets a fresh MCP-capable agent retrieve startup context.

This plan is an approval gate. Do not install dependencies, modify package or lock files, create BOLT-12 source or tests, change runtime structure, alter boundary tests, or create BOLT-12 reports until the human reviewer resolves the three decisions and explicitly approves execution.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | ADR-006 is approved and BOLT-11 review is complete. |
| Next implementation slice | BOLT-12 / UNIT-03 MCP Server Surface | BOLT-12 is the next approved v1 bolt and is required for US-001 to be reachable by agents. |
| Approved technology | ADR-006 | `@modelcontextprotocol/server@2.0.0`, thin stdio adapter, default dual-era support, no SDK types in domain contracts. |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Runtime | TypeScript 5.9, ESM package, Node >=22.5.0. | Meets SDK v2's Node >=20 requirement. |
| Dependencies | No runtime dependencies; package lock exists. | BOLT-12 introduces the first runtime dependencies and requires exact lockfile review. |
| Capability metadata | Seven `MCP_TOOL_DESCRIPTORS` are generated from `CAPABILITY_DEFINITIONS`. | `tools/list` must be generated from this source, never duplicated. |
| Capability execution | `CapabilityRouter` owns governance and built-in query/inspect routing. | Every MCP tool call must produce a `CapabilityRequest` and invoke this router. |
| Surface assembly | The working router handlers for context, rebuild, export, and delete are private inside `src/cli/run.ts`. | Extract a shared local capability service/factory so MCP does not import CLI presentation code or reimplement behavior. |
| Write capability | `write_memory` remains approval-required/unimplemented. | MCP may list it only if its result remains honest and non-successful; see scope note below. |
| Boundary tests | BOLT-06 and BOLT-07 scan every file under `src/` and reject non-relative/non-`node:` imports. | Narrow these tests to `src/domain/` while adding a separate adapter-boundary assertion; do not weaken NFR-015 globally. |
| Verification baseline | Build, strict typecheck, and 112 tests pass. | BOLT-12 adds MCP protocol and real-host evidence without regressing existing behavior. |

## Open Questions For The Reviewer

All three questions were resolved by the user on 2026-08-26 by approving the recommendations. These choices are binding for execution.

### BOLT-12-Q1 - Schema Registration API

Which SDK surface should register descriptor-generated tools?

| Option | Trade-Off |
|--------|-----------|
| **A. High-level `McpServer.registerTool` with Zod v4 schemas (recommended)** | Uses the documented stable path, gives SDK input validation and typed handlers, and makes Zod a direct dependency alongside the server package. Requires a deterministic `CapabilityPayloadField` to Zod conversion. |
| B. Low-level raw request handlers and JSON Schema | Avoids Zod in Agent-memory adapter code but owns more request validation/error mapping and uses a less ergonomic SDK surface. The server package still depends transitively on Zod. |

**Recommendation:** Option A. It is the SDK's documented path and keeps validation behavior inside the Tier 1 implementation. The conversion function must be exhaustively tested for `string`, `string_array`, `boolean`, `number`, and `object`, required fields, descriptions, and empty schemas.

**Decision:** Option A approved by the user on 2026-08-26.

### BOLT-12-Q2 - Real Host Acceptance Target

Which real MCP host is required in addition to deterministic SDK client tests?

| Option | Trade-Off |
|--------|-----------|
| **A. VS Code MCP host plus official SDK client/Inspector (recommended)** | Matches the development environment and provides both repeatable protocol tests and human-visible real-host evidence. Host UI validation may require a documented smoke flow rather than a fully automated test. |
| B. Official SDK client/Inspector only | Fully controlled and automatable, but weaker evidence for "any MCP-capable agent runtime" and the actual user workflow. |
| C. Another named host | Valid if the reviewer names it; may add setup and compatibility work. |

**Recommendation:** Option A. Automated tests should use the official SDK client over stdio; a documented VS Code smoke test should list tools and call `get_context` against a temporary real workspace.

**Decision:** Option A approved by the user on 2026-08-26.

### BOLT-12-Q3 - Concurrency Boundary

How should BOLT-12 prevent simultaneous CLI and MCP mutation races?

| Option | Trade-Off |
|--------|-----------|
| **A. Add a dependency-free workspace mutation lock shared by CLI and MCP (recommended)** | Use exclusive lock-file creation under `.agent-memory/`, bounded acquisition, owner metadata, guaranteed release, and conservative stale-lock recovery. Covers separate processes and keeps local-first operation. Adds cross-cutting storage/CLI changes to BOLT-12. |
| B. Serialize only inside the MCP process | Simpler, but CLI and MCP can still race, leaving the recorded blocker reachable. |
| C. Defer concurrency to a separate prerequisite bolt | Keeps BOLT-12 transport-only but blocks its execution until another plan is approved and completed. |

**Recommendation:** Option A, limited to mutating operations (`rebuild_index` and `delete_memory`; export keeps its existing exclusive output-file creation). Query, inspect, and context remain concurrent reads. Lock contention must return a retryable, non-success result and never break the protocol stream.

**Decision:** Option A approved by the user on 2026-08-26.

## Scope For BOLT-12

### In Scope

- Add exact approved runtime dependencies for `@modelcontextprotocol/server@2.0.0` and, if Q1-A is selected, the compatible Zod v4 baseline.
- Review the complete `package.json` and `package-lock.json` dependency diff before source implementation.
- Add a separate MCP executable/package bin entrypoint for stdio operation.
- Build deterministic tool registrations from all seven `MCP_TOOL_DESCRIPTORS` and generated schemas.
- Extract shared local capability assembly from CLI-private code for use by CLI and MCP.
- Map MCP request identity, workspace root, purpose, correlation ID, and payload into `InvocationContext` and `CapabilityRequest`.
- Route all calls through `CapabilityRouter`; preserve governed export/delete and approval-required write behavior.
- Return protocol errors for unknown/malformed requests and actionable `isError` tool results for domain validation, denied, approval-required, unavailable, and incomplete outcomes.
- Keep stdout protocol-only and diagnostics on stderr.
- Use SDK v2 default dual-era stdio serving behavior.
- Narrow import-boundary tests to `src/domain/` and add explicit transport-adapter dependency tests.
- Implement the approved concurrency option from Q3.
- Add SDK-client integration tests and the approved real-host smoke evidence from Q2.
- Create BOLT-12 Code Generation Report and Test Results.

### Out Of Scope

- Local HTTP API (BOLT-13).
- Streamable HTTP or legacy HTTP+SSE MCP transports.
- Remote authentication, OAuth, network listeners, hosted infrastructure, or deployment.
- MCP resources, prompts, sampling, elicitation, subscriptions, or experimental tasks.
- Implementing governed write execution.
- iii-engine integration beyond the existing optional boundary.
- Changing domain contracts to SDK or Zod types.
- npm publication or release packaging.

## Planned Architecture

```text
MCP host
  -> @modelcontextprotocol/server stdio adapter
  -> descriptor-generated tool/schema registry
  -> shared local capability service
  -> CapabilityRouter
  -> retrieval / projection / governed operations / workspace store
```

The adapter owns MCP-specific schemas, content blocks, protocol errors, and stdio lifecycle. The shared local capability service owns workspace store lifetime and handler assembly. Domain modules remain unaware of MCP and Zod.

## Traceability Map

| Planned Task | Unit / Bolt | Story / AC | Logical Design / ADR | NFR / Risk |
|--------------|-------------|------------|----------------------|------------|
| Stdio MCP server and tool discovery | UNIT-03 / BOLT-12 | US-005 AC-001 | MCP Surface; ADR-006 | NFR-005, NFR-019 |
| Startup context through MCP | UNIT-03 + UNIT-02 | US-001 AC-001 to AC-004 | Capability Router; context retriever | NFR-001, NFR-002, NFR-006 |
| Descriptor-generated tools/schemas | UNIT-03 | US-005 AC-001 | Capability facade | NFR-015, R-011 |
| Governance-preserving calls | UNIT-03 + UNIT-04 | US-005, US-006 | Capability Router | NFR-011, R-005, R-013 |
| Domain import-boundary refinement | UNIT-03 | US-005 | Ports and adapters; ADR-006 | NFR-015, R-006 |
| Cross-process mutation coordination | UNIT-02 + UNIT-03 | US-004, US-005 | Local storage / MCP adapter | NFR-003, R-010 |
| Real-host interoperability | UNIT-03 / BOLT-12 | US-001, US-005 AC-001 | ADR-006 dual-era stdio | NFR-005, NFR-019 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-12 Code Generation follow-up plan. (User / 2026-08-26.)
- [x] Record reviewer answers to BOLT-12-Q1, BOLT-12-Q2, and BOLT-12-Q3. (Recommendations A/A/A approved by user on 2026-08-26.)
- [x] Reinspect the package/source/test baseline and preserve unrelated worktree changes.
- [x] Install only the ADR-006-approved server package and the Q1-approved schema dependency.
- [x] Review package and lockfile changes before implementation; stop if unexpected runtime dependencies or install scripts appear. (Only official core plus deduplicated Zod in production; no install scripts; audit clean.)
- [x] Add descriptor-to-schema conversion with focused tests.
- [x] Extract shared local capability assembly from CLI-private code and rerun CLI tests immediately.
- [x] Implement the approved workspace mutation coordination and focused contention/recovery tests.
- [x] Add the MCP stdio adapter and executable entrypoint outside `src/domain/`.
- [x] Register all tools from `MCP_TOOL_DESCRIPTORS` in deterministic order.
- [x] Route every call through `CapabilityRouter` with MCP invocation context.
- [x] Preserve governance decisions and honest non-success statuses for export, delete, and write.
- [x] Map protocol errors and tool execution errors without leaking protected content.
- [x] Keep stdout protocol-clean and test stderr-only diagnostics.
- [x] Support modern and 2025-era clients through the SDK default stdio posture.
- [x] Narrow existing import scans to `src/domain/` and add explicit MCP adapter boundary assertions.
- [x] Add official SDK client integration tests for initialize/discovery, tools/list, tools/call, malformed input, cancellation, shutdown, and context token budget.
- [x] Run the Q2-approved real-host smoke test against a temporary real workspace. (The exact VS Code-configured command passed with the official client against this real workspace; the user reported the VS Code trust, tool discovery, Agent-mode `get_context` call, and response verification as PASS on 2026-09-17.)
- [x] Verify governed delete/export still behave correctly through CLI and MCP.
- [x] Run build, typecheck, vulnerability/dependency review, and the full regression suite. (120 tests passed; zero vulnerabilities.)
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt12.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt12.md`.
- [x] If checks fail or the SDK API differs materially from ADR-006 evidence, document the result and request approval before non-trivial deviation. (No non-trivial deviation required.)
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log under `session-logs/`.

## Planned Verification

| Check | Method | Purpose |
|-------|--------|---------|
| Dependency review | `package.json`, lockfile diff, audit/security metadata | Enforce ADR-006 supply-chain conditions. |
| Schema tests | BOLT-12 focused suite | Prove every descriptor field maps correctly and required fields reject invalid input. |
| Tool discovery | Official SDK client over stdio | Verify deterministic seven-tool list generated from descriptors. |
| Startup context | Official SDK client `get_context` call | Prove US-001 through MCP within 2000 tokens and with provenance. |
| Governance | MCP export/delete/write calls | Prove policy decisions and non-success statuses survive transport mapping. |
| Dual-era behavior | Modern and legacy SDK clients | Verify ADR-006 compatibility posture. |
| Protocol robustness | Malformed input, unknown tool, cancellation, shutdown | Verify errors and lifecycle without corrupting stdout. |
| Concurrency | Separate-process lock contention and stale-lock recovery | Prove CLI/MCP mutations cannot race under the selected Q3 option. |
| Real host | Q2-selected host smoke flow | Prove actual host interoperability. |
| Boundary | Domain-only import scan plus adapter dependency assertion | Keep NFR-015 machine-enforced. |
| Regression | `npm run build`, `npm run typecheck`, `npm test` | Preserve BOLT-01 through BOLT-11 behavior. |

## Approval Gate

- Approval requires explicit answers to Q1, Q2, and Q3; plan approval without those answers does not authorize execution.
- Approval authorizes only the BOLT-12 scope above, including the exact ADR-006 dependency and the selected schema/concurrency choices.
- Any additional MCP transport, framework middleware, dependency, hosted service, domain contract change, or write implementation requires a new approval.
- BOLT-12 implementation and tests must complete before its reports are generated; the report pair requires separate human review before BOLT-14 can rely on this slice.

## Execution Notes

- 2026-08-26: Plan created after final ADR-006 approval. No dependency, package/lockfile, source, test, runtime structure, boundary-test, report, or BOLT-12 implementation change was made. Execution awaits reviewer answers and explicit approval.
- 2026-08-26: User approved the plan and all three recommendations: high-level Zod registration, VS Code plus official client/Inspector acceptance, and a shared cross-process mutation lock. Execution authorized within the recorded scope.
- 2026-08-26: BOLT-12 implementation completed. Exact dependencies installed and audited; descriptor schemas, shared capability assembly, cross-process mutation lock, stdio server, dual-era official-client tests, governance/error mapping, and domain boundary refinement all pass. Full verification: build and typecheck clean, 120 tests passed, zero vulnerabilities.
- 2026-08-26: `.vscode/mcp.json` added and its exact command verified against this real workspace: seven tools, `get_context` completed with 13 items at 1993/2000 tokens. Interactive VS Code trust and Agent-mode tool approval remain a manual reviewer action.
- 2026-09-17: User completed the manual VS Code UI smoke flow and reported PASS. BOLT-12 report and test-results approval remains a separate human review gate.
- 2026-09-17: User approved the BOLT-12 Code Generation Report. The BOLT-12 Test Results approval remains pending.
- 2026-09-17: User also approved the BOLT-12 Test Results. The report-pair review gate is complete.
