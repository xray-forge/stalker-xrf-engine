import { device } from "xray16";

import { EScheme } from "@/mod/lib/types/scheme";
import { disposeManager } from "@/mod/scripts/core/database";
import { resetSimBoard } from "@/mod/scripts/core/database/SimBoard";
import { initSmartNamesTable } from "@/mod/scripts/core/database/smart_names";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { ActorInventoryMenuManager } from "@/mod/scripts/core/managers/ActorInventoryMenuManager";
import { TaskManager } from "@/mod/scripts/core/managers/tasks";
import { initializeModules } from "@/mod/scripts/core/schemes/schemes_registering";
import { resetSchemeHard } from "@/mod/scripts/core/schemes/schemes_resetting";
import { DynamicMusicManager } from "@/mod/scripts/core/sound/DynamicMusicManager";
import { SoundTheme } from "@/mod/scripts/core/sound/SoundTheme";
import { fillPhrasesTable } from "@/mod/scripts/declarations/dialog_manager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("start_game");

/**
 * Main start game callback.
 * Called when game is started or loaded.
 */
// @ts-ignore, declare lua module global
start = (): void => {
  logger.info("Start game");

  math.randomseed(device().time_global());

  initializeModules();
  initSmartNamesTable();
  TaskManager.dispose();
  resetSimBoard();

  SoundTheme.loadSound();
  GlobalSound.reset();

  fillPhrasesTable();
  DynamicMusicManager.getInstance().initialize();

  resetSchemeHard(EScheme.SR_LIGHT);

  ActorInventoryMenuManager.getInstance().initQuickSlotItems();
};
