import { level, patrol } from "xray16";
import { GameObject, Vector } from "xray16/alias";
import { abort, extern, Nillable, TIndex, TName, TNumberId, TStringId } from "xray16/lib";

import { getObjectIdByStoryId, registry, resetStalkerState } from "@/engine/core/database";

/**
 * Teleports npc to patrol point based story ID, patrol name and index.
 * If object is offline, updates corresponding server object.
 */
extern(
  "xr_effects.teleport_npc_by_story_id",
  (
    _: GameObject,
    __: GameObject,
    [storyId, patrolName, patrolIndex = 0]: [Nillable<TStringId>, Nillable<TName>, TIndex]
  ): void => {
    if (!storyId || !patrolName) {
      abort("Wrong parameters in 'teleport_npc_by_story_id' function.");
    }

    const objectId: Nillable<TNumberId> = getObjectIdByStoryId(storyId);

    if (!objectId) {
      abort("There is no story object with id '%s'.", storyId);
    }

    const position: Vector = new patrol(patrolName).point(patrolIndex);
    const target: Nillable<GameObject> = level.object_by_id(objectId);

    if (target) {
      resetStalkerState(target);
      target.set_npc_position(position);
    } else {
      registry.simulator.object(objectId)!.position = position;
    }
  }
);
