# <UNIT_NAME> Logical Design - Template

**Project:** <PROJECT_NAME>
**Unit ID:** <UNIT_ID>
**Date:** <YYYY-MM-DD>
**Approved Domain Design:** <DOMAIN_DESIGN_DOC>

## Approval Status

<Pending review / Approved by <APPROVER> on <DATE> / Changes requested / Deferred>

## NFR Traceability Matrix

| NFR ID | Design Decision | Component / Boundary | Pattern / Tactic | Trade-Off |
|--------|-----------------|----------------------|------------------|-----------|
| <NFR_ID> | <DECISION> | <COMPONENT_OR_BOUNDARY> | <PATTERN_OR_TACTIC> | <TRADE_OFF> |

## Architecture Patterns

| Pattern | Rationale | Alternatives Considered | Consequences |
|---------|-----------|-------------------------|--------------|
| <PATTERN> | <RATIONALE> | <ALTERNATIVES> | <CONSEQUENCES> |

## Component Boundaries

| Component | Responsibility | Owner | Interfaces | Dependency Direction |
|-----------|----------------|-------|------------|----------------------|
| <COMPONENT> | <RESPONSIBILITY> | <OWNER> | <INTERFACES> | <DIRECTION> |

## Integration Contracts

| Interaction | Direction | Contract | Error Handling |
|-------------|-----------|----------|----------------|
| <INTERACTION> | <Inbound / Outbound> | <CONTRACT> | <ERROR_HANDLING> |

## Non-Binding Technology Mapping

| Concern | Candidate | Confidence | Risks | Reversibility |
|---------|-----------|------------|-------|---------------|
| <Database / Framework / Language / Cloud service> | <CANDIDATE> | <Low / Medium / High> | <RISKS> | <REVERSIBILITY> |

## Data Flow

| Flow | Source | Target | Data | Notes |
|------|--------|--------|------|-------|
| <FLOW_NAME> | <SOURCE> | <TARGET> | <DATA> | <NOTES> |

## Failure Modes And Error Handling

| Failure Mode | Mitigation | Verification |
|--------------|------------|--------------|
| <TIMEOUT_RETRY_IDEMPOTENCY_PARTIAL_FAILURE_BACKPRESSURE> | <MITIGATION> | <VERIFICATION> |

## Security And Privacy

| Concern | Decision / Mitigation | Related NFR / Risk |
|---------|-----------------------|--------------------|
| <AUTH_DATA_CLASSIFICATION_SECRETS_AUDIT_COMPLIANCE> | <DECISION> | <NFR_OR_RISK_ID> |

## ADR-Lite Decisions

### ADR-001: <TITLE>

- **Status:** <Proposed / Approved / Superseded>
- **Context:** <CONTEXT>
- **Decision:** <DECISION>
- **Rationale:** <RATIONALE>
- **Alternatives Considered:** <ALTERNATIVES>
- **Consequences:** <CONSEQUENCES>

## Open Questions And Trade-Offs

| ID | Question / Trade-Off | Owner | Decision Needed By |
|----|----------------------|-------|--------------------|
| OQ-001 | <QUESTION_OR_TRADE_OFF> | <OWNER> | <DATE_OR_PHASE> |
