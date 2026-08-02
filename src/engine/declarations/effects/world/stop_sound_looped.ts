import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";

/**
 * Stop looped sound playback for an object.
 */
extern("xr_effects.stop_sound_looped", (_: GameObject, object: GameObject): void => {
  getManager(SoundManager).stopAllLooped(object.id());
});
