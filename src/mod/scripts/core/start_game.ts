import { device } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { init_smart_names_table } from "@/mod/scripts/core/db/smart_names";
import { ActionLight } from "@/mod/scripts/core/logic/ActionLight";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { initializeModules } from "@/mod/scripts/core/modules";
import { SoundTheme } from "@/mod/scripts/core/sound/SoundTheme";
import { reset_sim_board } from "@/mod/scripts/se/SimBoard";
import { clearTaskManager } from "@/mod/scripts/se/task/TaskManager";
import { actorMenu } from "@/mod/scripts/ui/game/ActorMenu";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("start_game");

/**
 * Main start game callback.
 * Called when game is started
 */
export function startGame(): void {
  log.info("Start game callback");

  math.randomseed(device().time_global());

  initializeModules();
  init_smart_names_table();
  clearTaskManager();
  reset_sim_board();

  SoundTheme.load_sound();
  GlobalSound.reset();

  get_global<AnyCallablesModule>("dialog_manager").fill_phrase_table();
  get_global<AnyCallablesModule>("xrs_dyn_music").init();

  ActionLight.reset();

  actorMenu.initQuickSlotItems();

  log.info("Initialized modules");
}
