import {
  CapabilityRouter,
  type CapabilityPayload,
} from "../domain/framework-agnostic-integration.js";
import { StartupContextRetriever } from "../domain/retrieval-context.js";
import { GovernedMemoryOperations } from "../storage/governed-memory-operations.js";
import { WorkspaceMemoryStore } from "../storage/workspace-memory-store.js";
import { WorkspaceMutationLock } from "../storage/workspace-mutation-lock.js";

export function rebuildWorkspaceMemory(
  store: WorkspaceMemoryStore,
  rebuildId: string,
): ReturnType<WorkspaceMemoryStore["rebuild"]> {
  return new WorkspaceMutationLock(store.layout).runExclusive(rebuildId, () =>
    store.rebuild({ rebuildId }),
  );
}

export function createLocalCapabilityRouter(
  store: WorkspaceMemoryStore,
  now: () => string,
): CapabilityRouter {
  const retriever = new StartupContextRetriever(store.projectionRepository);
  const operations = new GovernedMemoryOperations(store);
  const mutationLock = new WorkspaceMutationLock(store.layout);

  return new CapabilityRouter({
    projection: store.projectionRepository,
    now,
    handlers: {
      get_context: (request) =>
        retriever.retrieveStartupContext({
          goal: stringField(request.payload, "goal"),
          phase: stringField(request.payload, "phase") as never,
          query: stringField(request.payload, "query"),
          builtAt: now(),
        }),
      rebuild_index: () => {
        const rebuildId = `rebuild:${now()}`;
        return mutationLock.runExclusive(rebuildId, () => store.rebuild({ rebuildId }));
      },
      export_memory: (request) =>
        operations.export({
          operationId: request.requestId,
          actor: request.context.actor,
          purpose: stringField(request.payload, "reason") ?? request.context.purpose,
          requestedAt: request.context.requestedAt,
          targetMemoryIds: stringArrayField(request.payload, "targetMemoryIds"),
          outputPath: requiredStringField(request.payload, "outputPath"),
        }),
      delete_memory: (request) =>
        mutationLock.runExclusive(request.requestId, () =>
          operations.delete({
            operationId: request.requestId,
            actor: request.context.actor,
            purpose: stringField(request.payload, "reason") ?? request.context.purpose,
            requestedAt: request.context.requestedAt,
            targetMemoryIds: stringArrayField(request.payload, "targetMemoryIds"),
          }),
        ),
    },
  });
}

function stringField(payload: CapabilityPayload, key: string): string | undefined {
  const value = payload[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function requiredStringField(payload: CapabilityPayload, key: string): string {
  const value = stringField(payload, key);
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

function stringArrayField(payload: CapabilityPayload, key: string): readonly string[] {
  const value = payload[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}