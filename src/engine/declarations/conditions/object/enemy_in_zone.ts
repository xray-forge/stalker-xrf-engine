import { GameObject } from "xray16/alias";
import { abort, extern, isObjectInZone, Nillable, TName } from "xray16/lib";

import { registry } from "@/engine/core/database";

/**
 * Check if object enemy (actor) is in zone.
 *
 * Where:
 * - name - name of zone object to check.
 *
 * Throws, if zone with provided name does not exist.
 */
extern("xr_conditions.enemy_in_zone", (_: GameObject, __: GameObject, [name]: [TName]): boolean => {
  const zone: Nillable<GameObject> = registry.zones.get(name) as Nillable<GameObject>;

  return zone
    ? isObjectInZone(registry.actor, zone)
    : abort("Unexpected zone name '%s' in enemy_in_zone xr condition.", name);
});
