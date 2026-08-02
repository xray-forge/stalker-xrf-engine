import { particles_object, patrol } from "xray16";
import { GameObject, ParticlesObject, Patrol } from "xray16/alias";
import { extern, TName, TRate } from "xray16/lib";

/**
 * Plays particle object at provided path.
 */
extern(
  "xr_effects.play_particle_on_path",
  (_: GameObject, __: GameObject, [particleName, pathName, probability = 100]: [TName, TName, TRate]): void => {
    if (!particleName || !pathName) {
      return;
    }

    const path: Patrol = new patrol(pathName);
    const particle: ParticlesObject = new particles_object(particleName);

    for (const index of $range(0, path.count() - 1)) {
      if (math.random(100) <= probability) {
        particle.play_at_pos(path.point(index));
      }
    }
  }
);
