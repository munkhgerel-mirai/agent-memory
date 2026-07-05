import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PrivacyGovernanceValidationError,
  createMemoryCandidate,
  createMemoryOperationRequest,
  createProvenanceStamp,
  createRetentionRule,
  evaluateGovernedWrite,
  evaluateMemoryOperation,
  reviewSensitiveContent,
} from "../src/index.js";

const timestamp = "2026-06-16T03:30:00.000Z";

describe("BOLT-04 privacy governance and memory operations", () => {
  it("redacts secret-like values before durable storage", () => {
    const decision = reviewSensitiveContent("apiKey = abcdefgh123456789");

    assert.equal(decision.outcome, "redact");
    assert.equal(decision.findings[0]?.kind, "secret_like");
    assert.match(decision.redactedContent ?? "", /\[REDACTED_SECRET\]/u);
  });

  it("requires approval for sensitive non-secret markers", () => {
    const decision = reviewSensitiveContent("This workspace note is confidential.");

    assert.equal(decision.outcome, "approval_required");
    assert.equal(decision.findings[0]?.kind, "sensitive_marker");
  });

  it("validates provenance and defaults visibility to workspace", () => {
    const provenance = approvedProvenance();

    assert.equal(provenance.source, "docs/02-construction/04-code-generation/test_results_bolt03.md");
    assert.equal(provenance.actor, "user");
    assert.equal(provenance.visibility, "workspace");
    assert.equal(provenance.retention.memoryClass, "approved_lifecycle_memory");

    assert.throws(
      () =>
        createProvenanceStamp({
          source: "",
          actor: "user",
          timestamp,
          approvalStatus: "approved",
          retention: lifecycleRetention(),
        }),
      PrivacyGovernanceValidationError,
    );
  });

  it("requires explicit TTL for raw observation retention", () => {
    assert.throws(
      () =>
        createRetentionRule({
          policyId: "raw-observation-short",
          memoryClass: "raw_observation",
        }),
      /requires an explicit positive TTL/u,
    );

    const retention = createRetentionRule({
      policyId: "raw-observation-short",
      memoryClass: "raw_observation",
      ttlHours: 24,
    });
    assert.equal(retention.disposalAction, "expire");
    assert.equal(retention.ttlHours, 24);
  });

  it("requires approval evidence for team-shared durable writes", () => {
    const candidate = createMemoryCandidate({
      candidateId: "candidate:team-shared",
      content: "Team-shared memory candidate with no secret.",
      purpose: "Share durable memory with team.",
      intendedVisibility: "team_shared",
      provenance: createProvenanceStamp({
        source: "docs/01-inception/02-user-stories/all_user_stories.md",
        actor: "agent",
        timestamp,
        approvalStatus: "pending_review",
        visibility: "team_shared",
        retention: lifecycleRetention(),
      }),
    });

    const decision = evaluateGovernedWrite(candidate);
    assert.equal(decision.outcome, "approval_required");
    assert.match(decision.rationale, /Team-shared durable memory requires/u);
  });

  it("allows approved safe lifecycle memory and preserves approved content", () => {
    const candidate = createMemoryCandidate({
      candidateId: "candidate:safe",
      content: "Approved lifecycle memory candidate with safe content.",
      purpose: "Store approved memory.",
      provenance: approvedProvenance(),
    });

    const decision = evaluateGovernedWrite(candidate);
    assert.equal(decision.outcome, "allow");
    assert.equal(decision.approvedContent, candidate.content);
  });

  it("redacts governed writes with secret-like content", () => {
    const candidate = createMemoryCandidate({
      candidateId: "candidate:secret",
      content: "token: abcdefgh123456789 should not persist raw.",
      purpose: "Attempt durable write.",
      provenance: approvedProvenance(),
    });

    const decision = evaluateGovernedWrite(candidate);
    assert.equal(decision.outcome, "redact");
    assert.notEqual(decision.approvedContent, candidate.content);
    assert.match(decision.approvedContent ?? "", /\[REDACTED_SECRET\]/u);
  });

  it("creates delete and export operation decisions with required evidence", () => {
    const deleteDecision = evaluateMemoryOperation(
      createMemoryOperationRequest({
        operationId: "operation:delete",
        operationType: "delete",
        actor: "user",
        purpose: "Remove stale memory.",
        targetMemoryIds: ["memory:old"],
        requestedAt: timestamp,
      }),
    );

    assert.equal(deleteDecision.outcome, "allowed");
    assert.deepEqual(deleteDecision.requiredCleanupTargets, [
      "durable-record",
      "local-index",
      "lifecycle-edges",
      "future-vector-index",
    ]);

    const exportDecision = evaluateMemoryOperation(
      createMemoryOperationRequest({
        operationId: "operation:export",
        operationType: "export",
        actor: "user",
        purpose: "Audit memory.",
        targetMemoryIds: ["memory:current"],
        requestedAt: timestamp,
      }),
    );

    assert.equal(exportDecision.outcome, "allowed");
    assert.equal(exportDecision.includeProvenance, true);
  });

  it("denies destructive or export operations without targets", () => {
    const decision = evaluateMemoryOperation(
      createMemoryOperationRequest({
        operationId: "operation:delete-empty",
        operationType: "delete",
        actor: "user",
        purpose: "Delete without target.",
        requestedAt: timestamp,
      }),
    );

    assert.equal(decision.outcome, "denied");
    assert.match(decision.reason, /requires at least one target memory ID/u);
  });
});

function lifecycleRetention() {
  return createRetentionRule({
    policyId: "approved-lifecycle-memory",
    memoryClass: "approved_lifecycle_memory",
  });
}

function approvedProvenance() {
  return createProvenanceStamp({
    source: "docs/02-construction/04-code-generation/test_results_bolt03.md",
    actor: "user",
    timestamp,
    approvalStatus: "approved",
    retention: lifecycleRetention(),
  });
}