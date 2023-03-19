import { device } from "xray16";

import { EScheme } from "@/engine/lib/types/scheme";
import { ActorInventoryMenuManager } from "@/engine/scripts/core/managers/ActorInventoryMenuManager";
import { GlobalSoundManager } from "@/engine/scripts/core/managers/GlobalSoundManager";
import { SimulationBoardManager } from "@/engine/scripts/core/managers/SimulationBoardManager";
import { TaskManager } from "@/engine/scripts/core/managers/tasks";
import { initializeModules } from "@/engine/scripts/core/schemes/schemes_registering";
import { resetSchemeHard } from "@/engine/scripts/core/schemes/schemes_resetting";
import { DynamicMusicManager } from "@/engine/scripts/core/sounds/DynamicMusicManager";
import { SoundTheme } from "@/engine/scripts/core/sounds/SoundTheme";
import { fillPhrasesTable } from "@/engine/scripts/declarations/dialogs/dialog_manager";
import { extern } from "@/engine/scripts/utils/binding";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register methods related to game start flows.
 */
extern("start", {
  /**
   * Main start game callback.
   * Called when game is started or loaded.
   *
   * todo: Reset all managers in a generic way.
   * todo: Since context of lua is destroyed after load, should all these actions be performed?
   */
  callback: (): void => {
    logger.info("Start game");

    math.randomseed(device().time_global());

    initializeModules();

    TaskManager.dispose();
    SimulationBoardManager.dispose();

    SoundTheme.loadSound();
    GlobalSoundManager.getInstance().reset(); // todo: Just reset the manager.

    fillPhrasesTable();
    DynamicMusicManager.getInstance().initialize();

    resetSchemeHard(EScheme.SR_LIGHT);

    ActorInventoryMenuManager.getInstance().initQuickSlotItems();
  },
});
