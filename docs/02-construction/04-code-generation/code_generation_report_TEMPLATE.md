# Code Generation Report - Template

**Project:** <PROJECT_NAME>
**Date:** <YYYY-MM-DD>

## Approval Status

<Pending review / Approved by <APPROVER> on <DATE> / Changes requested / Deferred / Approved by <APPROVER> on <DATE>, superseded by <ARTIFACT>>

> Retrieval convention: state the verdict in the paragraph directly under this heading, because
> only that paragraph is read when memory is indexed. If this artifact has been superseded, say
> "superseded by <ARTIFACT>" there. That classifies it as `historical` instead of `approved`, so
> its stale numbers stop being retrieved as current. Do not rewrite the measurements themselves;
> NFR-004 requires an approved artifact to remain a stable record of its own slice.

## Summary

- <SUMMARY>

## Approved Inputs

- **Units:** <UNIT_IDS>
- **User Stories:** <US_IDS>
- **Domain Designs:** <DOMAIN_DESIGN_DOCS>
- **Logical Designs:** <LOGICAL_DESIGN_DOCS>
- **NFRs:** <NFR_IDS>
- **Risks:** <RISK_IDS>

## Changed Files

| File | Change Type | Related Unit / Story | Notes |
|------|-------------|----------------------|-------|
| <FILE_PATH> | <Added / Updated / Removed> | <UNIT_OR_STORY_ID> | <NOTES> |

## Traceability Mapping

| Implementation Task | Unit | Story / AC | Domain Element | Logical Decision | NFR / Risk |
|---------------------|------|------------|----------------|------------------|------------|
| <TASK> | <UNIT_ID> | <US_ID_OR_AC_ID> | <DOMAIN_ELEMENT> | <DECISION_ID> | <NFR_OR_RISK_ID> |

## Assumptions And Deviations

| Type | Description | Approval Status |
|------|-------------|-----------------|
| Assumption | <ASSUMPTION> | <Approved / Pending / Deferred> |
| Deviation | <DEVIATION_FROM_DESIGN> | <Approved / Pending / Deferred> |

## Verification Results

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| <CHECK_NAME> | <COMMAND_OR_METHOD> | <Pass / Fail / Not run> | <NOTES> |

## Follow-Ups

- <FOLLOW_UP>
