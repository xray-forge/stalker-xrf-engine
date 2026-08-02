import { GameObject } from "xray16/alias";
import { abort, ACTOR_ID, extern, Nillable, TCount } from "xray16/lib";

import { TCommunity } from "@/engine/constants/communities";
import { increaseCommunityGoodwillToId } from "@/engine/core/utils/relation";

/**
 * Increment relation value by `count` for provided community.
 */
extern(
  "xr_effects.inc_faction_goodwill_to_actor",
  (_: GameObject, __: GameObject, [community, delta]: [Nillable<TCommunity>, Nillable<TCount>]): void => {
    if (!delta || !community) {
      abort("Wrong parameters in effect 'inc_faction_goodwill_to_actor'.");
    }

    increaseCommunityGoodwillToId(community, ACTOR_ID, tonumber(delta) as TCount);
  }
);
