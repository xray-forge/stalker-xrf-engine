import { device } from "xray16";

import { EScheme } from "@/mod/lib/types/scheme";
import { resetSimBoard } from "@/mod/scripts/core/database/SimulationBoardManager";
import { initSmartNamesTable } from "@/mod/scripts/core/database/smart_names";
import { ActorInventoryMenuManager } from "@/mod/scripts/core/manager/ActorInventoryMenuManager";
import { GlobalSoundManager } from "@/mod/scripts/core/manager/GlobalSoundManager";
import { TaskManager } from "@/mod/scripts/core/manager/tasks";
import { initializeModules } from "@/mod/scripts/core/scheme/schemes_registering";
import { resetSchemeHard } from "@/mod/scripts/core/scheme/schemes_resetting";
import { DynamicMusicManager } from "@/mod/scripts/core/sound/DynamicMusicManager";
import { SoundTheme } from "@/mod/scripts/core/sound/SoundTheme";
import { fillPhrasesTable } from "@/mod/scripts/declarations/dialog_manager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Main start game callback.
 * Called when game is started or loaded.
 *
 * todo: Reset all managers in a generic way.
 */
startGame = (): void => {
  logger.info("Start game");

  math.randomseed(device().time_global());

  initializeModules();
  initSmartNamesTable();
  TaskManager.dispose();
  resetSimBoard();

  SoundTheme.loadSound();
  GlobalSoundManager.getInstance().reset(); // todo: Just reset the manager.

  fillPhrasesTable();
  DynamicMusicManager.getInstance().initialize();

  resetSchemeHard(EScheme.SR_LIGHT);

  ActorInventoryMenuManager.getInstance().initQuickSlotItems();
};
