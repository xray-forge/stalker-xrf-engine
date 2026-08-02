import { game } from "xray16";
import { extern } from "xray16/lib";
import { $filename } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/**
 * Stop active game tutorial.
 */
extern("xr_effects.stop_tutorial", (): void => {
  logger.info("Stop tutorial");
  game.stop_tutorial();
});
