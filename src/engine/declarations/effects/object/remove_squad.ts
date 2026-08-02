import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TStringId } from "xray16/lib";

import { getServerObjectByStoryId } from "@/engine/core/database";
import { releaseSimulationSquad } from "@/engine/core/managers/simulation/utils";
import type { Squad } from "@/engine/core/objects/squad";

/**
 * Release the squad referenced by the provided story ID from the simulation.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param storyId - Story ID of the squad to release.
 */
extern("xr_effects.remove_squad", (_: GameObject, __: GameObject, [storyId]: [TStringId]): void => {
  if (!storyId) {
    abort("Wrong squad identificator [NIL] in remove_squad function");
  }

  const squad: Nillable<Squad> = getServerObjectByStoryId(storyId);

  if (!squad) {
    abort("Wrong squad identificator [%s]. squad doesnt exist", tostring(storyId));
  }

  releaseSimulationSquad(squad);
});
