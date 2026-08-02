import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Kill actor instantly.
 */
extern("xr_effects.kill_actor", (actor: GameObject): void => {
  actor.kill(actor);
});
