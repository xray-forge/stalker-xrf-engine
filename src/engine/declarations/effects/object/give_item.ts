import { GameObject, ServerHumanObject } from "xray16/alias";
import { extern, Nillable, TNumberId, TSection, TStringId } from "xray16/lib";
import { $filename } from "xray16/macros";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";

export const logger: LuaLogger = new LuaLogger($filename);

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
