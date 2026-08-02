import { GameObject, ServerHumanObject } from "xray16/alias";
import { extern, Nillable, TNumberId, TSection, TStringId } from "xray16/lib";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";

import { logger } from "./shared";

/**
 * Give specific item to an object by story id.
 */
extern(
  "xr_effects.give_item",
  (
    _: GameObject,
    object: Nillable<GameObject> | ServerHumanObject,
    [section, objectStoryId]: [TSection, Nillable<TStringId>]
  ): void => {
    const objectId: TNumberId = objectStoryId
      ? (getObjectIdByStoryId(objectStoryId) as TNumberId)
      : (object as GameObject).id();

    logger.info("Give item to object: %s %s", objectId, section);

    spawnItemsForObject(registry.simulator.object(objectId)!, section);
  }
);
