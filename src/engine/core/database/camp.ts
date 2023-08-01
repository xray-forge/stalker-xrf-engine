import { registerObject, resetObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import type { CampManager } from "@/engine/core/objects/camp";
import type { ClientObject, Optional, Vector } from "@/engine/lib/types";

/**
 * Get camp for provided game vector position.
 * Count of camps is limited to alife range so check should not be very intensive.
 *
 * @param position - current position to get manager for
 * @returns instance of manager for NPC position if camp exists
 */
export function getCampForPosition(position: Optional<Vector>): Optional<CampManager> {
  if (position === null) {
    return null;
  }

  // Check all nearest client-side camp objects, based on alife switch distance range.
  for (const [, manager] of registry.camps) {
    if (manager.object.inside(position)) {
      return manager;
    }
  }

  return null;
}

/**
 * Register camp object on net spawn.
 *
 * @param object - target camp client object to register
 * @param manager - linked manager to register
 */
export function registerCamp(object: ClientObject, manager: CampManager): void {
  registerObject(object);
  registry.camps.set(object.id(), manager);
}

/**
 * Unregister camp on net despawn.
 *
 * @param object - target camp client object to unregister
 */
export function unregisterCamp(object: ClientObject): void {
  unregisterObject(object);
  registry.camps.delete(object.id());
}

/**
 * Reset camp instance on object re-init.
 * Rewrites client object reference.
 *
 * @param object - target camp client object to reset
 */
export function resetCamp(object: ClientObject): void {
  resetObject(object);

  const manager: Optional<CampManager> = registry.camps.get(object.id()) as Optional<CampManager>;

  if (manager) {
    manager.object = object;
  }
}
