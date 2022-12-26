import { actorMenu } from "@/mod/scripts/ui/game/ActorMenu";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/start_game");

/**
 * Main start game callback.
 * Called when game is started
 */
export function startGame(): void {
  log.info("Start game callback");

  get_global("smart_names").init_smart_names_table();
  get_global("task_manager").clear_task_manager();
  get_global("sound_theme").load_sound();
  get_global("xr_sound").start_game_callback();
  get_global("dialog_manager").fill_phrase_table();
  get_global("xr_s").init();
  get_global("sim_objects").clear();
  get_global("sim_board").clear();
  get_global("sr_light").clean_up();

  actorMenu.initQuickSlotItems();

  log.info("Initialized modules");
}
