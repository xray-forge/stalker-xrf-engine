import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { logger } from "./shared";

/**
 * Kill actor instantly.
 */
extern("xr_effects.kill_actor", (actor: GameObject): void => {
  logger.info("Kill actor effect");
  actor.kill(actor);
});
