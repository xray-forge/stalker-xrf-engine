import { GameObject } from "xray16/alias";
import { extern, TCount, TSection } from "xray16/lib";

import { actorHasItemCount } from "@/engine/core/utils/item";

/**
 * Check whether actor has specific count of inventory items.
 *
 * Where:
 * - section - item section to check
 * - count - items count to require.
 */
extern(
  "xr_conditions.actor_has_item_count",
  (actor: GameObject, __: GameObject, [section, count]: [TSection, string]): boolean => {
    return actorHasItemCount(section, tonumber(count) as TCount, actor);
  }
);
