import { GameObject } from "xray16/alias";
import { extern, TSection } from "xray16/lib";

import { spawnItemsForObject } from "@/engine/core/utils/spawn";

import { logger } from "./shared";

/**
 * Give list of items to an object.
 */
extern("xr_effects.give_items", (_: GameObject, object: GameObject, params: Array<TSection>): void => {
  for (const section of params) {
    logger.info("Give item to object: %s %s", object.id(), section);
    spawnItemsForObject(object, section);
  }
});
