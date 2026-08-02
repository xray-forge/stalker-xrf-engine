import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

import { TCommunity } from "@/engine/constants/communities";
import { registry } from "@/engine/core/database";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { areCommunitiesFriendly } from "@/engine/core/utils/relation";

/**
 * Whether actor faction is friendly with provided parameter community.
 *
 * Where:
 * - community - community name to check against current actor community.
 */
extern(
  "xr_conditions.is_factions_friends",
  (_: GameObject, __: GameObject, [community]: [Nillable<TCommunity>]): boolean => {
    return community ? areCommunitiesFriendly(getObjectCommunity(registry.actorServer), community) : false;
  }
);
