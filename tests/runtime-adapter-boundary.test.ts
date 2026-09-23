import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";

import {
  CAPABILITY_NAMES,
  CapabilityRouter,
  RUNTIME_TRIGGER_LABELS,
  RuntimeAdapterValidationError,
  RuntimeTriggerCoordinator,
  assertLocalModeIndependence,
  createJobObservationRecord,
  createRuntimeAdapterBinding,
  createRuntimeTriggerPayload,
  disableRuntimeAdapter,
  enableRuntimeAdapter,
  evaluateRuntimeAdapterPolicy,
  isRuntimeTriggerLabel,
  listRuntimeTriggerDescriptors,
  markRuntimeAdapterUnavailable,
  observeMemoryJob,
  createMemoryJobRun,
  publishJobObservation,
  requireCapabilityDefinition,
  requireRuntimeTriggerDescriptor,
  resolveExecutionMode,
  routeRuntimeTrigger,
  type RuntimeAdapterBinding,
  type RuntimeTriggerLabel,
} from "../src/index.js";

const timestamp = "2026-07-27T00:00:00.000Z";

describe("BOLT-06 iii runtime adapter boundary", () => {
  it("publishes trigger descriptors that reuse approved BOLT-05 capabilities and job types", () => {
    const descriptors = listRuntimeTriggerDescriptors();

    assert.deepEqual(
      descriptors.map((descriptor) => descriptor.label),
      [...RUNTIME_TRIGGER_LABELS],
    );
    assert.equal(isRuntimeTriggerLabel("memory.rebuild"), true);
    assert.equal(isRuntimeTriggerLabel("memory.deploy"), false);
    assert.throws(() => requireRuntimeTriggerDescriptor("memory.deploy"), RuntimeAdapterValidationError);

    for (const descriptor of descriptors) {
      if (!descriptor.capabilityName) {
        assert.equal(descriptor.support, "descriptor_only");
        continue;
      }

      const definition = requireCapabilityDefinition(descriptor.capabilityName);
      assert.equal(descriptor.jobType, definition.jobType);
      assert.equal(descriptor.governanceRequired, definition.governanceRequired);
      assert.ok(descriptor.trace.stories.includes("US-007"));
      assert.ok(descriptor.trace.nfrs.includes("NFR-015"));
    }

    // Consolidation stays descriptor-only until an approved domain port exists.
    assert.equal(requireRuntimeTriggerDescriptor("memory.consolidate").support, "descriptor_only");
    assert.equal(requireRuntimeTriggerDescriptor("memory.rebuild").capabilityName, "rebuild_index");
    assert.equal(requireRuntimeTriggerDescriptor("memory.delete.observe").governanceRequired, true);
  });

  it("keeps every capability available in local mode with no, disabled, or unavailable adapter", () => {
    const unbound = evaluateRuntimeAdapterPolicy();
    assert.equal(unbound.adapterState, "disabled");
    assert.equal(unbound.executionMode, "local");
    assert.equal(unbound.localModeAvailable, true);
    assert.deepEqual(unbound.locallyAvailableCapabilities, [...CAPABILITY_NAMES]);
    assert.deepEqual(unbound.adapterDependentCapabilities, []);
    assert.deepEqual(unbound.activeTriggers, []);
    assert.doesNotThrow(() => assertLocalModeIndependence(unbound));

    const binding = iiiBinding();
    assert.equal(binding.status.state, "disabled", "a declared binding must not enable itself");
    assert.equal(resolveExecutionMode(binding), "local");

    const unavailable = markRuntimeAdapterUnavailable(binding, {
      reason: "Runtime endpoint did not respond.",
      observedAt: timestamp,
    });
    const unavailableDecision = evaluateRuntimeAdapterPolicy(unavailable);
    assert.equal(unavailableDecision.adapterState, "unavailable");
    assert.equal(unavailableDecision.executionMode, "local");
    assert.deepEqual(unavailableDecision.locallyAvailableCapabilities, [...CAPABILITY_NAMES]);
    assert.deepEqual(unavailableDecision.activeTriggers, []);
    assert.doesNotThrow(() => assertLocalModeIndependence(unavailableDecision));

    const enabled = evaluateRuntimeAdapterPolicy(enabledBinding());
    assert.equal(enabled.executionMode, "runtime_assisted");
    assert.deepEqual(enabled.locallyAvailableCapabilities, [...CAPABILITY_NAMES]);
    assert.deepEqual(enabled.adapterDependentCapabilities, []);
    assert.ok(enabled.activeTriggers.includes("memory.rebuild"));
    assert.equal(enabled.activeTriggers.includes("memory.consolidate"), false);
  });

  it("validates adapter binding input and status transitions", () => {
    assert.throws(
      () => createRuntimeAdapterBinding({ bindingId: "", adapterLabel: "iii-engine", workspaceId: "agent-memory" }),
      RuntimeAdapterValidationError,
    );
    assert.throws(
      () =>
        createRuntimeAdapterBinding({
          bindingId: "binding:iii",
          adapterLabel: "iii-engine",
          workspaceId: "agent-memory",
          supportedTriggers: ["memory.deploy" as RuntimeTriggerLabel],
        }),
      RuntimeAdapterValidationError,
    );
    assert.throws(
      () => enableRuntimeAdapter(iiiBinding(), { reason: "" }),
      RuntimeAdapterValidationError,
    );

    const enabled = enableRuntimeAdapter(iiiBinding(), {
      reason: "Operator enabled the optional runtime adapter.",
      observedAt: timestamp,
    });
    assert.equal(enabled.status.state, "enabled");
    assert.equal(enabled.status.lastObservedAt, timestamp);

    const disabled = disableRuntimeAdapter(enabled, { reason: "Operator returned to local-only mode." });
    assert.equal(disabled.status.state, "disabled");
    assert.equal(disabled.status.reason, "Operator returned to local-only mode.");
    // Status changes are copies, so an earlier observation is never rewritten.
    assert.equal(enabled.status.state, "enabled");
  });

  it("maps enabled triggers to internal capability requests without executing them", () => {
    const binding = enabledBinding();
    const routing = routeRuntimeTrigger(rebuildTrigger(), binding);

    assert.equal(routing.outcome, "routed");
    assert.equal(routing.request?.capabilityName, "rebuild_index");
    assert.equal(routing.request?.context.requestedSurface, "internal");
    assert.equal(routing.request?.context.correlationId, "run-42");
    assert.equal(routing.request?.requestId, "iii:memory.rebuild:run-42");
    assert.equal(routing.request?.payload.rebuildMode, "full");
  });

  it("rejects triggers that no enabled, matching, declared binding supports", () => {
    assert.equal(routeRuntimeTrigger(rebuildTrigger()).outcome, "rejected");
    assert.match(routeRuntimeTrigger(rebuildTrigger()).reason, /local mode/u);
    assert.equal(routeRuntimeTrigger(rebuildTrigger(), iiiBinding()).outcome, "rejected");

    const otherWorkspace = createRuntimeTriggerPayload({
      triggerLabel: "memory.rebuild",
      workspaceId: "other-workspace",
      initiator: "iii-worker",
      purpose: "Rebuild a workspace this binding does not own.",
      receivedAt: timestamp,
    });
    assert.equal(routeRuntimeTrigger(otherWorkspace, enabledBinding()).outcome, "rejected");

    const narrowBinding = enableRuntimeAdapter(
      createRuntimeAdapterBinding({
        bindingId: "binding:iii",
        adapterLabel: "iii-engine",
        workspaceId: "agent-memory",
        supportedTriggers: ["memory.query.observe"],
      }),
      { reason: "Only query observation was approved for this binding." },
    );
    assert.equal(routeRuntimeTrigger(rebuildTrigger(), narrowBinding).outcome, "rejected");

    const consolidate = routeRuntimeTrigger(
      createRuntimeTriggerPayload({
        triggerLabel: "memory.consolidate",
        workspaceId: "agent-memory",
        initiator: "iii-worker",
        purpose: "Consolidate raw observations.",
        receivedAt: timestamp,
      }),
      enabledBinding(),
    );
    assert.equal(consolidate.outcome, "descriptor_only");
    assert.equal(consolidate.request, undefined);
  });

  it("preserves governance decisions for adapter-triggered destructive operations", () => {
    const coordinator = new RuntimeTriggerCoordinator({
      router: new CapabilityRouter({ now: () => timestamp }),
      binding: enabledBinding(),
    });

    const deniedDelete = coordinator.handleTrigger(deleteTrigger({ reason: "Remove stale memory." }));
    assert.equal(deniedDelete.routing.outcome, "routed");
    assert.equal(deniedDelete.response?.status, "denied");
    assert.equal(deniedDelete.response?.governanceDecision?.outcome, "denied");
    assert.equal(deniedDelete.observation, undefined);

    const allowedDelete = coordinator.handleTrigger(
      deleteTrigger({
        reason: "Remove approved stale memory.",
        targetMemoryIds: ["memory:stale-note"],
        confirmationEvidence: "Operator confirmed deletion.",
      }),
    );
    assert.equal(allowedDelete.response?.status, "accepted");
    assert.equal(allowedDelete.response?.governanceDecision?.outcome, "allowed");
    assert.equal(allowedDelete.response?.job?.status, "queued");
    assert.equal(allowedDelete.observation?.outcome, "published");
    assert.equal(allowedDelete.observation?.record?.triggerLabel, "memory.delete.observe");
    assert.equal(allowedDelete.observation?.record?.correlationId, "run-42");

    // A trigger never reaches a capability while the adapter is off, so nothing is routed.
    const offCoordinator = new RuntimeTriggerCoordinator({
      router: new CapabilityRouter({ now: () => timestamp }),
      binding: iiiBinding(),
    });
    const blocked = offCoordinator.handleTrigger(deleteTrigger({ reason: "Remove stale memory." }));
    assert.equal(blocked.routing.outcome, "rejected");
    assert.equal(blocked.response, undefined);
    assert.deepEqual(offCoordinator.describeSupportedTriggers(), []);
  });

  it("summarizes job observations without raw target scope or sensitive content", () => {
    const run = createMemoryJobRun({
      jobId: "job:export",
      jobType: "export",
      workspaceId: "agent-memory",
      initiator: "iii-worker",
      targetScope: "memory:one,memory:two,memory:three",
      startedAt: timestamp,
      status: "completed",
    });
    const record = createJobObservationRecord(observeMemoryJob(run), {
      triggerLabel: "memory.export.observe",
      correlationId: "run-42",
    });

    assert.equal(record.targetScopeDigest, "scope:3-targets");
    assert.equal(
      JSON.stringify(record).includes("memory:one"),
      false,
      "raw target scope must not appear in an observation record",
    );
    assert.deepEqual(record.redactedFields, []);

    const published = publishJobObservation(record, "local_log", enabledBinding());
    assert.equal(published.outcome, "published");
    assert.ok(published.trace.nfrs.includes("NFR-014"));

    const sensitive = createJobObservationRecord(
      observeMemoryJob({
        ...run,
        status: "failed",
        completedAt: timestamp,
        errors: ["Rebuild failed while reading api_key=ABCD1234EFGH from config."],
      }),
    );
    assert.deepEqual(sensitive.redactedFields, ["errors[0]"]);
    assert.equal(sensitive.errors[0]?.includes("ABCD1234EFGH"), false);
    assert.equal(publishJobObservation(sensitive, "local_log").outcome, "withheld");

    assert.equal(
      publishJobObservation(record, "runtime_adapter", iiiBinding()).outcome,
      "skipped",
      "observation must stay local while the adapter is not enabled",
    );
    assert.equal(publishJobObservation(record, "runtime_adapter", enabledBinding()).outcome, "skipped");
    assert.throws(
      () => publishJobObservation(record, "iii_console" as never),
      RuntimeAdapterValidationError,
    );
  });

  it("requires no concrete iii SDK dependency or import in the domain source", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const dependencyNames = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ];

    for (const forbidden of ["iii", "@iii-hq", "temporal", "inngest"]) {
      assert.equal(
        dependencyNames.some((dependencyName) => dependencyName.toLowerCase().includes(forbidden)),
        false,
      );
    }

    const sourceRoot = new URL("../../src/domain/", import.meta.url);
    for (const relativePath of listTypeScriptSources(sourceRoot)) {
      const source = readFileSync(new URL(relativePath, sourceRoot), "utf8");
      const importTargets = [...source.matchAll(/from\s+"([^"]+)"|require\("([^"]+)"\)/gu)].map(
        (match) => match[1] ?? match[2] ?? "",
      );

      for (const target of importTargets) {
        assert.equal(
          target.startsWith(".") || target.startsWith("node:"),
          true,
          `${relativePath} imports non-local module '${target}'`,
        );
      }
    }
  });
});

function iiiBinding(): RuntimeAdapterBinding {
  return createRuntimeAdapterBinding({
    bindingId: "binding:iii",
    adapterLabel: "iii-engine",
    workspaceId: "agent-memory",
    correlationPrefix: "iii",
    observationTargets: ["local_log"],
  });
}

function enabledBinding(): RuntimeAdapterBinding {
  return enableRuntimeAdapter(iiiBinding(), {
    reason: "Operator enabled the optional runtime adapter.",
    observedAt: timestamp,
  });
}

function rebuildTrigger() {
  return createRuntimeTriggerPayload({
    triggerLabel: "memory.rebuild",
    workspaceId: "agent-memory",
    initiator: "iii-worker",
    purpose: "Rebuild derived projections after a lifecycle artifact changed.",
    receivedAt: timestamp,
    correlationId: "run-42",
    payload: { rebuildMode: "full" },
  });
}

function deleteTrigger(payload: Record<string, unknown>) {
  return createRuntimeTriggerPayload({
    triggerLabel: "memory.delete.observe",
    workspaceId: "agent-memory",
    initiator: "iii-worker",
    purpose: "Observe a governed delete operation.",
    receivedAt: timestamp,
    correlationId: "run-42",
    payload,
  });
}

function listTypeScriptSources(root: URL): readonly string[] {
  const paths: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      paths.push(...listTypeScriptSources(new URL(`${entry.name}/`, root)).map((child) => `${entry.name}/${child}`));
    } else if (entry.name.endsWith(".ts")) {
      paths.push(entry.name);
    }
  }

  return paths;
}
