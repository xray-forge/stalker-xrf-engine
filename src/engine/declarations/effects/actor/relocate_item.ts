import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TSection, TStringId } from "xray16/lib";

import { getObjectByStoryId, registry } from "@/engine/core/database";

import { logger } from "./shared";

/**
 * Relocate item by section from one story ID to another story ID object.
 */
extern(
  "xr_effects.relocate_item",
  (_: GameObject, __: GameObject, [itemSection, fromStoryId, toStoryId]: [TSection, TStringId, TStringId]) => {
    logger.info("Relocate item: '%s', '%s' -> '%s'", itemSection, fromStoryId, toStoryId);

    const fromObject: Nillable<GameObject> = getObjectByStoryId(fromStoryId);
    const toObject: Nillable<GameObject> = getObjectByStoryId(toStoryId);

    assert(toObject, "Couldn't relocate item to not existing object '%s' in 'relocate_item' effect.", toStoryId);

    const item: Nillable<GameObject> = fromObject && fromObject.object(itemSection);

    if (item) {
      (fromObject as GameObject).transfer_item(item, toObject);
    } else {
      registry.simulator.create(
        itemSection,
        toObject.position(),
        toObject.level_vertex_id(),
        toObject.game_vertex_id(),
        toObject.id()
      );
    }
  }
);
