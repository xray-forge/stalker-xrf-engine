import { registerRanks } from "@/engine/core/database/ranks";
import { registerSimulator } from "@/engine/core/database/simulation";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { extern } from "@/engine/core/utils/binding";
import { updateClassIds } from "@/engine/core/utils/class_ids_list";
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
  callback: (isNew: boolean): void => {
    logger.info("Start game:", isNew);

    updateClassIds(classIds);

    registerSimulator();
    registerRanks();

    unlockSystemIniOverriding();

    registerManagers();
    registerSchemes();
    registerExtensions();

    EventsManager.emitEvent(EGameEvent.GAME_STARTED);
  },
});
