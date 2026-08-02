import { GameObject } from "xray16/alias";
import { extern, isObjectInZone, TName } from "xray16/lib";

import { registry } from "@/engine/core/database";

/**
 * Check whether actor is in zone with provided name.
 *
 * Where:
 * - zoneName - name of the zone to check.
 */
extern("xr_conditions.actor_in_zone", (_: GameObject, __: GameObject, [zoneName]: [TName]): boolean => {
  return isObjectInZone(registry.actor, registry.zones.get(zoneName));
});
