import { game } from "xray16";
import { GameObject } from "xray16/alias";
import { extern, TName } from "xray16/lib";
import { $filename } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/**
 * Run game tutorial.
 * Expects tutorial name parameter to run.
 */
extern("xr_effects.run_tutorial", (_: GameObject, __: GameObject, [tutorialName]: [TName]): void => {
  logger.info("Run tutorial: '%s'", tutorialName);
  game.start_tutorial(tutorialName);
});
