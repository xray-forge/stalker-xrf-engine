import { registry } from "@/engine/core/database/registry";
import { Optional, TNumberId, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export interface IStoredOfflineObject {
  level_vertex_id: Optional<TNumberId>;
  active_section: Optional<TSection>;
}

/**
 * todo;
 */
export function hardResetOfflineObject(objectId: TNumberId): void {
  registry.offlineObjects.set(objectId, {
    level_vertex_id: null,
    active_section: null,
  });
}

/**
 * todo;
 */
export function softResetOfflineObject(objectId: TNumberId): void {
  if (registry.offlineObjects.has(objectId)) {
    registry.offlineObjects.set(objectId, {
      level_vertex_id: null,
      active_section: null,
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
      level_vertex_id: null,
      active_section: null,
    };

    registry.offlineObjects.set(objectId, offlineRecord);
  }

  return offlineRecord;
}
