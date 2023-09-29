import { level } from "xray16";

import { getObjectIdByStoryId } from "@/engine/core/database";
import { GUIDERS_BY_LEVEL } from "@/engine/core/managers/tasks/TaskConfig";
import { Optional, TName, TNumberId, TStringId } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export function addGuiderSpot(from: TName, to: TName, isStoryline: boolean): void {
  const guiderStoryId: Optional<TStringId> = GUIDERS_BY_LEVEL.get(from)?.get(to);

  if (!guiderStoryId) {
    return;
  }

  const guiderId: Optional<TNumberId> = getObjectIdByStoryId(guiderStoryId);

  if (!guiderId) {
    return;
  }

  const spotToAdd: TName = isStoryline ? "storyline_task_on_guider" : "secondary_task_on_guider";
  const spotToRemove: TName = isStoryline ? "secondary_task_on_guider" : "storyline_task_on_guider";

  level.map_remove_object_spot(guiderId, spotToRemove);
  level.map_add_object_spot(guiderId, spotToAdd, "");
}

/**
 * todo: Description.
 */
export function removeGuiderSpot(from: TName): void {
  const guidersByLevel: Optional<LuaTable<TName, TStringId>> = GUIDERS_BY_LEVEL.get(from);

  if (!guidersByLevel) {
    return;
  }

  for (const [, storyId] of guidersByLevel) {
    const guiderId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

    if (guiderId !== null) {
      if (level.map_has_object_spot(guiderId, "storyline_task_on_guider") !== 0) {
        level.map_remove_object_spot(guiderId, "storyline_task_on_guider");
      }

      if (level.map_has_object_spot(guiderId, "secondary_task_on_guider") !== 0) {
        level.map_remove_object_spot(guiderId, "secondary_task_on_guider");
      }
    }
  }
}
