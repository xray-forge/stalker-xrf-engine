import { registry } from "@/engine/core/database/registry";
import { Optional, TNumberId, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export interface IStoredOfflineObject {
  levelVertexId: Optional<TNumberId>;
  activeSection: Optional<TSection>;
}

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
