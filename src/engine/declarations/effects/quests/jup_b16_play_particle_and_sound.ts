import { particles_object, patrol, sound_object } from "xray16";
import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { questsState } from "@/engine/declarations/effects/quests/shared";

/**
 * Play the Jupiter b16 teleport particle effect at the object's particle patrol point by index.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object whose particle patrol path is used.
 * @param p - Tuple containing the index of the particle and sound pair to play.
 */
extern("xr_effects.jup_b16_play_particle_and_sound", (actor: GameObject, object: GameObject, p: [number]) => {
  if (!questsState.particlesList) {
    questsState.particlesList = $fromArray([
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
    ]);
  }

  questsState.particlesList.get(p[0]).particle.play_at_pos(new patrol(object.name() + "_particle").point(0));
});
