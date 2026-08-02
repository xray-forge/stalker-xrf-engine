import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { registry } from "@/engine/core/database";

/**
 * Stop the acidic zone idle particles on the actor's head.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 */
extern("xr_effects.pas_b400_stop_particle", (actor: GameObject, object: GameObject): void => {
  registry.actor.stop_particles("zones\\zone_acidic_idle", "bip01_head");
});
