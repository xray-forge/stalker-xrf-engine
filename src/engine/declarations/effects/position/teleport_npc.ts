import { patrol } from "xray16";
import { GameObject } from "xray16/alias";
import { assert, extern, TIndex, TName } from "xray16/lib";

import { resetStalkerState } from "@/engine/core/database";

/**
 * Teleports npc to patrol point based on patrol name and index.
 */
extern(
  "xr_effects.teleport_npc",
  (_: GameObject, object: GameObject, [patrolName, patrolIndex = 0]: [TName, TIndex]): void => {
    assert(patrolName, "Wrong parameters in 'teleport_npc' function.");

    resetStalkerState(object);

    object.set_npc_position(new patrol(patrolName).point(patrolIndex));
  }
);
