import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TName, TStringId } from "xray16/lib";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";

/**
 * Check whether all squad members are in zone.
 *
 * Params:
 * - storyId - story ID of the squad to check
 * - zoneName - target zone name.
 *
 * Notes:
 * - Returns true is squad is empty.
 */
extern(
  "xr_conditions.squad_in_zone_all",
  (_: GameObject, __: GameObject, [storyId, zoneName]: [TStringId, TName]): boolean => {
    if (!storyId || !zoneName) {
      abort("Incorrect params in 'squad_in_zone_all' condition: storyId '%s', zoneName '%s'", storyId, zoneName);
    }

    const squad: Nillable<Squad> = getServerObjectByStoryId(storyId);

    if (!squad) {
      return false;
    }

    const zone: Nillable<GameObject> = registry.zones.get(zoneName) as Nillable<GameObject>;

    if (zone) {
      for (const squadMember of squad.squad_members()) {
        if (!zone.inside(registry.objects.get(squadMember.id)?.object?.position() ?? squadMember.object.position)) {
          return false;
        }
      }
    }

    return true;
  }
);
