import { ServerPhysicObject } from "xray16/alias";
import { copyVector, extern, TRate, TSection } from "xray16/lib";

import { registry } from "@/engine/core/database";

import { questsState } from "./shared";

/**
 * Recreate the Jupiter b219 gate object at the previously saved position.
 */
extern("xr_effects.jup_b219_restore_gate", () => {
  const yaw: TRate = 0;
  const spawnSection: TSection = "jup_b219_gate";

  if (questsState.jupB219Position) {
    const serverObject: ServerPhysicObject = registry.simulator.create(
      spawnSection,
      copyVector(questsState.jupB219Position),
      questsState.jupB219LVId!,
      questsState.jupB219GVId!
    );

    serverObject.set_yaw((yaw * math.pi) / 180);
  }
});
