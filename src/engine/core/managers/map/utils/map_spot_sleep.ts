import { level } from "xray16";
import { GameObject, Vector } from "xray16/alias";
import { Nillable, TDistance, TNumberId } from "xray16/lib";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { mapMarks } from "@/engine/lib/constants/map_marks";

/**
 * Update display of sleep zones.
 * Based on distance to zone display it on map or hide.
 *
 * By default, there are 3 sleep zones in stalker COP.
 */
export function updateSleepZonesDisplay(): void {
  const actorPosition: Vector = registry.actor.position();

  for (const [, spot] of mapDisplayConfig.SLEEP_SPOTS) {
    const objectId: Nillable<TNumberId> = getObjectIdByStoryId(spot.target);
    const object: Nillable<GameObject> = objectId ? registry.objects.get(objectId)?.object : null;

    if (objectId && object) {
      const distanceFromActor: TDistance = actorPosition.distance_to(object.position());
      const hasSleepSpot: boolean = level.map_has_object_spot(objectId, mapMarks.ui_pda2_actor_sleep_location) !== 0;

      if (distanceFromActor <= mapDisplayConfig.DISTANCE_TO_DISPLAY && !hasSleepSpot) {
        level.map_add_object_spot(objectId, mapMarks.ui_pda2_actor_sleep_location, spot.hint);
      } else if (distanceFromActor > mapDisplayConfig.DISTANCE_TO_DISPLAY && hasSleepSpot) {
        level.map_remove_object_spot(objectId, mapMarks.ui_pda2_actor_sleep_location);
      }
    }
  }
}
