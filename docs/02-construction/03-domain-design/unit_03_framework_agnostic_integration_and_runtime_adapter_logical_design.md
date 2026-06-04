# UNIT-03 Framework-Agnostic Integration And Runtime Adapter Logical Design

**Project:** Agent-memory  
**Unit ID:** UNIT-03  
**Date:** 2026-06-04  
**Approved Domain Design:** `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter.md`

## Approval Status

Approved by user on 2026-06-05. Generated from the approved Logical Design plan after user approval on 2026-06-04.

## NFR Traceability Matrix

| NFR ID | Design Decision | Component / Boundary | Pattern / Tactic | Trade-Off |
|--------|-----------------|----------------------|------------------|-----------|
| NFR-005 | MCP, CLI, and local API call local core services without hosted infrastructure. | Local Capability Facade | Local-first integration profile | Remote/team API is deferred. |
| NFR-013 | Operators get inspect, rebuild, export, delete, and query capabilities. | CLI Surface, Local API Surface, MCP Surface | Capability map with shared domain commands | More surface design, but consistent behavior across tools. |
| NFR-014 | iii adapter job observations are recorded only when iii is enabled. | iii Runtime Adapter | Optional adapter with observable jobs | Requires fallback path and adapter tests. |
| NFR-015 | Integration surfaces cannot own the domain model or storage logic. | Capability Router, Port Boundary | Ports/adapters | More mapping code, but framework-agnostic core remains intact. |

## Architecture Patterns

| Pattern | Rationale | Alternatives Considered | Consequences |
|---------|-----------|-------------------------|--------------|
| Capability facade | Each surface invokes the same memory capabilities with different transport/presentation. | Separate logic per surface | Avoids inconsistent behavior; requires shared request model. |
| Ports and adapters | MCP, CLI, local API, and iii are adapters around core services. | Domain imports transport/runtime libraries | Keeps LLM/framework independence; adapter code must translate errors well. |
| Optional runtime adapter | iii can trigger and observe jobs without becoming required for local mode. | Make iii required in v1 | Matches approved Technology Decision and reduces setup risk. |
| Job lifecycle observation | Rebuild, consolidation, export, and delete jobs emit status, timing, result, and provenance. | Fire-and-forget operations | Better operability; more event handling. |

## Component Boundaries

| Component | Responsibility | Owner | Interfaces | Dependency Direction |
|-----------|----------------|-------|------------|----------------------|
| Capability Router | Maps framework-agnostic capability requests to core domain operations. | Integration team | `invokeCapability`, `validateCapability`, `mapError` | Depends on UNIT-01/02/04 ports; no transport details in core. |
| MCP Surface | Exposes agent-facing memory tools for context retrieval, query, inspect, rebuild, export, and delete. | Integration team | `get_context`, `query_memory`, `inspect_memory`, `rebuild_index`, `export_memory`, `delete_memory` | Adapter depends on Capability Router. |
| CLI Surface | Exposes local operator commands for inspect, query, context, rebuild, export, delete, and policy status. | Integration team | `agent-memory context`, `query`, `inspect`, `rebuild`, `export`, `delete` | Adapter depends on Capability Router. |
| Local API Surface | Provides programmatic local integration for tools and future UI/viewer. | Integration team | `POST /context`, `POST /query`, `POST /rebuild`, `POST /export`, `POST /delete` | Adapter depends on Capability Router. |
| Memory Job Coordinator | Normalizes long-running operations and observation events. | Integration team | `startJob`, `observeJob`, `completeJob`, `failJob` | Uses UNIT-02 rebuild/retrieval and UNIT-04 operation decisions. |
| iii Runtime Adapter | Optional first-class adapter for triggers, jobs, and observability. | Integration team | `registerTrigger`, `runMemoryJob`, `publishObservation` | Depends on Memory Job Coordinator; core runs without it. |

## Integration Contracts

| Interaction | Direction | Contract | Error Handling |
|-------------|-----------|----------|----------------|
| Context retrieval | Inbound from MCP/CLI/API | Actor, workspace, mode, goal/query, phase, token budget mode. | Return validation error for unknown mode; never return policy-ineligible memory. |
| Memory query/inspect | Inbound from MCP/CLI/API | Query/filter, actor, visibility context, explain flag. | Denied memory is omitted or reported as inaccessible without leaking content. |
| Rebuild index | Inbound from CLI/API/MCP/iii | Actor, workspace, rebuild mode, dry-run flag, operation ID. | Idempotent job ID; failed rebuild reports conflicts and preserves last safe projection. |
| Export/delete | Inbound from CLI/API/MCP | Actor, target scope, reason, filters, confirmation evidence for destructive actions. | Requires UNIT-04 approval; partial cleanup returns incomplete job status. |
| iii trigger | Inbound from iii adapter | Trigger label, workspace, job type, payload, correlation ID. | If iii unavailable, core local mode remains available and adapter reports disabled/unavailable. |
| Job observation | Outbound to iii/local API/logs | Job ID, status, timing, result summary, provenance, errors. | Failed jobs include human-readable reason and retry eligibility. |

## Non-Binding Technology Mapping

| Concern | Candidate | Confidence | Risks | Reversibility |
|---------|-----------|------------|-------|---------------|
| Runtime/package | TypeScript/Node npm package | Medium | Transport code could leak into core modules. | Medium; adapter folders can remain separate. |
| MCP implementation | TypeScript MCP server adapter | Medium | MCP API shape may evolve. | High; Capability Router isolates tool contracts. |
| CLI | Node-based CLI entrypoint | Medium | Command UX may expand too quickly. | High; capability map limits scope. |
| Local API | Lightweight local HTTP API behind same capability model | Medium | Running service adds lifecycle/security considerations. | High; local API can be optional. |
| iii integration | Optional iii Node SDK adapter | Medium | iii version/behavior changes; adapter may become accidental requirement. | High; core local mode does not depend on iii. |

## Approved Technology Decision Trace

| ADR | Impact On This Unit |
|-----|---------------------|
| ADR-001 | TypeScript/Node is the primary package/runtime surface for CLI, MCP, and local API planning. |
| ADR-002 | iii-engine is an optional first-class adapter; core local mode must work without it. |
| ADR-003 | Integration surfaces expose local-first rebuild, query, export, and delete operations without requiring hosted infrastructure. |
| ADR-004 | Any raw observation capture through runtime surfaces must be explicit and TTL-governed. |

## Data Flow

| Flow | Source | Target | Data | Notes |
|------|--------|--------|------|-------|
| Agent startup context | MCP Surface | Capability Router -> UNIT-02 | Context request, actor/workspace, startup mode | Returns bounded context pack with provenance. |
| Operator rebuild | CLI Surface | Memory Job Coordinator -> UNIT-02 | Rebuild request, operation ID, dry-run flag | Job status can be inspected. |
| Governance operation | CLI/API/MCP | Capability Router -> UNIT-04 | Delete/export/write request, actor, purpose | Policy decision controls downstream action. |
| Optional runtime job | iii Runtime Adapter | Memory Job Coordinator | Trigger payload, correlation ID, job type | Adapter cannot bypass governance. |
| Observation publish | Memory Job Coordinator | iii Runtime Adapter / local logs | Status, timing, result, provenance | Runs only when observation target is enabled. |

## Failure Modes And Error Handling

| Failure Mode | Mitigation | Verification |
|--------------|------------|--------------|
| iii adapter unavailable | Mark adapter disabled/unavailable and keep CLI/MCP/local API core mode functional. | No-iii fallback test. |
| Surface-specific behavior drift | All surfaces use Capability Router and shared request/response contracts. | Contract tests per surface. |
| Long rebuild blocks interactive request | Represent rebuild as job with progress/observation and bounded status polling. | Rebuild job lifecycle test. |
| Delete/export request lacks approval evidence | Return approval-required or denied from UNIT-04 before any destructive action. | Operation policy tests. |
| MCP tool returns too much context | Use UNIT-02 token-budgeted pack and mode validation. | MCP context pack token test. |
| Adapter retries duplicate jobs | Use idempotent operation IDs and job correlation IDs. | Duplicate trigger test. |

## Security And Privacy

| Concern | Decision / Mitigation | Related NFR / Risk |
|---------|-----------------------|--------------------|
| Authorization | Each capability request includes actor, workspace, purpose, and requested surface. | NFR-008, NFR-013 |
| Destructive operations | Delete/export require UNIT-04 policy decision and operation audit record. | NFR-011, R-005 |
| Adapter isolation | iii cannot invoke core operations outside the Capability Router. | NFR-015, R-006 |
| Sensitive output | MCP/API/CLI responses omit or redact policy-ineligible memory. | NFR-007, NFR-018, R-013 |
| Local API exposure | Local API remains optional and should bind to local workspace by default in implementation planning. | NFR-005, R-014 |
| Observability | Job observations include provenance and errors, not raw sensitive content by default. | NFR-014, R-012 |

## ADR-Lite Decisions

### ADR-LD-UNIT03-001: Use One Capability Router For All Surfaces

- **Status:** Proposed
- **Context:** Agent-memory must expose MCP, CLI, and local API without diverging semantics.
- **Decision:** Route all surface requests through one framework-agnostic Capability Router.
- **Rationale:** This keeps behavior consistent and protects domain boundaries.
- **Alternatives Considered:** Implement each surface independently.
- **Consequences:** Surface adapters are thinner, but request/response contracts must be carefully designed.

### ADR-LD-UNIT03-002: Keep iii As Optional First-Class Adapter

- **Status:** Proposed
- **Context:** Approved Technology Decisions select iii as optional, with independent core local mode.
- **Decision:** iii adapter may trigger and observe memory jobs but cannot be required for core retrieval, rebuild, delete, or export.
- **Rationale:** This preserves local-first adoption and mitigates R-006.
- **Alternatives Considered:** Make iii required for v1; defer adapter boundary entirely.
- **Consequences:** Additional fallback testing is needed, but integration risk is bounded.

## Open Questions And Trade-Offs

| ID | Question / Trade-Off | Owner | Decision Needed By |
|----|----------------------|-------|--------------------|
| LD-UNIT03-OQ-001 | Which MCP tools are mandatory in the first code-generation slice versus deferred? | Human / Integration team | Code-generation planning |
| LD-UNIT03-OQ-002 | Should the local API be shipped in v1 or defined but implemented after CLI/MCP? | Human / Integration team | Code-generation planning |
| LD-UNIT03-OQ-003 | Which iii job types should be enabled first: rebuild, consolidation, export/delete observation, or all? | Human / Integration team | iii adapter planning |
