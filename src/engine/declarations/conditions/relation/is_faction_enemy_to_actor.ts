import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

import { TCommunity } from "@/engine/constants/communities";
import { isActorEnemyWithFaction } from "@/engine/core/utils/relation";

/**
 * Check whether provided community has enemy relation to actor.
 *
 * Where:
 * - community - community name to check against current actor community.
 */
extern(
  "xr_conditions.is_faction_enemy_to_actor",
  (_: GameObject, __: GameObject, [community]: [Nillable<TCommunity>]): boolean => {
    return community ? isActorEnemyWithFaction(community) : false;
  }
);
