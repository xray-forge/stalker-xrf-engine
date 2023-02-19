import { device } from "xray16";

import { EScheme } from "@/mod/lib/types/scheme";
import { initSmartNamesTable } from "@/mod/scripts/core/db/smart_names";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { ActorInventoryMenuManager } from "@/mod/scripts/core/managers/ActorInventoryMenuManager";
import { initializeModules } from "@/mod/scripts/core/schemes/schemes_registering";
import { resetSchemeHard } from "@/mod/scripts/core/schemes/schemes_resetting";
import { DynamicMusicManager } from "@/mod/scripts/core/sound/DynamicMusicManager";
import { SoundTheme } from "@/mod/scripts/core/sound/SoundTheme";
import { fillPhrasesTable } from "@/mod/scripts/globals/dialog_manager";
import { resetSimBoard } from "@/mod/scripts/se/SimBoard";
import { clearTaskManager } from "@/mod/scripts/se/task/TaskManager";
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
  clearTaskManager();
  resetSimBoard();

  SoundTheme.loadSound();
  GlobalSound.reset();

  fillPhrasesTable();
  DynamicMusicManager.getInstance().initialize();

  resetSchemeHard(EScheme.SR_LIGHT);

  ActorInventoryMenuManager.getInstance().initQuickSlotItems();
};
