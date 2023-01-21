import { init_smart_names_table } from "@/mod/scripts/core/db/smart_names";
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

  initializeModules();
  init_smart_names_table();
  clearTaskManager();
  reset_sim_board();

  SoundTheme.load_sound();
  GlobalSound.start_game_callback();

  get_global("dialog_manager").fill_phrase_table();
  get_global("xr_s").init();
  get_global("sr_light").clean_up();

  actorMenu.initQuickSlotItems();

  log.info("Initialized modules");
}
