import { game } from "xray16";
import { extern } from "xray16/lib";

import { logger } from "./shared";

/**
 * Stop active game tutorial.
 */
extern("xr_effects.stop_tutorial", (): void => {
  logger.info("Stop tutorial");
  game.stop_tutorial();
});
