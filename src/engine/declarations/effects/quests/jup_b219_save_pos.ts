import { GameObject, ServerObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

import { getObjectByStoryId, registry } from "@/engine/core/database";
import { questsState } from "@/engine/declarations/effects/quests/shared";

/**
 * Save the position of the Jupiter b219 gate object and release it from the simulation.
 */
extern("xr_effects.jup_b219_save_pos", (): void => {
  const object: Nillable<GameObject> = getObjectByStoryId("jup_b219_gate_id");

  if (object && object.position()) {
    questsState.jupB219Position = object.position();
    questsState.jupB219LVId = object.level_vertex_id();
    questsState.jupB219GVId = object.game_vertex_id();
  } else {
    return;
  }

  const serverObject: Nillable<ServerObject> = registry.simulator.object(object.id());

  if (serverObject) {
    registry.simulator.release(serverObject, true);
  }
});
