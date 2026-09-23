# Test Results - Template

**Project:** <PROJECT_NAME>
**Date:** <YYYY-MM-DD>
**Related Code Generation Report:** <CODE_GENERATION_REPORT>

## Approval Status

<Pending review / Approved by <APPROVER> on <DATE> / Changes requested / Deferred / Approved by <APPROVER> on <DATE>, superseded by <ARTIFACT>>

> Retrieval convention: state the verdict in the paragraph directly under this heading, because
> only that paragraph is read when memory is indexed. If this artifact has been superseded, say
> "superseded by <ARTIFACT>" there. That classifies it as `historical` instead of `approved`, so
> its stale numbers stop being retrieved as current. Do not rewrite the measurements themselves;
> NFR-004 requires an approved artifact to remain a stable record of its own slice.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| <CHECK_NAME> | <COMMAND_OR_METHOD> | <Pass / Fail / Not run> | <NOTES> |

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| <CHECK_NAME> | <FAILURE_SUMMARY> | <CAUSE> | <FIX> | <Yes / No> |

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | <EVIDENCE> | <GAPS> |
| Domain invariants | <EVIDENCE> | <GAPS> |
| Integration points | <EVIDENCE> | <GAPS> |
| NFR / risk scenarios | <EVIDENCE> | <GAPS> |

## Follow-Ups

- <FOLLOW_UP>
