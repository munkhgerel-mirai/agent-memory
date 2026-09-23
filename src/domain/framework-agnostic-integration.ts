import type {
  ApprovalStatus,
  LifecyclePhase,
  MemoryCategoryName,
} from "./lifecycle-memory-core.js";
import type {
  LocalIndexProjectionRepository,
  LocalMemorySearchRequest,
} from "./local-workspace-storage.js";
import {
  createMemoryOperationRequest,
  evaluateMemoryOperation,
  type MemoryOperationRequest,
  type OperationDecision,
  type OperationType,
} from "./privacy-governance.js";

export class FrameworkIntegrationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FrameworkIntegrationValidationError";
  }
}

export const CAPABILITY_NAMES = [
  "get_context",
  "query_memory",
  "inspect_memory",
  "rebuild_index",
  "export_memory",
  "delete_memory",
  "write_memory",
] as const;

export type CapabilityName = (typeof CAPABILITY_NAMES)[number];

export const INTEGRATION_SURFACES = ["mcp", "cli", "local_api", "internal"] as const;

export type IntegrationSurface = (typeof INTEGRATION_SURFACES)[number];

export type CapabilityIntent =
  | "context"
  | "query"
  | "inspect"
  | "rebuild"
  | "export"
  | "delete"
  | "write";

export type CapabilityPayloadValueType =
  | "string"
  | "string_array"
  | "boolean"
  | "number"
  | "object";

export interface CapabilityTrace {
  readonly stories: readonly string[];
  readonly nfrs: readonly string[];
  readonly risks: readonly string[];
}

export interface CapabilityPayloadField {
  readonly name: string;
  readonly valueType: CapabilityPayloadValueType;
  readonly required: boolean;
  readonly description: string;
}

export interface CapabilityDefinition {
  readonly name: CapabilityName;
  readonly intent: CapabilityIntent;
  readonly title: string;
  readonly summary: string;
  readonly governanceRequired: boolean;
  readonly supportedSurfaces: readonly IntegrationSurface[];
  readonly inputFields: readonly CapabilityPayloadField[];
  readonly jobType?: MemoryJobType;
  readonly trace: CapabilityTrace;
}

export interface InvocationContext {
  readonly actor: string;
  readonly workspaceId: string;
  readonly requestedSurface: IntegrationSurface;
  readonly purpose: string;
  readonly requestedAt: string;
  readonly workspacePath?: string;
  readonly correlationId?: string;
}

export interface CreateInvocationContextInput {
  readonly actor: string;
  readonly workspaceId: string;
  readonly requestedSurface: IntegrationSurface;
  readonly purpose: string;
  readonly requestedAt: string;
  readonly workspacePath?: string;
  readonly correlationId?: string;
}

export interface CapabilityRequest {
  readonly requestId: string;
  readonly capabilityName: CapabilityName;
  readonly context: InvocationContext;
  readonly payload: CapabilityPayload;
}

export interface CreateCapabilityRequestInput {
  readonly requestId: string;
  readonly capabilityName: CapabilityName;
  readonly context: InvocationContext;
  readonly payload?: CapabilityPayload;
}

export type CapabilityPayload = Readonly<Record<string, unknown>>;

export type CapabilityResponseStatus =
  | "completed"
  | "accepted"
  | "denied"
  | "approval_required"
  | "not_implemented"
  | "validation_error";

export interface CapabilityResponse<TPayload = unknown> {
  readonly requestId: string;
  readonly capabilityName: CapabilityName;
  readonly status: CapabilityResponseStatus;
  readonly message: string;
  readonly governanceRequired: boolean;
  readonly governanceDecision?: OperationDecision;
  readonly job?: MemoryJobObservationSummary;
  readonly payload?: TPayload;
  readonly trace: CapabilityTrace;
}

export interface CapabilityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly definition?: CapabilityDefinition;
}

export interface CapabilitySurfaceDescriptor {
  readonly surface: IntegrationSurface;
  readonly capabilityName: CapabilityName;
  readonly title: string;
  readonly summary: string;
  readonly governanceRequired: boolean;
  readonly inputFields: readonly CapabilityPayloadField[];
  readonly trace: CapabilityTrace;
}

export interface McpToolDescriptor extends CapabilitySurfaceDescriptor {
  readonly surface: "mcp";
  readonly toolName: string;
}

export interface CliCommandDescriptor extends CapabilitySurfaceDescriptor {
  readonly surface: "cli";
  readonly command: string;
}

export interface LocalApiEndpointDescriptor extends CapabilitySurfaceDescriptor {
  readonly surface: "local_api";
  readonly method: "POST";
  readonly path: string;
}

export type MemoryJobType = "query" | "rebuild" | "export" | "delete";

export type MemoryJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "requires_approval";

export interface MemoryJobRun {
  readonly jobId: string;
  readonly jobType: MemoryJobType;
  readonly workspaceId: string;
  readonly initiator: string;
  readonly targetScope: string;
  readonly status: MemoryJobStatus;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly provenanceLink?: string;
  readonly resultSummary?: string;
  readonly errors: readonly string[];
}

export interface CreateMemoryJobRunInput {
  readonly jobId: string;
  readonly jobType: MemoryJobType;
  readonly workspaceId: string;
  readonly initiator: string;
  readonly targetScope: string;
  readonly startedAt: string;
  readonly status?: MemoryJobStatus;
  readonly provenanceLink?: string;
}

export interface MemoryJobObservationSummary {
  readonly jobId: string;
  readonly jobType: MemoryJobType;
  readonly workspaceId: string;
  readonly initiator: string;
  readonly targetScope: string;
  readonly status: MemoryJobStatus;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly provenanceLink?: string;
  readonly resultSummary?: string;
  readonly errors: readonly string[];
  readonly retryable: boolean;
}

export interface CompleteMemoryJobRunInput {
  readonly completedAt: string;
  readonly resultSummary: string;
  readonly provenanceLink?: string;
}

export interface FailMemoryJobRunInput {
  readonly completedAt: string;
  readonly error: string;
  readonly retryable?: boolean;
}

export type CapabilityHandler = (request: CapabilityRequest) => unknown;

export interface CapabilityRouterPorts {
  readonly projection?: LocalIndexProjectionRepository;
  readonly handlers?: Partial<Record<CapabilityName, CapabilityHandler>>;
  readonly operationDecisionProvider?: (request: MemoryOperationRequest) => OperationDecision;
  readonly now?: () => string;
}

const SHARED_TRACE: CapabilityTrace = {
  stories: ["US-005"],
  nfrs: ["NFR-005", "NFR-013", "NFR-015"],
  risks: ["R-006", "R-011"],
};

const GOVERNANCE_TRACE: CapabilityTrace = {
  stories: ["US-005", "US-006"],
  nfrs: ["NFR-005", "NFR-011", "NFR-013", "NFR-015"],
  risks: ["R-005", "R-006", "R-011", "R-013"],
};

const ALL_SURFACES: readonly IntegrationSurface[] = ["mcp", "cli", "local_api", "internal"];

export const CAPABILITY_DEFINITIONS: readonly CapabilityDefinition[] = [
  {
    name: "get_context",
    intent: "context",
    title: "Get Startup Or Focused Context",
    summary: "Return bounded, provenance-aware context for an agent or local tool.",
    governanceRequired: false,
    supportedSurfaces: ALL_SURFACES,
    inputFields: fields([
      ["goal", "string", false, "Goal or task framing for context selection."],
      ["phase", "string", false, "AI-DLC lifecycle phase filter."],
      ["mode", "string", false, "Retrieval mode such as startup, focused, handoff, or audit."],
      ["tokenBudget", "number", false, "Optional maximum token budget for the response."],
    ]),
    trace: { ...SHARED_TRACE, stories: ["US-001", "US-005"], nfrs: ["NFR-001", "NFR-002", ...SHARED_TRACE.nfrs] },
  },
  {
    name: "query_memory",
    intent: "query",
    title: "Query Workspace Memory",
    summary: "Search local lifecycle memory by query text and metadata filters.",
    governanceRequired: false,
    supportedSurfaces: ALL_SURFACES,
    inputFields: fields([
      ["query", "string", true, "Search terms or lifecycle references."],
      ["workspacePath", "string", false, "Optional source path filter."],
      ["category", "string", false, "Optional AI-DLC memory category filter."],
      ["limit", "number", false, "Maximum results to return."],
    ]),
    jobType: "query",
    trace: SHARED_TRACE,
  },
  {
    name: "inspect_memory",
    intent: "inspect",
    title: "Inspect Memory",
    summary: "Inspect one durable memory record and its metadata without changing it.",
    governanceRequired: false,
    supportedSurfaces: ALL_SURFACES,
    inputFields: fields([
      ["memoryId", "string", true, "Memory record identifier."],
      ["includeProvenance", "boolean", false, "Whether to include provenance metadata when available."],
    ]),
    trace: SHARED_TRACE,
  },
  {
    name: "rebuild_index",
    intent: "rebuild",
    title: "Rebuild Local Index",
    summary: "Request a rebuild of derived local memory projections from durable sources.",
    governanceRequired: false,
    supportedSurfaces: ALL_SURFACES,
    inputFields: fields([
      ["rebuildMode", "string", false, "Full or focused rebuild mode."],
      ["dryRun", "boolean", false, "When true, validate without replacing projection state."],
      ["operationId", "string", false, "Idempotency key for the rebuild request."],
    ]),
    jobType: "rebuild",
    trace: SHARED_TRACE,
  },
  {
    name: "export_memory",
    intent: "export",
    title: "Export Memory",
    summary: "Request a policy-checked export of durable memory and provenance.",
    governanceRequired: true,
    supportedSurfaces: ALL_SURFACES,
    inputFields: fields([
      ["targetMemoryIds", "string_array", true, "Memory IDs or approved target scope entries to export."],
      ["reason", "string", true, "Human-readable export reason."],
      ["outputPath", "string", true, "Caller-selected path for the portable export document."],
      ["includeProvenance", "boolean", false, "Whether export output must include provenance."],
    ]),
    jobType: "export",
    trace: GOVERNANCE_TRACE,
  },
  {
    name: "delete_memory",
    intent: "delete",
    title: "Delete Memory",
    summary: "Request policy-checked deletion from durable memory and active retrieval state.",
    governanceRequired: true,
    supportedSurfaces: ALL_SURFACES,
    inputFields: fields([
      ["targetMemoryIds", "string_array", true, "Memory IDs or approved target scope entries to delete."],
      ["reason", "string", true, "Human-readable deletion reason."],
      ["confirmationEvidence", "string", true, "Evidence that the destructive action was confirmed."],
    ]),
    jobType: "delete",
    trace: GOVERNANCE_TRACE,
  },
  {
    name: "write_memory",
    intent: "write",
    title: "Write Approved Memory",
    summary: "Request a governed durable memory write for already approved lifecycle content.",
    governanceRequired: true,
    supportedSurfaces: ALL_SURFACES,
    inputFields: fields([
      ["candidateId", "string", true, "Candidate memory identifier."],
      ["content", "string", true, "Approved lifecycle memory content."],
      ["provenance", "object", true, "Source, actor, timestamp, approval, visibility, and retention metadata."],
      ["approvalEvidence", "string", true, "Evidence that durable write policy was satisfied."],
    ]),
    trace: GOVERNANCE_TRACE,
  },
] as const;

const CAPABILITY_BY_NAME = new Map(
  CAPABILITY_DEFINITIONS.map((definition) => [definition.name, definition]),
);

const CLI_COMMAND_BY_CAPABILITY: Record<CapabilityName, string> = {
  get_context: "agent-memory context",
  query_memory: "agent-memory query",
  inspect_memory: "agent-memory inspect",
  rebuild_index: "agent-memory rebuild",
  export_memory: "agent-memory export",
  delete_memory: "agent-memory delete",
  write_memory: "agent-memory write",
};

const LOCAL_API_PATH_BY_CAPABILITY: Record<CapabilityName, string> = {
  get_context: "/context",
  query_memory: "/query",
  inspect_memory: "/inspect",
  rebuild_index: "/rebuild",
  export_memory: "/export",
  delete_memory: "/delete",
  write_memory: "/memory",
};

export const MCP_TOOL_DESCRIPTORS: readonly McpToolDescriptor[] = CAPABILITY_DEFINITIONS.map(
  (definition) => ({
    ...baseDescriptor(definition, "mcp"),
    surface: "mcp",
    toolName: definition.name,
  }),
);

export const CLI_COMMAND_DESCRIPTORS: readonly CliCommandDescriptor[] = CAPABILITY_DEFINITIONS.map(
  (definition) => ({
    ...baseDescriptor(definition, "cli"),
    surface: "cli",
    command: CLI_COMMAND_BY_CAPABILITY[definition.name],
  }),
);

export const LOCAL_API_ENDPOINT_DESCRIPTORS: readonly LocalApiEndpointDescriptor[] = CAPABILITY_DEFINITIONS.map(
  (definition) => ({
    ...baseDescriptor(definition, "local_api"),
    surface: "local_api",
    method: "POST",
    path: LOCAL_API_PATH_BY_CAPABILITY[definition.name],
  }),
);

export function listCapabilityDefinitions(): readonly CapabilityDefinition[] {
  return CAPABILITY_DEFINITIONS;
}

export function isCapabilityName(value: string): value is CapabilityName {
  return CAPABILITY_BY_NAME.has(value as CapabilityName);
}

export function requireCapabilityDefinition(name: string): CapabilityDefinition {
  const definition = CAPABILITY_BY_NAME.get(name as CapabilityName);
  if (!definition) {
    throw new FrameworkIntegrationValidationError(`Unknown memory capability: ${name}`);
  }

  return definition;
}

export function createInvocationContext(
  input: CreateInvocationContextInput,
): InvocationContext {
  assertText(input.actor, "Invocation actor is required.");
  assertText(input.workspaceId, "Invocation workspace is required.");
  assertText(input.purpose, "Invocation purpose is required.");
  assertText(input.requestedAt, "Invocation timestamp is required.");
  assertIntegrationSurface(input.requestedSurface);

  return {
    actor: input.actor.trim(),
    workspaceId: input.workspaceId.trim(),
    requestedSurface: input.requestedSurface,
    purpose: input.purpose.trim(),
    requestedAt: input.requestedAt.trim(),
    workspacePath: cleanOptional(input.workspacePath),
    correlationId: cleanOptional(input.correlationId),
  };
}

export function createCapabilityRequest(
  input: CreateCapabilityRequestInput,
): CapabilityRequest {
  assertText(input.requestId, "Capability request ID is required.");
  requireCapabilityDefinition(input.capabilityName);

  return {
    requestId: input.requestId.trim(),
    capabilityName: input.capabilityName,
    context: input.context,
    payload: { ...(input.payload ?? {}) },
  };
}

export function createMemoryJobRun(input: CreateMemoryJobRunInput): MemoryJobRun {
  assertText(input.jobId, "Memory job ID is required.");
  assertText(input.workspaceId, "Memory job workspace is required.");
  assertText(input.initiator, "Memory job initiator is required.");
  assertText(input.targetScope, "Memory job target scope is required.");
  assertText(input.startedAt, "Memory job start timestamp is required.");

  return {
    jobId: input.jobId.trim(),
    jobType: input.jobType,
    workspaceId: input.workspaceId.trim(),
    initiator: input.initiator.trim(),
    targetScope: input.targetScope.trim(),
    status: input.status ?? "queued",
    startedAt: input.startedAt.trim(),
    provenanceLink: cleanOptional(input.provenanceLink),
    errors: [],
  };
}

export function completeMemoryJobRun(
  run: MemoryJobRun,
  input: CompleteMemoryJobRunInput,
): MemoryJobRun {
  assertText(input.completedAt, "Memory job completion timestamp is required.");
  assertText(input.resultSummary, "Memory job result summary is required.");

  return {
    ...run,
    status: "completed",
    completedAt: input.completedAt.trim(),
    resultSummary: input.resultSummary.trim(),
    provenanceLink: cleanOptional(input.provenanceLink) ?? run.provenanceLink,
    errors: [],
  };
}

export function failMemoryJobRun(
  run: MemoryJobRun,
  input: FailMemoryJobRunInput,
): MemoryJobRun {
  assertText(input.completedAt, "Memory job failure timestamp is required.");
  assertText(input.error, "Memory job failure reason is required.");

  return {
    ...run,
    status: "failed",
    completedAt: input.completedAt.trim(),
    errors: [input.error.trim()],
  };
}

export function observeMemoryJob(run: MemoryJobRun): MemoryJobObservationSummary {
  return {
    jobId: run.jobId,
    jobType: run.jobType,
    workspaceId: run.workspaceId,
    initiator: run.initiator,
    targetScope: run.targetScope,
    status: run.status,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    provenanceLink: run.provenanceLink,
    resultSummary: run.resultSummary,
    errors: [...run.errors],
    retryable: run.status === "failed" || run.status === "requires_approval",
  };
}

export class CapabilityRouter {
  private readonly operationDecisionProvider: (request: MemoryOperationRequest) => OperationDecision;
  private readonly now: () => string;

  constructor(private readonly ports: CapabilityRouterPorts = {}) {
    this.operationDecisionProvider = ports.operationDecisionProvider ?? evaluateMemoryOperation;
    this.now = ports.now ?? (() => new Date().toISOString());
  }

  validateCapability(request: CapabilityRequest): CapabilityValidationResult {
    const errors: string[] = [];
    const definition = CAPABILITY_BY_NAME.get(request.capabilityName);

    if (!definition) {
      errors.push(`Unknown memory capability: ${request.capabilityName}`);
    }

    if (!hasText(request.requestId)) errors.push("Capability request ID is required.");
    if (!hasText(request.context.actor)) errors.push("Invocation actor is required.");
    if (!hasText(request.context.workspaceId)) errors.push("Invocation workspace is required.");
    if (!hasText(request.context.purpose)) errors.push("Invocation purpose is required.");

    if (definition && !definition.supportedSurfaces.includes(request.context.requestedSurface)) {
      errors.push(`${request.capabilityName} is not available on ${request.context.requestedSurface}.`);
    }

    return {
      valid: errors.length === 0,
      errors,
      definition,
    };
  }

  invokeCapability(request: CapabilityRequest): CapabilityResponse {
    const validation = this.validateCapability(request);
    if (!validation.valid || !validation.definition) {
      return responseEnvelope(request, validation.definition ?? requireCapabilityDefinition(request.capabilityName), {
        status: "validation_error",
        message: validation.errors.join(" "),
      });
    }

    const definition = validation.definition;
    const governanceDecision = this.evaluateGovernance(request, definition);
    if (governanceDecision?.outcome === "denied") {
      return responseEnvelope(request, definition, {
        status: "denied",
        message: governanceDecision.reason,
        governanceDecision,
      });
    }

    if (governanceDecision?.outcome === "approval_required") {
      return responseEnvelope(request, definition, {
        status: "approval_required",
        message: governanceDecision.reason,
        governanceDecision,
        job: definition.jobType ? this.jobForRequest(request, definition, "requires_approval") : undefined,
      });
    }

    const handler = this.ports.handlers?.[request.capabilityName];
    if (handler) {
      return responseEnvelope(request, definition, {
        status: "completed",
        message: `${request.capabilityName} completed through an attached in-process handler.`,
        governanceDecision,
        payload: handler(request),
      });
    }

    const builtInPayload = this.invokeBuiltInPort(request);
    if (builtInPayload !== undefined) {
      return responseEnvelope(request, definition, {
        status: "completed",
        message: `${request.capabilityName} completed through an existing local domain port.`,
        governanceDecision,
        payload: builtInPayload,
      });
    }

    if (definition.jobType) {
      return responseEnvelope(request, definition, {
        status: "accepted",
        message: `${request.capabilityName} was validated; execution adapter is not attached in BOLT-05.`,
        governanceDecision,
        job: this.jobForRequest(request, definition, "queued"),
      });
    }

    return responseEnvelope(request, definition, {
      status: "not_implemented",
      message: `${request.capabilityName} descriptor is available; no execution port is attached in BOLT-05.`,
      governanceDecision,
    });
  }

  private evaluateGovernance(
    request: CapabilityRequest,
    definition: CapabilityDefinition,
  ): OperationDecision | undefined {
    const operationType = operationTypeForCapability(definition.name);
    if (!operationType) return undefined;

    return this.operationDecisionProvider(
      createMemoryOperationRequest({
        operationId: request.requestId,
        operationType,
        actor: request.context.actor,
        purpose: request.context.purpose,
        targetMemoryIds: stringArrayPayload(request.payload, "targetMemoryIds"),
        requestedAt: request.context.requestedAt || this.now(),
        includeProvenance: booleanPayload(request.payload, "includeProvenance") ?? operationType === "export",
      }),
    );
  }

  private invokeBuiltInPort(request: CapabilityRequest): unknown {
    if (!this.ports.projection) return undefined;

    if (request.capabilityName === "query_memory") {
      return this.ports.projection.search(searchRequestPayload(request.payload));
    }

    if (request.capabilityName === "inspect_memory") {
      const memoryId = stringPayload(request.payload, "memoryId");
      return memoryId ? this.ports.projection.findProjection(memoryId) : undefined;
    }

    return undefined;
  }

  private jobForRequest(
    request: CapabilityRequest,
    definition: CapabilityDefinition,
    status: MemoryJobStatus,
  ): MemoryJobObservationSummary {
    const jobType = definition.jobType ?? "query";
    const run = createMemoryJobRun({
      jobId: `job:${request.requestId}`,
      jobType,
      workspaceId: request.context.workspaceId,
      initiator: request.context.actor,
      targetScope: targetScopeForRequest(request),
      startedAt: request.context.requestedAt || this.now(),
      status,
      provenanceLink: stringPayload(request.payload, "provenanceLink"),
    });

    return observeMemoryJob(run);
  }
}

function baseDescriptor(
  definition: CapabilityDefinition,
  surface: IntegrationSurface,
): CapabilitySurfaceDescriptor {
  return {
    surface,
    capabilityName: definition.name,
    title: definition.title,
    summary: definition.summary,
    governanceRequired: definition.governanceRequired,
    inputFields: definition.inputFields,
    trace: definition.trace,
  };
}

function fields(
  entries: ReadonlyArray<readonly [string, CapabilityPayloadValueType, boolean, string]>,
): readonly CapabilityPayloadField[] {
  return entries.map(([name, valueType, required, description]) => ({
    name,
    valueType,
    required,
    description,
  }));
}

function responseEnvelope<TPayload>(
  request: CapabilityRequest,
  definition: CapabilityDefinition,
  input: {
    readonly status: CapabilityResponseStatus;
    readonly message: string;
    readonly governanceDecision?: OperationDecision;
    readonly job?: MemoryJobObservationSummary;
    readonly payload?: TPayload;
  },
): CapabilityResponse<TPayload> {
  return {
    requestId: request.requestId,
    capabilityName: request.capabilityName,
    status: input.status,
    message: input.message,
    governanceRequired: definition.governanceRequired,
    governanceDecision: input.governanceDecision,
    job: input.job,
    payload: input.payload,
    trace: definition.trace,
  };
}

function operationTypeForCapability(capabilityName: CapabilityName): OperationType | undefined {
  switch (capabilityName) {
    case "delete_memory":
      return "delete";
    case "export_memory":
      return "export";
    case "write_memory":
      return "write";
    default:
      return undefined;
  }
}

function searchRequestPayload(payload: CapabilityPayload): LocalMemorySearchRequest {
  return {
    query: stringPayload(payload, "query"),
    workspacePath: stringPayload(payload, "workspacePath"),
    category: stringPayload(payload, "category") as MemoryCategoryName | undefined,
    phase: stringPayload(payload, "phase") as LifecyclePhase | undefined,
    approvalStatus: stringPayload(payload, "approvalStatus") as ApprovalStatus | undefined,
    limit: numberPayload(payload, "limit"),
  };
}

function targetScopeForRequest(request: CapabilityRequest): string {
  const targetMemoryIds = stringArrayPayload(request.payload, "targetMemoryIds");
  if (targetMemoryIds.length > 0) return targetMemoryIds.join(",");

  return stringPayload(request.payload, "workspacePath") ?? request.context.workspacePath ?? request.context.workspaceId;
}

function stringPayload(payload: CapabilityPayload, key: string): string | undefined {
  const value = payload[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function stringArrayPayload(payload: CapabilityPayload, key: string): readonly string[] {
  const value = payload[key];
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
}

function booleanPayload(payload: CapabilityPayload, key: string): boolean | undefined {
  const value = payload[key];
  return typeof value === "boolean" ? value : undefined;
}

function numberPayload(payload: CapabilityPayload, key: string): number | undefined {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function assertIntegrationSurface(value: string): asserts value is IntegrationSurface {
  if (!INTEGRATION_SURFACES.includes(value as IntegrationSurface)) {
    throw new FrameworkIntegrationValidationError(`Unknown integration surface: ${value}`);
  }
}

function assertText(value: string | undefined, message: string): asserts value is string {
  if (!hasText(value)) {
    throw new FrameworkIntegrationValidationError(message);
  }
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanOptional(value: string | undefined): string | undefined {
  return hasText(value) ? value.trim() : undefined;
}