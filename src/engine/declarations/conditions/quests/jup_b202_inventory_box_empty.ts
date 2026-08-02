import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { storyNames } from "@/engine/constants/story_names";
import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Check if jupiter reward box is empty.
 *
 * Throws, if story box was not spawned.
 */
extern("xr_conditions.jup_b202_inventory_box_empty", (_: GameObject, __: GameObject): boolean => {
  return (getObjectByStoryId(storyNames.jup_b202_actor_treasure) as GameObject).is_inv_box_empty();
});
