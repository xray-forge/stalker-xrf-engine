import { GameObject } from "xray16/alias";
import { extern, Nillable, TNumberId } from "xray16/lib";

import { AbstractPlayableSound } from "@/engine/core/managers/sounds/objects";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";

/**
 * Reset sound playback for an object.
 */
extern("xr_effects.reset_sound_npc", (_: GameObject, object: GameObject): void => {
  const objectId: TNumberId = object.id();
  const sound: Nillable<AbstractPlayableSound> = soundsConfig.playing.get(objectId) as Nillable<AbstractPlayableSound>;

  // todo: Move to sound manager methods.
  if (sound) {
    sound.reset(objectId);
  }
});
