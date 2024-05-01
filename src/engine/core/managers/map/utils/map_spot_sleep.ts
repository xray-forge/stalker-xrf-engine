import { level } from "xray16";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { mapMarks } from "@/engine/lib/constants/map_marks";
import { GameObject, Optional, TDistance, TNumberId, Vector } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export function updateSleepZonesDisplay(): void {
  for (const [, sleepZone] of mapDisplayConfig.SLEEP_SPOTS) {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(sleepZone.target);
    const object: Optional<GameObject> = objectId ? registry.objects.get(objectId)?.object : null;

    if (objectId && object) {
      const actorPosition: Vector = registry.actor.position();
      const distanceFromActor: TDistance = object.position().distance_to(actorPosition);
      const hasSleepSpot: boolean = level.map_has_object_spot(objectId, mapMarks.ui_pda2_actor_sleep_location) !== 0;

      if (distanceFromActor <= mapDisplayConfig.DISTANCE_TO_DISPLAY && !hasSleepSpot) {
        level.map_add_object_spot(objectId, mapMarks.ui_pda2_actor_sleep_location, sleepZone.hint);
      } else if (distanceFromActor > mapDisplayConfig.DISTANCE_TO_DISPLAY && hasSleepSpot) {
        level.map_remove_object_spot(objectId, mapMarks.ui_pda2_actor_sleep_location);
      }
    }
  }
}
