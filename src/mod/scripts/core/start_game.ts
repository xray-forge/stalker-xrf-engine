import { device } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { EScheme } from "@/mod/lib/types/scheme";
import { init_smart_names_table } from "@/mod/scripts/core/db/smart_names";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { ActorInventoryMenuManager } from "@/mod/scripts/core/managers/ActorInventoryMenuManager";
import { initializeModules } from "@/mod/scripts/core/schemes/schemes_registering";
import { resetSchemeHard } from "@/mod/scripts/core/schemes/schemes_resetting";
import { DynamicMusicManager } from "@/mod/scripts/core/sound/DynamicMusicManager";
import { SoundTheme } from "@/mod/scripts/core/sound/SoundTheme";
import { reset_sim_board } from "@/mod/scripts/se/SimBoard";
import { clearTaskManager } from "@/mod/scripts/se/task/TaskManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("start_game");

/**
 * Main start game callback.
 * Called when game is started
 */
export function startGame(): void {
  logger.info("Start game callback");

  math.randomseed(device().time_global());

  initializeModules();
  init_smart_names_table();
  clearTaskManager();
  reset_sim_board();

  SoundTheme.load_sound();
  GlobalSound.reset();

  get_global<AnyCallablesModule>("dialog_manager").fill_phrase_table();
  DynamicMusicManager.getInstance().initialize();

  resetSchemeHard(EScheme.SR_LIGHT);

  ActorInventoryMenuManager.getInstance().initQuickSlotItems();
}
