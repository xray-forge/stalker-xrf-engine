import { GameObject } from "xray16/alias";
import { extern, Nillable, TSection } from "xray16/lib";

import { registry } from "@/engine/core/database";

/**
 * Spawn an item of the provided section directly into the object inventory.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object that receives the spawned item.
 * @param section - Section of the item to spawn into the object inventory.
 */
extern("xr_effects.spawn_item_to_npc", (_: GameObject, object: GameObject, [section]: [Nillable<TSection>]): void => {
  if (section) {
    registry.simulator.create(
      section,
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  }
});
