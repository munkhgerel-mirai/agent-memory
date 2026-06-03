# AI-DLC NFR Catalog

Use this catalog when writing measurable non-functional requirements. Adapt examples to the project context; do not copy targets blindly.

## NFR Writing Pattern

Good NFRs include:

- Category
- Requirement
- Target measure
- Rationale
- Verification method
- Applicability or reason for `Not applicable`

Avoid vague requirements such as "the system must be fast" or "the system must be secure" unless they include measurable targets and verification methods.

## Performance

| Example Requirement | Target Measure | Verification Method |
|---------------------|----------------|---------------------|
| Primary user action completes within an acceptable time. | 95th percentile response time under `<TARGET_MS>` for `<WORKFLOW>` at `<LOAD_LEVEL>`. | Load test, synthetic check, or production telemetry. |
| Background processing completes within business tolerance. | `<JOB_NAME>` completes within `<DURATION>` for `<VOLUME>`. | Batch/job test with representative data. |
| UI remains responsive during common interactions. | Interaction latency stays below `<TARGET_MS>` for `<DEVICE_OR_BROWSER_SCOPE>`. | Browser performance test or user journey test. |

Questions to ask:

- Which workflows are latency-sensitive?
- What load level represents normal, peak, and stress conditions?
- Is the target about response time, throughput, processing time, or resource use?

## Reliability

| Example Requirement | Target Measure | Verification Method |
|---------------------|----------------|---------------------|
| System remains available for critical workflows. | Availability of `<TARGET_PERCENT>` over `<WINDOW>`. | Uptime monitoring and incident records. |
| Failed external calls recover safely. | Retries, timeout, and fallback behavior verified for `<INTEGRATION>`. | Fault injection or integration test. |
| Data-changing operations are idempotent where retries can occur. | Duplicate request produces one final state for `<OPERATION>`. | Unit/integration test. |

Questions to ask:

- What workflows are critical?
- What failures should degrade gracefully?
- What data consistency guarantees are required?

## Usability

| Example Requirement | Target Measure | Verification Method |
|---------------------|----------------|---------------------|
| Target users can complete the primary task with minimal friction. | `<PERCENT>` of representative users complete `<TASK>` without assistance in `<TIME>`. | Usability test or guided review. |
| Error messages help users recover. | Error states include cause, recovery action, and support path where applicable. | UX review and acceptance test. |
| Interface supports expected accessibility needs. | Meets `<ACCESSIBILITY_STANDARD>` for relevant screens. | Accessibility audit or automated checks plus manual review. |

Questions to ask:

- Who are the primary users?
- Which workflows are repeated frequently?
- What accessibility expectations or standards apply?

## Security

| Example Requirement | Target Measure | Verification Method |
|---------------------|----------------|---------------------|
| Only authorized users can access protected actions. | Role/permission checks exist for `<ACTION_SET>`. | Security test and code review. |
| Secrets are not stored in source or logs. | No secrets in repo, config templates, logs, or error responses. | Secret scan and log review. |
| Sensitive data is protected in transit and at rest where applicable. | Encryption enabled for `<DATA_CLASS>` in `<LOCATION>`. | Configuration review and integration test. |

Questions to ask:

- What data is sensitive?
- What authentication and authorization model is required?
- What threats are realistic for this system?

## Scalability

| Example Requirement | Target Measure | Verification Method |
|---------------------|----------------|---------------------|
| System handles expected growth without redesign. | Supports `<VOLUME>` users, requests, records, or tenants with defined resource limits. | Capacity test or architecture review. |
| Workload can scale horizontally where needed. | Additional instances improve throughput for `<COMPONENT>` without shared-state failure. | Load test or deployment simulation. |
| Data access patterns remain efficient as data grows. | Query or operation stays within `<TARGET_MS>` at `<DATA_VOLUME>`. | Performance test with representative data. |

Questions to ask:

- What dimension is expected to grow?
- Which components are stateful?
- What is the expected peak-to-average ratio?

## Compliance

| Example Requirement | Target Measure | Verification Method |
|---------------------|----------------|---------------------|
| Regulated records are retained for the required period. | `<RECORD_TYPE>` retained for `<DURATION>` and deleted according to policy. | Policy review and retention test. |
| Required audit events are captured. | Audit log records actor, action, timestamp, target, and result for `<ACTION_SET>`. | Audit log review and integration test. |
| User data handling follows applicable policy. | `<POLICY_OR_REGULATION>` mapped to controls for `<DATA_CLASS>`. | Compliance review. |

Questions to ask:

- Which policies, regulations, or contractual requirements apply?
- What evidence must the system produce?
- Are retention and deletion rules explicit?

## Operability

| Example Requirement | Target Measure | Verification Method |
|---------------------|----------------|---------------------|
| Operators can detect service health. | Startup, readiness, liveness, and dependency checks exist where applicable. | Health-check test. |
| Incidents have actionable runbooks. | Runbook exists for `<INCIDENT_TYPE>` with detect, triage, mitigate, communicate, recover, and review steps. | Runbook drill. |
| Alerts are actionable. | Alert includes signal, threshold, severity, owner, escalation path, and runbook link. | Alert review and alert test. |

Questions to ask:

- Who operates the system?
- What symptoms need alerts?
- What routine maintenance tasks exist?

## Maintainability

| Example Requirement | Target Measure | Verification Method |
|---------------------|----------------|---------------------|
| Code changes remain localized by Unit or component. | `<CHANGE_TYPE>` affects no more than `<EXPECTED_BOUNDARY>`. | Architecture review and change review. |
| Public interfaces are documented. | API/event/interface contracts exist for `<BOUNDARY>`. | Documentation review. |
| Technical debt is tracked. | Known debt items have owner, risk, and review cadence. | Backlog/risk review. |

Questions to ask:

- Which parts of the system change often?
- Where are coupling risks likely?
- Which interfaces need stability?

## Privacy

| Example Requirement | Target Measure | Verification Method |
|---------------------|----------------|---------------------|
| Personal data is minimized. | Only fields needed for `<PURPOSE>` are collected and retained. | Data inventory review. |
| Sensitive fields are redacted from logs and telemetry. | `<DATA_CLASS>` never appears in logs, traces, metrics labels, or error responses. | Log/telemetry review and test. |
| Users or operators can satisfy deletion/export obligations where applicable. | `<REQUEST_TYPE>` completed within `<DURATION>`. | Process test or compliance review. |

Questions to ask:

- What personal or sensitive data is processed?
- Where does the data flow?
- What retention, deletion, or access rights apply?

## Cost

| Example Requirement | Target Measure | Verification Method |
|---------------------|----------------|---------------------|
| Operating cost remains within budget at expected load. | Monthly cost stays below `<BUDGET>` at `<LOAD_LEVEL>`. | Cost estimate and telemetry review. |
| Expensive workflows have safeguards. | `<WORKFLOW>` has rate limits, quotas, or approval controls. | Configuration review and test. |
| Observability cost is controlled. | Log/metric/trace volume stays within `<TARGET>` with sampling or retention rules. | Telemetry cost review. |

Questions to ask:

- What budget or cost ceiling matters?
- Which operations are expensive?
- What telemetry volume is expected?

## Applicability Guidance

Mark a category `Not applicable` only when:

- The system truly does not have that quality concern.
- The concern is handled outside the system boundary.
- The category is deferred with an explicit owner and reason.

Do not mark security, privacy, reliability, or compliance as `Not applicable` without a short rationale and human validation.
