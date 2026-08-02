import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

import { TCommunity } from "@/engine/constants/communities";
import { isActorNeutralWithFaction } from "@/engine/core/utils/relation";

/**
 * Check whether provided community has neutral relation to actor.
 *
 * Where:
 * - community - community name to check against current actor community.
 */
extern(
  "xr_conditions.is_faction_neutral_to_actor",
  (actor: GameObject, object: GameObject, [community]: [Nillable<TCommunity>]): boolean => {
    return community ? isActorNeutralWithFaction(community) : false;
  }
);
