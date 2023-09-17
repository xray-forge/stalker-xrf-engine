import { time_global } from "xray16";

import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { extern } from "@/engine/core/utils/binding";
import { updateClassIds } from "@/engine/core/utils/class_ids";
import { unlockSystemIniOverriding } from "@/engine/core/utils/ini/ini_system";
import { LuaLogger } from "@/engine/core/utils/logging";
import { classIds } from "@/engine/lib/constants/class_ids";
import { registerExtensions } from "@/engine/scripts/register/extensions_registrator";
import { registerManagers } from "@/engine/scripts/register/managers_registrator";
import { registerSchemes } from "@/engine/scripts/register/schemes_registrator";

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

    math.randomseed(time_global());

    updateClassIds(classIds);

    unlockSystemIniOverriding();

    registerManagers();
    registerSchemes();
    registerExtensions();

    EventsManager.emitEvent(EGameEvent.GAME_STARTED);
  },
});
