import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerObject, resetObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { CampManager } from "@/engine/core/managers/camp";
import { GameObject, Optional, Vector } from "@/engine/lib/types";

/**
 * Register zone object.
 *
 * @param object - zone game object to register
 * @returns registry state for provided object
 */
export function registerZone(object: GameObject): IRegistryObjectState {
  registry.zones.set(object.name(), object);

  return registerObject(object);
}

/**
 * Unregister zone object.
 *
 * @param object - zone game object to unregister
 */
export function unregisterZone(object: GameObject): void {
  registry.zones.delete(object.name());
  unregisterObject(object);
}

/**
 * Get camp for provided game vector position.
 * Count of camps is limited to alife range so check should not be very intensive.
 *
 * @param position - current position to get manager for
 * @returns instance of manager for NPC position if camp exists
 */
export function getCampZoneForPosition(position: Optional<Vector>): Optional<CampManager> {
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
export function registerCampZone(object: GameObject, manager: CampManager): void {
  registerZone(object);
  registry.camps.set(object.id(), manager);
}

/**
 * Unregister camp on net despawn.
 *
 * @param object - target camp client object to unregister
 */
export function unregisterCampZone(object: GameObject): void {
  unregisterZone(object);
  registry.camps.delete(object.id());
}

/**
 * Reset camp instance on object re-init.
 * Rewrites client object reference.
 *
 * @param object - target camp client object to reset
 */
export function resetCampZone(object: GameObject): void {
  resetObject(object);
  registry.zones.set(object.name(), object);

  const manager: Optional<CampManager> = registry.camps.get(object.id()) as Optional<CampManager>;

  if (manager) {
    manager.object = object;
  }
}
