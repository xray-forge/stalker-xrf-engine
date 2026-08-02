import { GameObject } from "xray16/alias";
import { abort, assert, extern, LuaArray, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId, registry } from "@/engine/core/database";

import { logger } from "./shared";

/**
 * Release all items contained in the inventory box referenced by the provided story ID.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param storyId - Story ID of the inventory box to clear.
 */
extern("xr_effects.clear_box", (_: GameObject, __: GameObject, [storyId]: [TStringId]): void => {
  logger.info("Clear box");

  if (!storyId) {
    abort("Wrong parameters in function 'clear_box'!!!");
  }

  const inventoryBox: Nillable<GameObject> = getObjectByStoryId(storyId);

  assert(inventoryBox, "There is no object with storyId '%s'.", storyId);

  const itemsList: LuaArray<GameObject> = new LuaTable();

  inventoryBox.iterate_inventory_box((_: GameObject, item: GameObject): void => {
    table.insert(itemsList, item);
  }, inventoryBox);

  for (const [, item] of itemsList) {
    registry.simulator.release(registry.simulator.object(item.id()), true);
  }
});
