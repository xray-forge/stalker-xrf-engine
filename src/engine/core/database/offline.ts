import { registry } from "@/engine/core/database/registry";
import { IStoredOfflineObject } from "@/engine/core/database/types";
import { Optional, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export function hardResetOfflineObject(objectId: TNumberId): void {
  registry.offlineObjects.set(objectId, {
    levelVertexId: null,
    activeSection: null,
  });
}

/**
 * todo;
 */
export function softResetOfflineObject(objectId: TNumberId): void {
  if (registry.offlineObjects.has(objectId)) {
    registry.offlineObjects.set(objectId, {
      levelVertexId: null,
      activeSection: null,
    });
  }
}

/**
 * todo;
 */
export function registerOfflineObject(objectId: TNumberId): IStoredOfflineObject {
  let offlineRecord: Optional<IStoredOfflineObject> = registry.offlineObjects.get(objectId);

  if (offlineRecord === null) {
    offlineRecord = {
      levelVertexId: null,
      activeSection: null,
    };

    registry.offlineObjects.set(objectId, offlineRecord);
  }

  return offlineRecord;
}
