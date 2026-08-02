import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TName, TStringId } from "xray16/lib";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";

/**
 * Check if at least one squad member is in target zone.
 *
 * Where:
 * - storyId - story ID of the squad
 * - zoneName - name of the zone to check (current object will be checked by default).
 */
extern(
  "xr_conditions.squad_in_zone",
  (_: GameObject, object: GameObject, [storyId, zoneName]: [Nillable<TStringId>, Nillable<TName>]): boolean => {
    const squad: Nillable<Squad> = storyId
      ? getServerObjectByStoryId(storyId)
      : abort("Incorrect 'squad_in_zone' condition parameters: storyId '%s', zoneName '%s'.", storyId, zoneName);

    if (!squad) {
      return false;
    }

    const zone: Nillable<GameObject> = registry.zones.get(zoneName ?? object.name()) as Nillable<GameObject>;

    if (zone) {
      for (const squadMember of squad.squad_members()) {
        if (zone.inside(registry.objects.get(squadMember.id)?.object?.position() ?? squadMember.object.position)) {
          return true;
        }
      }
    }

    return false;
  }
);
