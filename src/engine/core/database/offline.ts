import { registry } from "@/engine/core/database/registry";
import { IStoredOfflineObject } from "@/engine/core/database/types";
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
  state: IStoredOfflineObject = {
    levelVertexId: null,
    activeSection: null,
  }
): IStoredOfflineObject {
  let offlineRecord: Optional<IStoredOfflineObject> = registry.offlineObjects.get(objectId);

  if (offlineRecord === null) {
    offlineRecord = state;

    registry.offlineObjects.set(objectId, offlineRecord);
  }

  return offlineRecord;
}

/**
 * Hard reset offline object state.
 * Create new representation entry if it was not initialize before.
 *
 * @param objectId - game object ID to register offline representation
 * @param state - base offline state to register
 * @returns stored offline object state representation
 */
export function hardResetOfflineObject(
  objectId: TNumberId,
  state: IStoredOfflineObject = {
    levelVertexId: null,
    activeSection: null,
  }
): void {
  registry.offlineObjects.set(objectId, state);
}

/**
 * Soft reset offline object state.
 * Do not create new representation entry if it was not initialize before.
 *
 * @param objectId - game object ID to register offline representation
 * @param state - base offline state to register
 * @returns stored offline object state representation
 */
export function softResetOfflineObject(
  objectId: TNumberId,
  state: IStoredOfflineObject = {
    levelVertexId: null,
    activeSection: null,
  }
): void {
  if (registry.offlineObjects.has(objectId)) {
    registry.offlineObjects.set(objectId, state);
  }
}
