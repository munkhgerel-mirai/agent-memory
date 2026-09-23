import {
  CAPABILITY_NAMES,
  createCapabilityRequest,
  createInvocationContext,
  requireCapabilityDefinition,
  type CapabilityName,
  type CapabilityPayload,
  type CapabilityRequest,
  type CapabilityResponse,
  type CapabilityRouter,
  type CapabilityTrace,
  type MemoryJobObservationSummary,
  type MemoryJobType,
} from "./framework-agnostic-integration.js";
import { reviewSensitiveContent } from "./privacy-governance.js";

export class RuntimeAdapterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeAdapterValidationError";
  }
}

export const ADAPTER_STATES = ["enabled", "disabled", "unavailable"] as const;

export type AdapterState = (typeof ADAPTER_STATES)[number];

export const RUNTIME_TRIGGER_LABELS = [
  "memory.rebuild",
  "memory.consolidate",
  "memory.export.observe",
  "memory.delete.observe",
  "memory.query.observe",
  "memory.context.observe",
] as const;

export type RuntimeTriggerLabel = (typeof RUNTIME_TRIGGER_LABELS)[number];

export const OBSERVATION_TARGETS = ["local_log", "local_api", "runtime_adapter"] as const;

export type ObservationTarget = (typeof OBSERVATION_TARGETS)[number];

/** Triggers that request work map to a capability; observe-only triggers just report on it. */
export type RuntimeTriggerMode = "invoke" | "observe";

/**
 * `descriptor_only` triggers are published so an external runtime can discover them, but the
 * approved BOLT-06 slice has no domain port behind them and refuses to route them.
 */
export type RuntimeTriggerSupport = "supported" | "descriptor_only";

export type ExecutionMode = "local" | "runtime_assisted";

export type RuntimeTriggerOutcome = "routed" | "descriptor_only" | "rejected";

export type ObservationPublicationOutcome = "published" | "withheld" | "skipped";

export interface AdapterStatus {
  readonly state: AdapterState;
  readonly reason: string;
  readonly lastObservedAt?: string;
}

export interface RuntimeTriggerDescriptor {
  readonly label: RuntimeTriggerLabel;
  readonly mode: RuntimeTriggerMode;
  readonly support: RuntimeTriggerSupport;
  readonly summary: string;
  readonly capabilityName?: CapabilityName;
  readonly jobType?: MemoryJobType;
  readonly governanceRequired: boolean;
  readonly trace: CapabilityTrace;
}

export interface RuntimeAdapterBinding {
  readonly bindingId: string;
  readonly adapterLabel: string;
  readonly workspaceId: string;
  readonly status: AdapterStatus;
  readonly supportedTriggers: readonly RuntimeTriggerLabel[];
  readonly observationTargets: readonly ObservationTarget[];
  readonly correlationPrefix?: string;
}

export interface CreateRuntimeAdapterBindingInput {
  readonly bindingId: string;
  readonly adapterLabel: string;
  readonly workspaceId: string;
  readonly supportedTriggers?: readonly RuntimeTriggerLabel[];
  readonly observationTargets?: readonly ObservationTarget[];
  readonly correlationPrefix?: string;
  readonly reason?: string;
  readonly observedAt?: string;
}

export interface ChangeAdapterStateInput {
  readonly reason: string;
  readonly observedAt?: string;
}

export interface RuntimeAdapterPolicyDecision {
  readonly adapterState: AdapterState;
  readonly executionMode: ExecutionMode;
  readonly localModeAvailable: boolean;
  readonly locallyAvailableCapabilities: readonly CapabilityName[];
  readonly adapterDependentCapabilities: readonly CapabilityName[];
  readonly activeTriggers: readonly RuntimeTriggerLabel[];
  readonly reason: string;
  readonly violations: readonly string[];
  readonly trace: CapabilityTrace;
}

export interface RuntimeTriggerPayload {
  readonly triggerLabel: RuntimeTriggerLabel;
  readonly workspaceId: string;
  readonly initiator: string;
  readonly purpose: string;
  readonly receivedAt: string;
  readonly correlationId?: string;
  readonly payload: CapabilityPayload;
}

export interface CreateRuntimeTriggerPayloadInput {
  readonly triggerLabel: RuntimeTriggerLabel;
  readonly workspaceId: string;
  readonly initiator: string;
  readonly purpose: string;
  readonly receivedAt: string;
  readonly correlationId?: string;
  readonly payload?: CapabilityPayload;
}

export interface RuntimeTriggerRouting {
  readonly triggerLabel: RuntimeTriggerLabel;
  readonly outcome: RuntimeTriggerOutcome;
  readonly reason: string;
  readonly descriptor: RuntimeTriggerDescriptor;
  readonly request?: CapabilityRequest;
  readonly governanceRequired: boolean;
  readonly trace: CapabilityTrace;
}

export interface RuntimeTriggerResult {
  readonly routing: RuntimeTriggerRouting;
  readonly response?: CapabilityResponse;
  readonly observation?: ObservationPublicationDecision;
}

export interface JobObservationRecord {
  readonly jobId: string;
  readonly jobType: MemoryJobType;
  readonly workspaceId: string;
  readonly initiator: string;
  readonly status: MemoryJobObservationSummary["status"];
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly resultSummary?: string;
  readonly provenanceLink?: string;
  readonly errors: readonly string[];
  readonly retryable: boolean;
  readonly targetScopeDigest: string;
  readonly triggerLabel?: RuntimeTriggerLabel;
  readonly correlationId?: string;
  readonly redactedFields: readonly string[];
}

export interface CreateJobObservationRecordInput {
  readonly triggerLabel?: RuntimeTriggerLabel;
  readonly correlationId?: string;
}

export interface ObservationPublicationDecision {
  readonly target: ObservationTarget;
  readonly outcome: ObservationPublicationOutcome;
  readonly reason: string;
  readonly record?: JobObservationRecord;
  readonly trace: CapabilityTrace;
}

export interface RuntimeTriggerCoordinatorPorts {
  readonly router: CapabilityRouter;
  readonly binding?: RuntimeAdapterBinding;
  readonly observationTarget?: ObservationTarget;
}

const ADAPTER_TRACE: CapabilityTrace = {
  stories: ["US-007"],
  nfrs: ["NFR-005", "NFR-014", "NFR-015"],
  risks: ["R-006", "R-011"],
};

const GOVERNED_TRIGGER_TRACE: CapabilityTrace = {
  stories: ["US-006", "US-007"],
  nfrs: ["NFR-005", "NFR-011", "NFR-014", "NFR-015"],
  risks: ["R-005", "R-006", "R-011", "R-013"],
};

export const RUNTIME_TRIGGER_DESCRIPTORS: readonly RuntimeTriggerDescriptor[] = [
  triggerDescriptor({
    label: "memory.rebuild",
    mode: "invoke",
    support: "supported",
    summary: "Ask Agent-memory to rebuild derived local projections from durable sources.",
    capabilityName: "rebuild_index",
    trace: ADAPTER_TRACE,
  }),
  triggerDescriptor({
    label: "memory.consolidate",
    mode: "invoke",
    support: "descriptor_only",
    summary: "Placeholder for later memory consolidation; no approved domain port exists yet.",
    trace: ADAPTER_TRACE,
  }),
  triggerDescriptor({
    label: "memory.export.observe",
    mode: "observe",
    support: "supported",
    summary: "Observe a governed export operation and report its job outcome.",
    capabilityName: "export_memory",
    trace: GOVERNED_TRIGGER_TRACE,
  }),
  triggerDescriptor({
    label: "memory.delete.observe",
    mode: "observe",
    support: "supported",
    summary: "Observe a governed delete operation and report its job outcome.",
    capabilityName: "delete_memory",
    trace: GOVERNED_TRIGGER_TRACE,
  }),
  triggerDescriptor({
    label: "memory.query.observe",
    mode: "observe",
    support: "supported",
    summary: "Observe a workspace memory query and report its job outcome.",
    capabilityName: "query_memory",
    trace: ADAPTER_TRACE,
  }),
  triggerDescriptor({
    label: "memory.context.observe",
    mode: "observe",
    support: "supported",
    summary: "Observe a context request without changing retrieval ranking.",
    capabilityName: "get_context",
    trace: ADAPTER_TRACE,
  }),
];

const TRIGGER_BY_LABEL = new Map(
  RUNTIME_TRIGGER_DESCRIPTORS.map((descriptor) => [descriptor.label, descriptor]),
);

const SUPPORTED_TRIGGER_LABELS: readonly RuntimeTriggerLabel[] = RUNTIME_TRIGGER_DESCRIPTORS.filter(
  (descriptor) => descriptor.support === "supported",
).map((descriptor) => descriptor.label);

export function listRuntimeTriggerDescriptors(): readonly RuntimeTriggerDescriptor[] {
  return RUNTIME_TRIGGER_DESCRIPTORS;
}

export function isRuntimeTriggerLabel(value: string): value is RuntimeTriggerLabel {
  return TRIGGER_BY_LABEL.has(value as RuntimeTriggerLabel);
}

export function requireRuntimeTriggerDescriptor(label: string): RuntimeTriggerDescriptor {
  const descriptor = TRIGGER_BY_LABEL.get(label as RuntimeTriggerLabel);
  if (!descriptor) {
    throw new RuntimeAdapterValidationError(`Unknown runtime trigger label: ${label}`);
  }

  return descriptor;
}

export function createRuntimeAdapterBinding(
  input: CreateRuntimeAdapterBindingInput,
): RuntimeAdapterBinding {
  assertText(input.bindingId, "Runtime adapter binding ID is required.");
  assertText(input.adapterLabel, "Runtime adapter label is required.");
  assertText(input.workspaceId, "Runtime adapter workspace is required.");

  const supportedTriggers = input.supportedTriggers ?? SUPPORTED_TRIGGER_LABELS;
  for (const label of supportedTriggers) {
    requireRuntimeTriggerDescriptor(label);
  }

  for (const target of input.observationTargets ?? []) {
    assertObservationTarget(target);
  }

  return {
    bindingId: input.bindingId.trim(),
    adapterLabel: input.adapterLabel.trim(),
    workspaceId: input.workspaceId.trim(),
    // A new binding is inert until it is explicitly enabled, so declaring one can never
    // silently move the workspace off local mode.
    status: {
      state: "disabled",
      reason: cleanOptional(input.reason) ?? "Runtime adapter binding was declared but not enabled.",
      lastObservedAt: cleanOptional(input.observedAt),
    },
    supportedTriggers: [...supportedTriggers],
    observationTargets: [...(input.observationTargets ?? ["local_log"])],
    correlationPrefix: cleanOptional(input.correlationPrefix),
  };
}

export function enableRuntimeAdapter(
  binding: RuntimeAdapterBinding,
  input: ChangeAdapterStateInput,
): RuntimeAdapterBinding {
  return withStatus(binding, "enabled", input);
}

export function disableRuntimeAdapter(
  binding: RuntimeAdapterBinding,
  input: ChangeAdapterStateInput,
): RuntimeAdapterBinding {
  return withStatus(binding, "disabled", input);
}

export function markRuntimeAdapterUnavailable(
  binding: RuntimeAdapterBinding,
  input: ChangeAdapterStateInput,
): RuntimeAdapterBinding {
  return withStatus(binding, "unavailable", input);
}

export function resolveExecutionMode(binding?: RuntimeAdapterBinding): ExecutionMode {
  return binding?.status.state === "enabled" ? "runtime_assisted" : "local";
}

/**
 * Confirms the R-006 invariant: every approved capability stays reachable in local mode no
 * matter what the optional adapter is doing.
 */
export function evaluateRuntimeAdapterPolicy(
  binding?: RuntimeAdapterBinding,
): RuntimeAdapterPolicyDecision {
  const adapterState: AdapterState = binding?.status.state ?? "disabled";
  const violations: string[] = [];

  const activeTriggers =
    adapterState === "enabled"
      ? (binding?.supportedTriggers ?? []).filter(
          (label) => requireRuntimeTriggerDescriptor(label).support === "supported",
        )
      : [];

  for (const capabilityName of CAPABILITY_NAMES) {
    const definition = requireCapabilityDefinition(capabilityName);
    if (!definition.supportedSurfaces.includes("internal")) {
      violations.push(`${capabilityName} is not reachable without an integration surface.`);
    }
  }

  return {
    adapterState,
    executionMode: resolveExecutionMode(binding),
    localModeAvailable: true,
    locallyAvailableCapabilities: [...CAPABILITY_NAMES],
    // Empty by construction: BOLT-06 contracts never move a capability behind the adapter.
    adapterDependentCapabilities: [],
    activeTriggers,
    reason:
      adapterState === "enabled"
        ? `Runtime adapter '${binding?.adapterLabel}' is enabled; local mode remains fully available.`
        : `No enabled runtime adapter; all capabilities run in local mode (adapter state: ${adapterState}).`,
    violations,
    trace: ADAPTER_TRACE,
  };
}

export function assertLocalModeIndependence(decision: RuntimeAdapterPolicyDecision): void {
  if (!decision.localModeAvailable || decision.adapterDependentCapabilities.length > 0) {
    throw new RuntimeAdapterValidationError(
      "Core local mode must remain available without a runtime adapter binding.",
    );
  }

  if (decision.violations.length > 0) {
    throw new RuntimeAdapterValidationError(decision.violations.join(" "));
  }
}

export function createRuntimeTriggerPayload(
  input: CreateRuntimeTriggerPayloadInput,
): RuntimeTriggerPayload {
  requireRuntimeTriggerDescriptor(input.triggerLabel);
  assertText(input.workspaceId, "Runtime trigger workspace is required.");
  assertText(input.initiator, "Runtime trigger initiator is required.");
  assertText(input.purpose, "Runtime trigger purpose is required.");
  assertText(input.receivedAt, "Runtime trigger timestamp is required.");

  return {
    triggerLabel: input.triggerLabel,
    workspaceId: input.workspaceId.trim(),
    initiator: input.initiator.trim(),
    purpose: input.purpose.trim(),
    receivedAt: input.receivedAt.trim(),
    correlationId: cleanOptional(input.correlationId),
    payload: { ...(input.payload ?? {}) },
  };
}

/**
 * Maps an approved trigger label onto a BOLT-05 capability request. This only builds the
 * request envelope; nothing here mutates storage or skips a governance decision, because the
 * caller must still hand the request to the Capability Router.
 */
export function routeRuntimeTrigger(
  payload: RuntimeTriggerPayload,
  binding?: RuntimeAdapterBinding,
): RuntimeTriggerRouting {
  const descriptor = requireRuntimeTriggerDescriptor(payload.triggerLabel);
  const rejection = (reason: string): RuntimeTriggerRouting =>
    routingEnvelope(descriptor, "rejected", reason);

  if (!binding || binding.status.state !== "enabled") {
    return rejection(
      `Runtime adapter is ${binding?.status.state ?? "not bound"}; local mode handles this capability instead.`,
    );
  }

  if (binding.workspaceId !== payload.workspaceId) {
    return rejection(
      `Trigger workspace '${payload.workspaceId}' does not match bound workspace '${binding.workspaceId}'.`,
    );
  }

  // Checked before the binding's declared list: a descriptor-only trigger has nothing to route
  // regardless of what the binding declares, and the discovery reason is the useful one.
  if (descriptor.support === "descriptor_only" || !descriptor.capabilityName) {
    return routingEnvelope(
      descriptor,
      "descriptor_only",
      `Trigger '${descriptor.label}' is published for discovery but has no approved domain port in BOLT-06.`,
    );
  }

  if (!binding.supportedTriggers.includes(descriptor.label)) {
    return rejection(`Trigger '${descriptor.label}' is not declared by binding '${binding.bindingId}'.`);
  }

  const request = createCapabilityRequest({
    requestId: correlatedRequestId(payload, binding),
    capabilityName: descriptor.capabilityName,
    // `internal` keeps the adapter from impersonating an MCP, CLI, or local API caller.
    context: createInvocationContext({
      actor: payload.initiator,
      workspaceId: payload.workspaceId,
      requestedSurface: "internal",
      purpose: payload.purpose,
      requestedAt: payload.receivedAt,
      correlationId: payload.correlationId,
    }),
    payload: payload.payload,
  });

  return {
    ...routingEnvelope(
      descriptor,
      "routed",
      `Trigger '${descriptor.label}' maps to capability '${descriptor.capabilityName}'.`,
    ),
    request,
  };
}

export function createJobObservationRecord(
  summary: MemoryJobObservationSummary,
  input: CreateJobObservationRecordInput = {},
): JobObservationRecord {
  const redactedFields: string[] = [];
  const resultSummary = withheldIfSensitive(summary.resultSummary, "resultSummary", redactedFields);
  const errors = summary.errors.map(
    (error, index) => withheldIfSensitive(error, `errors[${index}]`, redactedFields) ?? "",
  );

  return {
    jobId: summary.jobId,
    jobType: summary.jobType,
    workspaceId: summary.workspaceId,
    initiator: summary.initiator,
    status: summary.status,
    startedAt: summary.startedAt,
    completedAt: summary.completedAt,
    resultSummary,
    provenanceLink: summary.provenanceLink,
    errors,
    retryable: summary.retryable,
    // Raw target scope can name private memory, so observation carries a shape, not content.
    targetScopeDigest: digestTargetScope(summary.targetScope),
    triggerLabel: input.triggerLabel,
    correlationId: input.correlationId,
    redactedFields,
  };
}

export function publishJobObservation(
  record: JobObservationRecord,
  target: ObservationTarget,
  binding?: RuntimeAdapterBinding,
): ObservationPublicationDecision {
  assertObservationTarget(target);

  const trace = record.jobType === "delete" || record.jobType === "export" ? GOVERNED_TRIGGER_TRACE : ADAPTER_TRACE;

  if (target === "runtime_adapter" && binding?.status.state !== "enabled") {
    return {
      target,
      outcome: "skipped",
      reason: `Runtime adapter is ${binding?.status.state ?? "not bound"}; observation stays local.`,
      trace,
    };
  }

  if (binding && !binding.observationTargets.includes(target)) {
    return {
      target,
      outcome: "skipped",
      reason: `Binding '${binding.bindingId}' does not declare observation target '${target}'.`,
      trace,
    };
  }

  if (record.redactedFields.length > 0) {
    return {
      target,
      outcome: "withheld",
      reason: `Observation fields ${record.redactedFields.join(", ")} matched sensitive-content heuristics and were withheld.`,
      record,
      trace,
    };
  }

  return {
    target,
    outcome: "published",
    reason: `Job ${record.jobId} observation published to ${target}.`,
    record,
    trace,
  };
}

/**
 * Optional in-process coordinator that proves an adapter trigger reaches a capability only
 * through the Capability Router, so governance decisions still apply.
 */
export class RuntimeTriggerCoordinator {
  private readonly observationTarget: ObservationTarget;

  constructor(private readonly ports: RuntimeTriggerCoordinatorPorts) {
    this.observationTarget = ports.observationTarget ?? "local_log";
  }

  describeSupportedTriggers(): readonly RuntimeTriggerDescriptor[] {
    return evaluateRuntimeAdapterPolicy(this.ports.binding).activeTriggers.map((label) =>
      requireRuntimeTriggerDescriptor(label),
    );
  }

  handleTrigger(payload: RuntimeTriggerPayload): RuntimeTriggerResult {
    const routing = routeRuntimeTrigger(payload, this.ports.binding);
    if (routing.outcome !== "routed" || !routing.request) {
      return { routing };
    }

    const response = this.ports.router.invokeCapability(routing.request);
    if (!response.job) {
      return { routing, response };
    }

    const record = createJobObservationRecord(response.job, {
      triggerLabel: routing.triggerLabel,
      correlationId: payload.correlationId,
    });

    return {
      routing,
      response,
      observation: publishJobObservation(record, this.observationTarget, this.ports.binding),
    };
  }
}

function triggerDescriptor(input: {
  readonly label: RuntimeTriggerLabel;
  readonly mode: RuntimeTriggerMode;
  readonly support: RuntimeTriggerSupport;
  readonly summary: string;
  readonly capabilityName?: CapabilityName;
  readonly trace: CapabilityTrace;
}): RuntimeTriggerDescriptor {
  const definition = input.capabilityName ? requireCapabilityDefinition(input.capabilityName) : undefined;

  return {
    label: input.label,
    mode: input.mode,
    support: input.support,
    summary: input.summary,
    capabilityName: input.capabilityName,
    jobType: definition?.jobType,
    governanceRequired: definition?.governanceRequired ?? false,
    trace: input.trace,
  };
}

function routingEnvelope(
  descriptor: RuntimeTriggerDescriptor,
  outcome: RuntimeTriggerOutcome,
  reason: string,
): RuntimeTriggerRouting {
  return {
    triggerLabel: descriptor.label,
    outcome,
    reason,
    descriptor,
    governanceRequired: descriptor.governanceRequired,
    trace: descriptor.trace,
  };
}

function withStatus(
  binding: RuntimeAdapterBinding,
  state: AdapterState,
  input: ChangeAdapterStateInput,
): RuntimeAdapterBinding {
  assertText(input.reason, "Adapter status change requires a human-readable reason.");

  return {
    ...binding,
    status: {
      state,
      reason: input.reason.trim(),
      lastObservedAt: cleanOptional(input.observedAt) ?? binding.status.lastObservedAt,
    },
  };
}

function correlatedRequestId(
  payload: RuntimeTriggerPayload,
  binding: RuntimeAdapterBinding,
): string {
  const prefix = binding.correlationPrefix ?? binding.bindingId;
  return `${prefix}:${payload.triggerLabel}:${payload.correlationId ?? payload.receivedAt}`;
}

function withheldIfSensitive(
  value: string | undefined,
  field: string,
  redactedFields: string[],
): string | undefined {
  if (!hasText(value)) return value;

  const review = reviewSensitiveContent(value);
  if (review.outcome === "allow") return value;

  redactedFields.push(field);
  return review.redactedContent ?? "[withheld]";
}

function digestTargetScope(targetScope: string): string {
  const entries = targetScope
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return entries.length === 1 ? "scope:1-target" : `scope:${entries.length}-targets`;
}

function assertObservationTarget(value: string): asserts value is ObservationTarget {
  if (!OBSERVATION_TARGETS.includes(value as ObservationTarget)) {
    throw new RuntimeAdapterValidationError(`Unknown observation target: ${value}`);
  }
}

function assertText(value: string | undefined, message: string): asserts value is string {
  if (!hasText(value)) {
    throw new RuntimeAdapterValidationError(message);
  }
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanOptional(value: string | undefined): string | undefined {
  return hasText(value) ? value.trim() : undefined;
}
