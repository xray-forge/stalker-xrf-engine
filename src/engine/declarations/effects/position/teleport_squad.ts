import { patrol } from "xray16";
import { GameObject } from "xray16/alias";
import { abort, assert, extern, Nillable, TIndex, TName, TStringId } from "xray16/lib";

import { getServerObjectByStoryId } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { setSquadPosition } from "@/engine/core/objects/squad/utils";

/**
 * Teleports squad to patrol point based story ID, patrol name and index.
 */
extern(
  "xr_effects.teleport_squad",
  (_: GameObject, __: GameObject, [storyId, patrolName, patrolIndex = 0]: [TStringId, TName, TIndex]): void => {
    if (!storyId || !patrolName) {
      abort("Wrong parameters in 'teleport_squad' effect.");
    }

    const squad: Nillable<Squad> = getServerObjectByStoryId(storyId);

    assert(squad, "There is no squad with story id '%s'.", storyId);
    setSquadPosition(squad, new patrol(patrolName).point(patrolIndex));
  }
);
