# Test Results - BOLT-14 MCP/CLI Preview Release Readiness

**Project:** Agent-memory  
**Date:** 2026-09-22  
**Related Code Generation Report:** `code_generation_report_bolt14.md`

## Approval Status

Approved by the user on 2026-09-23.

## Overall Verdict

**Automated verification passes; preview readiness is blocked by the recorded US-003 capability gap.** Full V1 also remains blocked by deferred BOLT-13 / US-005 AC-003.

## Environment

| Item | Value |
|------|-------|
| OS | Microsoft Windows 10.0.26200 |
| Node | v24.11.0 |
| npm | 11.6.1 |
| Runtime state | Local Markdown, JSONL, SQLite; no hosted service |

## Verification Summary

| Check | Command / Method | Result | Evidence |
|-------|------------------|--------|----------|
| Build | `npm run build` | Pass | TypeScript emitted successfully. |
| Strict typecheck | `npm run typecheck` | Pass | No type errors. |
| Existing regression | `npm test` | Pass | 120 passed, 0 failed, 0 skipped. |
| Preview readiness | `npm run test:v1-readiness` | Pass | 2 passed: fresh CLI end-to-end and official MCP client. |
| Scale/latency | `npm run test:v1-scale` | Pass | 1 passed at 1,000 artifacts / 10,000 events. |
| Production audit | `npm audit --omit=dev` | Pass | 0 vulnerabilities. |
| Full audit | `npm audit` | Pass | 0 vulnerabilities. |
| README walkthrough | Built CLI `--help` | Pass | Documented command set and exit codes match runtime output. |
| Final real workspace | CLI rebuild + context | Pass | 204 candidates, 138 indexed, 0 warnings; current context 1992/2000 tokens. |

## Scale And Timing Results

```json
{
  "lifecycleArtifactCount": 1000,
  "eventRecordCount": 10000,
  "eventTypeCounts": {
    "memory_indexed": 8000,
    "memory_removed": 1000,
    "memory_deleted": 1000
  },
  "replayedEventCount": 10000,
  "supersededEventCount": 0,
  "projectionCount": 7000,
  "fixtureDurationMs": 596.13,
  "rebuildDurationMs": 35885.55,
  "cliRetrievalSamplesMs": [175.3, 186.13, 189.6],
  "mcpRetrievalSampleMs": 555.96,
  "maximumRetrievalMs": 555.96,
  "startupLimitMs": 10000
}
```

Per approved BOLT-14-Q2-A, the ten-second threshold applies to fresh process/client retrieval from a persisted index. Fixture generation and rebuild are reported separately.

## Acceptance Evidence

| Criterion | Result | Evidence / Gap |
|-----------|--------|----------------|
| Fresh workspace rebuild | Pass | Real Markdown files produce a persisted SQLite index without manual seeding. |
| Context content/provenance | Pass | CLI and MCP return Project Goal, Current Status, Next Steps, source, category, and approval data within 2000 tokens. |
| Query and inspect | Pass | Fresh CLI processes find and inspect the expected NFR memory. |
| Portable export | Pass | JSON includes exact target, provenance, request/decision, schema version, and timestamp. |
| Confirmation-gated delete | Pass | Missing `--confirm` exits with usage failure; confirmed delete succeeds. |
| Delete durability | Pass for implemented stores | Tombstone survives process restart/rebuild; deleted memory stays absent; source Markdown is unchanged. |
| Lifecycle-edge cleanup | Blocked | Cleanup reports `not_applicable`; US-003 extraction/persistence/query is not implemented. |
| MCP tool access | Pass | Official client lists seven tools and retrieves real file-backed startup context. |
| NFR-001/NFR-009 | Pass under Q2-A boundary | Maximum fresh retrieval 555.96ms at approved scale. |
| US-005 AC-003 | Deferred | No HTTP/gRPC listener exists or was added. |
| README/R-014 | Pass | Root README is project-specific and states preview boundaries. |

## Failed And Corrected Checks

1. Restricted `npm test` run: failed at local child-process creation with `spawnSync EPERM`. No assertion failed. Rerun with approved child-process permission passed 120/120.
2. First readiness run: the new test read `data` as the payload instead of the existing `data.payload` envelope. Test-only parser corrected.
3. Second readiness run: the new test expected inspect payload to wrap the record as `{ record }`; the established contract returns the record directly. Test-only assertion corrected.
4. Final readiness rerun: 2/2 passed.

No production source behavior was changed to make a test pass.

## Remaining Gaps And Observations

- US-003 lifecycle relationships block the preview-ready verdict until implemented or explicitly deferred by a later approved scope decision.
- Full V1 remains blocked by deferred US-005 AC-003.
- Scale rebuild took 35.9 seconds; it is outside the selected startup-retrieval threshold but worth profiling before larger local workspaces.
- Node's `node:sqlite` experimental warning remains visible on stderr.
- BOLT-14 report and test results were approved by the user on 2026-09-23.
