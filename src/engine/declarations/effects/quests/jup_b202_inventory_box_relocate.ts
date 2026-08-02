import { GameObject } from "xray16/alias";
import { abort, extern, LuaArray, Nillable } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Move all items from the Jupiter b202 actor treasure box into the snag treasure box.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 */
extern("xr_effects.jup_b202_inventory_box_relocate", (actor: GameObject, object: GameObject): void => {
  const inventoryBoxOut: Nillable<GameObject> = getObjectByStoryId("jup_b202_actor_treasure");
  const inventoryBoxIn: Nillable<GameObject> = getObjectByStoryId("jup_b202_snag_treasure");
  const itemsToRelocate: LuaArray<GameObject> = new LuaTable();

  if (!inventoryBoxIn || !inventoryBoxOut) {
    abort("No inventory boxes detected to relocate items.");
  }

  inventoryBoxOut.iterate_inventory_box((invBoxOut: GameObject, item: GameObject) => {
    table.insert(itemsToRelocate, item);
  }, inventoryBoxOut);

  for (const [k, v] of itemsToRelocate) {
    inventoryBoxOut.transfer_item(v, inventoryBoxIn);
  }
});
