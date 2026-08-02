import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { getServerObjectByStoryId } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { isAnySquadMemberEnemyToActor } from "@/engine/core/utils/relation";

/**
 * Check whether any of provided squads is enemy to actor.
 * Checks list of provided story IDs and expect at least one member of at least one squad to be enemy.
 *
 * Where:
 * - params - variadic list of squad story IDs to check.
 */
extern("xr_conditions.is_squad_enemy_to_actor", (_: GameObject, __: GameObject, params: Array<TStringId>): boolean => {
  for (const [, squadStoryId] of ipairs(params)) {
    const squad: Nillable<Squad> = getServerObjectByStoryId(squadStoryId);

    if (squad && isAnySquadMemberEnemyToActor(squad)) {
      return true;
    }
  }

  return false;
});
