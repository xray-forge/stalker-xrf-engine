import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isPlayingSound } from "@/engine/core/utils/sound";

/**
 * Check if object is playing any sound.
 */
extern("xr_conditions.is_playing_sound", (_: GameObject, object: GameObject): boolean => {
  return isPlayingSound(object);
});
