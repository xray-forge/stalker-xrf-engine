import { IRegistryOfflineState } from "@/engine/core/database/database_types";
import { registry } from "@/engine/core/database/registry";
import { Optional, TNumberId } from "@/engine/lib/types";

/**
 * Register offline object representation in database.
 *
 * @param objectId - game object ID to register offline representation
 * @param state - base offline state to register
 * @returns stored offline object state representation
 */
export function registerOfflineObject(
  objectId: TNumberId,
  state: IRegistryOfflineState = {
    levelVertexId: null,
    activeSection: null,
  }
): IRegistryOfflineState {
  let offlineRecord: Optional<IRegistryOfflineState> = registry.offlineObjects.get(objectId);

  if (!offlineRecord) {
    offlineRecord = state;
    registry.offlineObjects.set(objectId, offlineRecord);
  }

  return offlineRecord;
}

/**
 * Hard reset offline object state.
 * Create new representation entry if it was not initialize before.
 */
export function hardResetOfflineObject(
  objectId: TNumberId,
  state: IRegistryOfflineState = {
    levelVertexId: null,
    activeSection: null,
  }
): void {
  registry.offlineObjects.set(objectId, state);
}

/**
 * Soft reset offline object state.
 * Do not create new representation entry if it was not initialize before.
 */
export function softResetOfflineObject(
  objectId: TNumberId,
  state: IRegistryOfflineState = {
    levelVertexId: null,
    activeSection: null,
  }
): void {
  if (registry.offlineObjects.has(objectId)) {
    registry.offlineObjects.set(objectId, state);
  }
}

/**
 * Unregister offline object representation in database.
 *
 * @param objectId - game object ID to unregister offline representation
 */
export function unregisterOfflineObject(objectId: TNumberId): void {
  registry.offlineObjects.delete(objectId);
}
