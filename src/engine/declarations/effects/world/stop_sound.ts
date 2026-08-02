import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";

/**
 * Stop playing sound for an object.
 */
extern("xr_effects.stop_sound", (_: GameObject, object: GameObject): void => {
  getManager(SoundManager).stop(object.id());
});
