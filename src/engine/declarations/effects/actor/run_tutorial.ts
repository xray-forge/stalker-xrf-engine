import { game } from "xray16";
import { GameObject } from "xray16/alias";
import { extern, TName } from "xray16/lib";

import { logger } from "./shared";

/**
 * Run game tutorial.
 * Expects tutorial name parameter to run.
 */
extern("xr_effects.run_tutorial", (_: GameObject, __: GameObject, [tutorialName]: [TName]): void => {
  logger.info("Run tutorial: '%s'", tutorialName);
  game.start_tutorial(tutorialName);
});
