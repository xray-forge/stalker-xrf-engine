import { device } from "xray16";

import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { registerManagers } from "@/engine/scripts/register/managers_registrator";
import { registerSchemeModules } from "@/engine/scripts/register/schemes_registrator";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register methods related to game start flows.
 */
extern("start", {
  /**
   * Main start game callback.
   * Called when game is started or loaded.
   */
  callback: (): void => {
    logger.info("Start new game");

    math.randomseed(device().time_global());

    registerManagers();
    registerSchemeModules();
  },
});
