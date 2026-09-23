# Code Generation Report - BOLT-12 MCP Server Surface

**Project:** Agent-memory
**Date:** 2026-08-26

## Approval Status

Approved by the user on 2026-09-17.

## Summary

- Added a dual-era local stdio MCP server using approved `@modelcontextprotocol/server@2.0.0` and Zod v4.
- Generated all seven MCP tools and strict input schemas from the existing capability descriptors.
- Extracted shared local capability assembly so CLI and MCP use identical retrieval, rebuild, export, delete, and governance behavior.
- Added a dependency-free cross-process workspace mutation lock shared by CLI and MCP rebuild/delete operations.
- Added an `agent-memory-mcp` executable and VS Code MCP workspace configuration.
- Added official-client tests for legacy and modern protocol eras, tool discovery/calls, errors, cancellation, shutdown, governance, and real process contention.

## Approved Inputs

- **Unit / Bolt:** UNIT-03 / BOLT-12
- **Stories:** US-001; US-005 AC-001
- **Logical Design:** UNIT-03 Framework-Agnostic Integration And Runtime Adapter
- **Technology:** Approved ADR-006, official TypeScript MCP SDK v2
- **NFRs:** NFR-001, NFR-002, NFR-005, NFR-006, NFR-015, NFR-019
- **Risks:** R-005, R-006, R-010, R-011, R-013

## Changed Files

| File | Change Type | Notes |
|------|-------------|-------|
| `package.json`, `package-lock.json` | Updated | Exact server/Zod runtime dependencies, official client dev dependency, MCP bin, BOLT-12 test entry. |
| `src/mcp/tool-schema.ts` | Added | Exhaustive descriptor-field to strict Zod schema conversion. |
| `src/mcp/server.ts` | Added | Deterministic tool registration, Capability Router invocation, result/error mapping, connection-scoped store. |
| `src/mcp/main.ts` | Added | Dual-era stdio executable with stderr-only diagnostics and signal cleanup. |
| `src/application/local-capability-router.ts` | Added | Shared CLI/MCP handler assembly. |
| `src/storage/workspace-mutation-lock.ts` | Added | Exclusive cross-process mutation lock with owner metadata and conservative stale recovery. |
| `src/cli/run.ts` | Updated | Uses shared capability assembly and mutation-locked rebuild. |
| `src/domain/framework-agnostic-integration.ts` | Updated | Makes delete confirmation evidence mandatory across every surface. |
| `src/index.ts` | Updated | Exports shared application, lock, and MCP adapter APIs. |
| `tests/mcp-server.test.ts` | Added | Eight schema, lock, dual-era stdio, robustness, governance, shutdown, and boundary tests. |
| `tests/runtime-adapter-boundary.test.ts` | Updated | Narrows third-party import enforcement to the domain layer. |
| `tests/semantic-retrieval-extension.test.ts` | Updated | Narrows third-party import enforcement to the domain layer. |
| `.vscode/mcp.json` | Added | Launches the built stdio server against this workspace. |

## Traceability Mapping

| Implementation Task | Story / AC | Design / ADR | NFR / Risk |
|---------------------|------------|--------------|------------|
| Stdio MCP server and deterministic tool discovery | US-005 AC-001 | MCP Surface, ADR-006 | NFR-005, NFR-019 |
| Startup context through MCP | US-001 AC-001 to AC-004 | Capability Router | NFR-001, NFR-002, NFR-006 |
| Descriptor-generated schema validation | US-005 AC-001 | Capability facade | NFR-015, R-011 |
| Governance and confirmation preservation | US-005, US-006 | UNIT-04 operations | R-005, R-013 |
| Domain dependency isolation | US-005 | Ports and adapters | NFR-015, R-006 |
| Cross-process mutation lock | US-004, US-005 | Local storage boundary | NFR-003, R-010 |

## Assumptions And Deviations

| Type | Description | Status |
|------|-------------|--------|
| Approved choice | High-level SDK registration uses strict Zod v4 schemas derived from descriptors. | Approved Q1-A |
| Approved choice | Automated official-client tests plus VS Code host configuration and smoke flow. | Approved Q2-A |
| Approved choice | Shared cross-process lock protects rebuild and delete. | Approved Q3-A |
| Safety refinement | `confirmationEvidence` became required for delete on every surface so MCP cannot bypass CLI confirmation semantics. | Within approved governance scope |
| Boundary refinement | Existing all-`src` import scans now target `src/domain/`; MCP adapter imports are separately allow-listed. | Planned and approved |
| Manual host evidence | The configured VS Code command was verified with the official client, and the user completed the VS Code trust and Agent-mode flow. | PASS reported 2026-09-17 |

## Verification Results

| Check | Result | Notes |
|-------|--------|-------|
| Build | Pass | `npm run build` |
| Typecheck | Pass | `npm run typecheck` |
| Full tests | Pass | 120 passed, 0 failed |
| Dependency audit | Pass | `npm audit`: 0 vulnerabilities |
| Real-workspace command smoke | Pass | 7 tools; context completed with 13 items at 1993/2000 tokens |
| VS Code UI smoke | Pass | User reported the manual trust, tool discovery, Agent-mode call, and response check PASS on 2026-09-17 |

## Follow-Ups

- This report and `test_results_bolt12.md` were approved by the user on 2026-09-17.
- Suppress the existing `node:sqlite` experimental warning before release.
- BOLT-13 local HTTP API and BOLT-14 release verification remain separate approved slices.
