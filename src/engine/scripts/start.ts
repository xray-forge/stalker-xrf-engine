import { extern, updateClassIds } from "xray16/lib";
import { $filename } from "xray16/macros";

import { classIds } from "@/engine/constants/class_ids";
import { registerRanks } from "@/engine/core/database/ranks";
import { registerSimulator } from "@/engine/core/database/simulation";
import { unlockSystemIniOverriding } from "@/engine/core/ini";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { LuaLogger } from "@/engine/core/utils/logging";
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
  callback: (isNewGame: boolean): void => {
    logger.info("Start game: %s", isNewGame);

    updateClassIds(classIds);

    registerSimulator();
    registerRanks();

    unlockSystemIniOverriding();

    registerManagers();
    registerSchemes();
    registerExtensions(isNewGame);

    EventsManager.emitEvent(EGameEvent.GAME_STARTED, isNewGame);
  },
});
