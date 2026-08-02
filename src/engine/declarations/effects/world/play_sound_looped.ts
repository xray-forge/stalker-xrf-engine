import { GameObject } from "xray16/alias";
import { extern, TName } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";

/**
 * Start looped sound playback by theme name.
 *
 * Where:
 * - name - name of sound theme to play in loop.
 */
extern("xr_effects.play_sound_looped", (_: GameObject, object: GameObject, [name]: [TName]): void => {
  getManager(SoundManager).playLooped(object.id(), name);
});
