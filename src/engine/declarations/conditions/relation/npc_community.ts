import { AnyGameObject, GameObject } from "xray16/alias";
import { abort, extern, Nillable } from "xray16/lib";

import { TCommunity } from "@/engine/constants/communities";
import { getObjectCommunity } from "@/engine/core/utils/community";

/**
 * Check whether object community matches provided parameter.
 */
extern(
  "xr_conditions.npc_community",
  (_: GameObject, object: AnyGameObject, [community]: [Nillable<TCommunity>]): boolean => {
    if (!community) {
      abort("Condition 'npc_community' requires community name as parameter.");
    }

    return getObjectCommunity(object) === community;
  }
);
