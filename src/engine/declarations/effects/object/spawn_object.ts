import { GameObject } from "xray16/alias";
import { extern, TIndex, TName, TRate, TSection } from "xray16/lib";

import { spawnObject } from "@/engine/core/utils/spawn";

/**
 * Spawn an object of the provided section at the given patrol path point with the desired yaw.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param params - Tuple of section, patrol path name, point index and yaw to spawn the object with.
 */
extern(
  "xr_effects.spawn_object",
  (_: GameObject, __: GameObject, [section, pathName, index, yaw]: [TSection, TName, TIndex, TRate]): void => {
    spawnObject(section, pathName, index, yaw);
  }
);
