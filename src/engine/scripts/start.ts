import { device } from "xray16";

import { ActorInventoryMenuManager } from "@/engine/core/managers/ActorInventoryMenuManager";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { TaskManager } from "@/engine/core/managers/tasks";
import { registerSchemeModules } from "@/engine/core/schemes/base/register";
import { resetSchemeHard } from "@/engine/core/schemes/base/utils";
import { SoundTheme } from "@/engine/core/sounds/SoundTheme";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme } from "@/engine/lib/types/scheme";
import { fillPhrasesTable } from "@/engine/scripts/declarations/dialogs/dialog_manager";

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

    registerSchemeModules();

    TaskManager.dispose();
    SimulationBoardManager.dispose();

    SoundTheme.loadSound();
    GlobalSoundManager.getInstance().reset(); // todo: Just reset the manager.

    fillPhrasesTable();

    resetSchemeHard(EScheme.SR_LIGHT);

    ActorInventoryMenuManager.getInstance().initQuickSlotItems();
  },
});
