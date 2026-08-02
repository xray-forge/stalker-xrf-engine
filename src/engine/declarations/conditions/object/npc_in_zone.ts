import { GameObject, ServerObject } from "xray16/alias";
import { extern, isObjectInZone, Nillable, TName } from "xray16/lib";

import { registry } from "@/engine/core/database";

/**
 * Check if object is in provided zone name.
 *
 * Where:
 * - zoneName - name of the zone object to check object is inside.
 */
extern(
  "xr_conditions.npc_in_zone",
  (_: GameObject, object: GameObject | ServerObject, [zoneName]: [TName]): boolean => {
    const zone: Nillable<GameObject> = registry.zones.get(zoneName) as Nillable<GameObject>;

    if (type(object.id) === "function") {
      return isObjectInZone(object as GameObject, zone);
    }

    if (zone) {
      const registryObject: Nillable<GameObject> = registry.objects.get((object as ServerObject).id)
        ?.object as Nillable<GameObject>;

      return registryObject ? isObjectInZone(registryObject, zone) : zone.inside((object as ServerObject).position);
    }

    return true;
  }
);
