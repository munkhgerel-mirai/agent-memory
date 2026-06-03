# Technology Decisions - Template

**Project:** <PROJECT_NAME>  
**Date:** <YYYY-MM-DD>  
**Decision Scope:** <SCOPE>  

## Decision Summary

| ADR ID | Decision Area | Title | Status | Confidence | Reversibility | Human Selection | Approval |
|--------|---------------|-------|--------|------------|---------------|-----------------|----------|
| ADR-001 | <Database / Framework / Language / Cloud service / Dependency / Integration / Infrastructure / Runtime / Other> | <TITLE> | <Proposed / Approved / Rejected / Superseded / Deferred> | <Low / Medium / High> | <Low / Medium / High> | <Pending Selection / Selected / Deferred / Rejected / More Analysis Needed> | <APPROVER_AND_DATE_OR_PENDING> |

## Decision Drivers

| Driver | Source | Importance | Notes |
|--------|--------|------------|-------|
| <DRIVER> | <User story / NFR / Risk / Logical design / Brownfield discovery / Constraint> | <Must / Should / Nice> | <NOTES> |

## Candidate Comparison

| Decision Area | Candidate | Fit | Risks | Cost Impact | Operability | Reversibility | Notes |
|---------------|-----------|-----|-------|-------------|-------------|---------------|-------|
| <AREA> | <CANDIDATE> | <Low / Medium / High> | <RISKS> | <Low / Medium / High / Unknown> | <Low / Medium / High> | <Low / Medium / High> | <NOTES> |

## Human Selection Gate

AI may recommend a candidate, but a technology option must not become binding until the human selection outcome is recorded.

| Gate Status | Selected Option | Selector / Date | Selection Rationale | Conditions | Downstream Authorization | Notes |
|-------------|-----------------|-----------------|---------------------|------------|--------------------------|-------|
| <Pending Selection / Selected / Deferred / Rejected / More Analysis Needed> | <CANDIDATE_OR_NONE> | <SELECTOR_AND_DATE_OR_PENDING> | <RATIONALE_OR_PENDING> | <CONDITIONS_OR_NONE> | <Allowed downstream artifacts / Not authorized / Limited authorization> | <NOTES> |

Gate rules:

- Keep ADR status `Proposed` until human selection and approval are both recorded.
- Record `Deferred`, `Rejected`, or `More Analysis Needed` when no candidate is selected.
- Do not update Logical Design, Code Generation, Deployment, Operations, dependency lists, runtime structure, or infrastructure from this decision until downstream authorization is recorded.

## ADR-001: <TITLE>

- **Status:** <Proposed / Approved / Rejected / Superseded / Deferred>
- **Decision Area:** <Database / Framework / Language / Cloud service / Dependency / Integration / Infrastructure / Runtime / Other>
- **Context:** <CONTEXT>
- **Decision:** <DECISION>
- **Human Selection Status:** <Pending Selection / Selected / Deferred / Rejected / More Analysis Needed>
- **Selected Option:** <CANDIDATE_OR_NONE>
- **Selector / Date:** <SELECTOR_AND_DATE_OR_PENDING>
- **Selection Rationale:** <RATIONALE_OR_PENDING>
- **Selection Conditions:** <CONDITIONS_OR_NONE>
- **Downstream Authorization:** <ALLOWED_ARTIFACTS_OR_NOT_AUTHORIZED>
- **Rationale:** <RATIONALE>
- **Alternatives Considered:** <ALTERNATIVES>
- **Consequences:** <CONSEQUENCES>
- **Risks:** <RISKS>
- **Security / Privacy / Compliance Impact:** <IMPACT>
- **Operational Impact:** <IMPACT>
- **Cost Impact:** <IMPACT>
- **Migration / Rollback Impact:** <IMPACT>
- **Reversibility:** <Low / Medium / High>
- **Confidence:** <Low / Medium / High>
- **Related Units:** <UNIT_IDS_OR_NONE>
- **Related NFRs:** <NFR_IDS_OR_NONE>
- **Related Risks:** <RISK_IDS_OR_NONE>
- **Related Design Artifacts:** <ARTIFACTS_OR_NONE>
- **Follow-Ups:** <FOLLOW_UPS_OR_NONE>
- **Approval:** <APPROVER_AND_DATE_OR_PENDING>

## Rejected Or Deferred Options

| Option | Status | Reason | Revisit Trigger |
|--------|--------|--------|-----------------|
| <OPTION> | <Rejected / Deferred> | <REASON> | <TRIGGER_OR_NONE> |

## Open Questions

| ID | Question | Owner | Needed By |
|----|----------|-------|-----------|
| OQ-001 | <QUESTION> | <OWNER> | <DATE_OR_PHASE> |
