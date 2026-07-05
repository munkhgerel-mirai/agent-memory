import type { ApprovalStatus } from "./lifecycle-memory-core.js";
import type { MemoryVisibility } from "./local-workspace-storage.js";

export class PrivacyGovernanceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrivacyGovernanceValidationError";
  }
}

export const MEMORY_CLASSES = ["approved_lifecycle_memory", "raw_observation"] as const;

export type MemoryClass = (typeof MEMORY_CLASSES)[number];

export type RedactionOutcome = "allow" | "redact" | "block" | "approval_required";

export type OperationType = "inspect" | "delete" | "export" | "write";

export type OperationDecisionOutcome = "allowed" | "denied" | "approval_required";

export interface RetentionRule {
  readonly policyId: string;
  readonly memoryClass: MemoryClass;
  readonly ttlHours?: number;
  readonly disposalAction: "retain" | "expire";
}

export interface CreateRetentionRuleInput {
  readonly policyId: string;
  readonly memoryClass: MemoryClass;
  readonly ttlHours?: number;
  readonly disposalAction?: "retain" | "expire";
}

export interface ProvenanceStamp {
  readonly source: string;
  readonly actor: string;
  readonly timestamp: string;
  readonly approvalStatus: ApprovalStatus;
  readonly visibility: MemoryVisibility;
  readonly retention: RetentionRule;
  readonly artifactLink?: string;
}

export interface CreateProvenanceStampInput {
  readonly source: string;
  readonly actor: string;
  readonly timestamp: string;
  readonly approvalStatus: ApprovalStatus;
  readonly visibility?: MemoryVisibility;
  readonly retention: RetentionRule;
  readonly artifactLink?: string;
}

export interface MemoryCandidate {
  readonly candidateId: string;
  readonly content: string;
  readonly provenance: ProvenanceStamp;
  readonly intendedVisibility: MemoryVisibility;
  readonly purpose: string;
}

export interface CreateMemoryCandidateInput {
  readonly candidateId: string;
  readonly content: string;
  readonly provenance: ProvenanceStamp;
  readonly intendedVisibility?: MemoryVisibility;
  readonly purpose: string;
}

export interface RedactionFinding {
  readonly findingId: string;
  readonly kind: "secret_like" | "pii_like" | "sensitive_marker";
  readonly field: string;
  readonly patternName: string;
}

export interface RedactionDecision {
  readonly outcome: RedactionOutcome;
  readonly rationale: string;
  readonly findings: readonly RedactionFinding[];
  readonly redactedContent?: string;
}

export interface GovernanceWriteDecision {
  readonly outcome: RedactionOutcome;
  readonly candidateId: string;
  readonly rationale: string;
  readonly redaction: RedactionDecision;
  readonly approvedContent?: string;
}

export interface MemoryOperationRequest {
  readonly operationId: string;
  readonly operationType: OperationType;
  readonly actor: string;
  readonly purpose: string;
  readonly targetMemoryIds: readonly string[];
  readonly requestedAt: string;
  readonly includeProvenance: boolean;
}

export interface CreateMemoryOperationRequestInput {
  readonly operationId: string;
  readonly operationType: OperationType;
  readonly actor: string;
  readonly purpose: string;
  readonly targetMemoryIds?: readonly string[];
  readonly requestedAt: string;
  readonly includeProvenance?: boolean;
}

export interface OperationDecision {
  readonly operationId: string;
  readonly outcome: OperationDecisionOutcome;
  readonly reason: string;
  readonly requiredCleanupTargets: readonly string[];
  readonly includeProvenance: boolean;
}

export function createRetentionRule(input: CreateRetentionRuleInput): RetentionRule {
  assertText(input.policyId, "Retention policy ID is required.");

  if (input.memoryClass === "raw_observation") {
    if (!Number.isInteger(input.ttlHours) || (input.ttlHours ?? 0) <= 0) {
      throw new PrivacyGovernanceValidationError(
        "Raw observation retention requires an explicit positive TTL in hours.",
      );
    }
  }

  return {
    policyId: input.policyId.trim(),
    memoryClass: input.memoryClass,
    ttlHours: input.ttlHours,
    disposalAction: input.disposalAction ?? (input.memoryClass === "raw_observation" ? "expire" : "retain"),
  };
}

export function createProvenanceStamp(input: CreateProvenanceStampInput): ProvenanceStamp {
  assertText(input.source, "Provenance source is required.");
  assertText(input.actor, "Provenance actor is required.");
  assertText(input.timestamp, "Provenance timestamp is required.");

  return {
    source: input.source.trim(),
    actor: input.actor.trim(),
    timestamp: input.timestamp.trim(),
    approvalStatus: input.approvalStatus,
    visibility: input.visibility ?? "workspace",
    retention: input.retention,
    artifactLink: cleanOptional(input.artifactLink),
  };
}

export function createMemoryCandidate(input: CreateMemoryCandidateInput): MemoryCandidate {
  assertText(input.candidateId, "Memory candidate ID is required.");
  assertText(input.content, "Memory candidate content is required.");
  assertText(input.purpose, "Memory candidate purpose is required.");

  return {
    candidateId: input.candidateId.trim(),
    content: input.content,
    provenance: input.provenance,
    intendedVisibility: input.intendedVisibility ?? input.provenance.visibility,
    purpose: input.purpose.trim(),
  };
}

export function createMemoryOperationRequest(
  input: CreateMemoryOperationRequestInput,
): MemoryOperationRequest {
  assertText(input.operationId, "Memory operation ID is required.");
  assertText(input.actor, "Memory operation actor is required.");
  assertText(input.purpose, "Memory operation purpose is required.");
  assertText(input.requestedAt, "Memory operation timestamp is required.");

  return {
    operationId: input.operationId.trim(),
    operationType: input.operationType,
    actor: input.actor.trim(),
    purpose: input.purpose.trim(),
    targetMemoryIds: [...(input.targetMemoryIds ?? [])],
    requestedAt: input.requestedAt.trim(),
    includeProvenance: input.includeProvenance ?? input.operationType === "export",
  };
}

export function reviewSensitiveContent(content: string): RedactionDecision {
  const findings = detectSensitiveFindings(content);
  if (findings.length === 0) {
    return {
      outcome: "allow",
      rationale: "No local sensitive-content heuristic matched.",
      findings,
    };
  }

  const hasSecret = findings.some((finding) => finding.kind === "secret_like");
  const redactedContent = redactSensitiveContent(content);

  return {
    outcome: hasSecret ? "redact" : "approval_required",
    rationale: hasSecret
      ? "Secret-like content was detected and must be redacted before durable storage."
      : "Sensitive content was detected and requires approval before durable storage.",
    findings,
    redactedContent,
  };
}

export function evaluateGovernedWrite(candidate: MemoryCandidate): GovernanceWriteDecision {
  const redaction = reviewSensitiveContent(candidate.content);

  if (redaction.outcome === "redact") {
    return {
      outcome: "redact",
      candidateId: candidate.candidateId,
      rationale: redaction.rationale,
      redaction,
      approvedContent: redaction.redactedContent,
    };
  }

  if (redaction.outcome === "approval_required") {
    return {
      outcome: "approval_required",
      candidateId: candidate.candidateId,
      rationale: redaction.rationale,
      redaction,
    };
  }

  if (candidate.intendedVisibility === "team_shared" && candidate.provenance.approvalStatus !== "approved") {
    return {
      outcome: "approval_required",
      candidateId: candidate.candidateId,
      rationale: "Team-shared durable memory requires explicit approval evidence.",
      redaction,
    };
  }

  return {
    outcome: "allow",
    candidateId: candidate.candidateId,
    rationale: "Candidate passed governance write checks.",
    redaction,
    approvedContent: candidate.content,
  };
}

export function evaluateMemoryOperation(request: MemoryOperationRequest): OperationDecision {
  if ((request.operationType === "delete" || request.operationType === "export") && request.targetMemoryIds.length === 0) {
    return {
      operationId: request.operationId,
      outcome: "denied",
      reason: `${request.operationType} requires at least one target memory ID or approved target scope.`,
      requiredCleanupTargets: [],
      includeProvenance: request.includeProvenance,
    };
  }

  if (request.operationType === "write") {
    return {
      operationId: request.operationId,
      outcome: "approval_required",
      reason: "Write operations require candidate-level governance evaluation before durable storage.",
      requiredCleanupTargets: [],
      includeProvenance: request.includeProvenance,
    };
  }

  return {
    operationId: request.operationId,
    outcome: "allowed",
    reason: `${request.operationType} operation has actor, purpose, and target evidence.`,
    requiredCleanupTargets: request.operationType === "delete" ? ["durable-record", "local-index", "lifecycle-edges", "future-vector-index"] : [],
    includeProvenance: request.includeProvenance,
  };
}

function detectSensitiveFindings(content: string): readonly RedactionFinding[] {
  const patterns: Array<{
    readonly kind: RedactionFinding["kind"];
    readonly patternName: string;
    readonly pattern: RegExp;
  }> = [
    {
      kind: "secret_like",
      patternName: "aws-access-key-id",
      pattern: /AKIA[0-9A-Z]{16}/u,
    },
    {
      kind: "secret_like",
      patternName: "key-value-secret",
      pattern: /(?:api[_-]?key|token|secret|password)\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{8,}/iu,
    },
    {
      kind: "secret_like",
      patternName: "private-key-block",
      pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
    },
    {
      kind: "pii_like",
      patternName: "email-address",
      pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu,
    },
    {
      kind: "sensitive_marker",
      patternName: "sensitive-marker",
      pattern: /\b(confidential|restricted|sensitive)\b/iu,
    },
  ];

  return patterns
    .filter(({ pattern }) => pattern.test(content))
    .map(({ kind, patternName }, index) => ({
      findingId: `finding:${index + 1}:${patternName}`,
      kind,
      field: "content",
      patternName,
    }));
}

function redactSensitiveContent(content: string): string {
  return content
    .replace(/AKIA[0-9A-Z]{16}/gu, "[REDACTED_SECRET]")
    .replace(/((?:api[_-]?key|token|secret|password)\s*[:=]\s*)["']?[A-Za-z0-9_./+=-]{8,}/giu, "$1[REDACTED_SECRET]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gu, "[REDACTED_PRIVATE_KEY]");
}

function assertText(value: string | undefined, message: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new PrivacyGovernanceValidationError(message);
  }
}

function cleanOptional(value: string | undefined): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}