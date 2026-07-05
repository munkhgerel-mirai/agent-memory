import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  CAPABILITY_NAMES,
  CLI_COMMAND_DESCRIPTORS,
  CapabilityRouter,
  FrameworkIntegrationValidationError,
  LOCAL_API_ENDPOINT_DESCRIPTORS,
  LocalWorkspaceIndexProjection,
  MCP_TOOL_DESCRIPTORS,
  completeMemoryJobRun,
  createCapabilityRequest,
  createInvocationContext,
  createMemoryJobRun,
  createProjectedMemoryRecord,
  failMemoryJobRun,
  isCapabilityName,
  listCapabilityDefinitions,
  observeMemoryJob,
  requireCapabilityDefinition,
  type CapabilityName,
  type LocalMemorySearchResult,
  type ProjectedMemoryRecord,
} from "../src/index.js";

const timestamp = "2026-07-06T00:00:00.000Z";

describe("BOLT-05 framework-agnostic integration contracts", () => {
  it("defines approved capabilities and validates invocation context", () => {
    assert.deepEqual(
      listCapabilityDefinitions().map((definition) => definition.name),
      [...CAPABILITY_NAMES],
    );
    assert.equal(isCapabilityName("get_context"), true);
    assert.equal(isCapabilityName("unknown_memory"), false);
    assert.throws(
      () => requireCapabilityDefinition("unknown_memory"),
      FrameworkIntegrationValidationError,
    );

    const context = createInvocationContext({
      actor: " agent ",
      workspaceId: " agent-memory ",
      requestedSurface: "mcp",
      purpose: " Request startup context. ",
      requestedAt: timestamp,
    });
    const request = createCapabilityRequest({
      requestId: " request:context ",
      capabilityName: "get_context",
      context,
      payload: { goal: "BOLT-05 implementation" },
    });

    assert.equal(context.actor, "agent");
    assert.equal(context.workspaceId, "agent-memory");
    assert.equal(request.requestId, "request:context");
    assert.equal(request.payload.goal, "BOLT-05 implementation");
    assert.throws(
      () =>
        createInvocationContext({
          actor: "",
          workspaceId: "agent-memory",
          requestedSurface: "cli",
          purpose: "Invalid request.",
          requestedAt: timestamp,
        }),
      FrameworkIntegrationValidationError,
    );
  });

  it("keeps MCP, CLI, and local API descriptor maps consistent and data-only", () => {
    assert.deepEqual(descriptorNames(MCP_TOOL_DESCRIPTORS), [...CAPABILITY_NAMES]);
    assert.deepEqual(descriptorNames(CLI_COMMAND_DESCRIPTORS), [...CAPABILITY_NAMES]);
    assert.deepEqual(descriptorNames(LOCAL_API_ENDPOINT_DESCRIPTORS), [...CAPABILITY_NAMES]);

    assert.equal(
      MCP_TOOL_DESCRIPTORS.find((descriptor) => descriptor.capabilityName === "get_context")?.toolName,
      "get_context",
    );
    assert.equal(
      CLI_COMMAND_DESCRIPTORS.find((descriptor) => descriptor.capabilityName === "delete_memory")?.command,
      "agent-memory delete",
    );
    assert.equal(
      LOCAL_API_ENDPOINT_DESCRIPTORS.find((descriptor) => descriptor.capabilityName === "write_memory")?.path,
      "/memory",
    );

    assert.equal(containsFunction(MCP_TOOL_DESCRIPTORS), false);
    assert.equal(containsFunction(CLI_COMMAND_DESCRIPTORS), false);
    assert.equal(containsFunction(LOCAL_API_ENDPOINT_DESCRIPTORS), false);
  });

  it("marks export, delete, and write capabilities as governance-required", () => {
    const governedCapabilities: readonly CapabilityName[] = ["export_memory", "delete_memory", "write_memory"];

    for (const capabilityName of governedCapabilities) {
      assert.equal(requireCapabilityDefinition(capabilityName).governanceRequired, true);
    }

    const allSurfaceDescriptors = [
      ...MCP_TOOL_DESCRIPTORS,
      ...CLI_COMMAND_DESCRIPTORS,
      ...LOCAL_API_ENDPOINT_DESCRIPTORS,
    ];
    for (const descriptor of allSurfaceDescriptors) {
      if (governedCapabilities.includes(descriptor.capabilityName)) {
        assert.equal(descriptor.governanceRequired, true);
        assert.ok(descriptor.trace.nfrs.includes("NFR-011"));
      }
    }
  });

  it("routes query and inspect through the existing local projection port", () => {
    const projection = new LocalWorkspaceIndexProjection();
    try {
      projection.upsertProjection(
        createProjectedMemoryRecord({
          memoryId: "memory:bolt05-plan",
          workspacePath: "docs/02-construction/02-design-plan/code_generation_followup_plan_bolt05.md",
          category: "PlanMemory",
          approvalStatus: "approved",
          observedVersion: "bolt05-plan-v1",
          observedAt: timestamp,
          sourceKind: "lifecycle_artifact",
          text: "BOLT-05 framework-agnostic capability contracts and descriptor maps.",
          lastProjectedAt: timestamp,
        }),
      );

      const router = new CapabilityRouter({ projection, now: () => timestamp });
      const queryResponse = router.invokeCapability(
        createCapabilityRequest({
          requestId: "request:query",
          capabilityName: "query_memory",
          context: cliContext(),
          payload: { query: "BOLT-05 descriptor", limit: 5 },
        }),
      );
      const queryPayload = queryResponse.payload as readonly LocalMemorySearchResult[];

      assert.equal(queryResponse.status, "completed");
      assert.equal(queryPayload[0]?.record.memoryId, "memory:bolt05-plan");
      assert.ok(queryPayload[0]?.matchedSignals.some((signal) => signal.startsWith("query-text")));

      const inspectResponse = router.invokeCapability(
        createCapabilityRequest({
          requestId: "request:inspect",
          capabilityName: "inspect_memory",
          context: cliContext(),
          payload: { memoryId: "memory:bolt05-plan", includeProvenance: true },
        }),
      );
      const inspected = inspectResponse.payload as ProjectedMemoryRecord;

      assert.equal(inspectResponse.status, "completed");
      assert.equal(inspected.workspacePath, "docs/02-construction/02-design-plan/code_generation_followup_plan_bolt05.md");
    } finally {
      projection.close();
    }
  });

  it("requires governance decisions for destructive, export, and write requests", () => {
    const router = new CapabilityRouter({ now: () => timestamp });

    const deleteDenied = router.invokeCapability(
      createCapabilityRequest({
        requestId: "request:delete-empty",
        capabilityName: "delete_memory",
        context: cliContext(),
        payload: { reason: "Delete stale memory." },
      }),
    );
    assert.equal(deleteDenied.status, "denied");
    assert.equal(deleteDenied.governanceDecision?.outcome, "denied");

    const exportAccepted = router.invokeCapability(
      createCapabilityRequest({
        requestId: "request:export",
        capabilityName: "export_memory",
        context: cliContext(),
        payload: {
          targetMemoryIds: ["memory:bolt05-plan"],
          reason: "Audit approved BOLT-05 memory.",
          includeProvenance: true,
        },
      }),
    );
    assert.equal(exportAccepted.status, "accepted");
    assert.equal(exportAccepted.governanceDecision?.outcome, "allowed");
    assert.equal(exportAccepted.job?.status, "queued");
    assert.equal(exportAccepted.job?.jobType, "export");

    const writeRequiresApproval = router.invokeCapability(
      createCapabilityRequest({
        requestId: "request:write",
        capabilityName: "write_memory",
        context: localApiContext(),
        payload: {
          candidateId: "candidate:approved-memory",
          content: "Approved lifecycle memory candidate.",
          approvalEvidence: "User approval recorded.",
        },
      }),
    );
    assert.equal(writeRequiresApproval.status, "approval_required");
    assert.equal(writeRequiresApproval.governanceDecision?.outcome, "approval_required");
  });

  it("creates memory job lifecycle observations without runtime adapter dependency", () => {
    const run = createMemoryJobRun({
      jobId: "job:rebuild",
      jobType: "rebuild",
      workspaceId: "agent-memory",
      initiator: "copilot",
      targetScope: "workspace:index",
      startedAt: timestamp,
      status: "running",
    });
    const completed = completeMemoryJobRun(run, {
      completedAt: "2026-07-06T00:01:00.000Z",
      resultSummary: "Rebuild completed with no warnings.",
      provenanceLink: "docs/02-construction/04-code-generation/test_results_bolt05.md",
    });
    const completedObservation = observeMemoryJob(completed);

    assert.equal(completedObservation.status, "completed");
    assert.equal(completedObservation.retryable, false);
    assert.equal(completedObservation.provenanceLink, "docs/02-construction/04-code-generation/test_results_bolt05.md");

    const failed = failMemoryJobRun(run, {
      completedAt: "2026-07-06T00:02:00.000Z",
      error: "Projection lock unavailable.",
    });
    const failedObservation = observeMemoryJob(failed);
    assert.equal(failedObservation.status, "failed");
    assert.equal(failedObservation.retryable, true);
    assert.deepEqual(failedObservation.errors, ["Projection lock unavailable."]);
    assert.throws(
      () =>
        createMemoryJobRun({
          jobId: "job:invalid",
          jobType: "query",
          workspaceId: "agent-memory",
          initiator: "copilot",
          targetScope: "",
          startedAt: timestamp,
        }),
      FrameworkIntegrationValidationError,
    );
  });

  it("does not require MCP, CLI parser, HTTP server, or iii runtime dependencies", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const dependencyNames = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ];

    for (const forbidden of ["mcp", "commander", "yargs", "express", "fastify", "iii"]) {
      assert.equal(
        dependencyNames.some((dependencyName) => dependencyName.toLowerCase().includes(forbidden)),
        false,
      );
    }
  });
});

function cliContext() {
  return createInvocationContext({
    actor: "operator",
    workspaceId: "agent-memory",
    requestedSurface: "cli",
    purpose: "Operate workspace memory.",
    requestedAt: timestamp,
  });
}

function localApiContext() {
  return createInvocationContext({
    actor: "local-tool",
    workspaceId: "agent-memory",
    requestedSurface: "local_api",
    purpose: "Write approved memory through local integration.",
    requestedAt: timestamp,
  });
}

function descriptorNames(
  descriptors: readonly { readonly capabilityName: CapabilityName }[],
): readonly CapabilityName[] {
  return descriptors.map((descriptor) => descriptor.capabilityName);
}

function containsFunction(value: unknown): boolean {
  if (typeof value === "function") return true;
  if (Array.isArray(value)) return value.some((item) => containsFunction(item));
  if (value && typeof value === "object") {
    return Object.values(value).some((item) => containsFunction(item));
  }

  return false;
}