import { game, get_console, level, task, TXR_TaskState, XR_CGameTask } from "xray16";

import { camera_effects } from "@/mod/globals/camera_effects";
import { surgeConfig } from "@/mod/lib/configs/SurgeConfig";
import { AnyCallablesModule } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { inventory_upgrades_functors } from "@/mod/scripts/core/inventory_upgrades";
import { loadScreenManager } from "@/mod/scripts/core/LoadScreenManager";
import { sleep_cam_eff_id, SurgeManager } from "@/mod/scripts/core/SurgeManager";
import { get_buy_discount, get_sell_discount } from "@/mod/scripts/core/TradeManager";
import { travelManager } from "@/mod/scripts/core/TravelManager";
import { weatherManager } from "@/mod/scripts/core/WeatherManager";
import { get_task_manager } from "@/mod/scripts/se/task/TaskManager";
import * as SleepDialogModule from "@/mod/scripts/ui/interaction/SleepDialog";
import { disableInfo } from "@/mod/scripts/utils/actor";
import { externClassMethod } from "@/mod/scripts/utils/general";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("_extern");

log.info("Resolve externals");

// @ts-ignore global declararation
dream_callback = SleepDialogModule.dream_callback;

// @ts-ignore global declararation
dream_callback2 = SleepDialogModule.dream_callback2;

// @ts-ignore global declararation
anabiotic_callback = () => {
  level.add_cam_effector(camera_effects.surge_01, 10, false, "_extern.anabiotic_callback2");

  const rnd = math.random(35, 45);
  const surgeManager: SurgeManager = SurgeManager.getInstance();

  if (surgeManager.isStarted) {
    const tf = level.get_time_factor();
    const diff_sec = math.ceil(game.get_game_time().diffSec(surgeManager.initedTime) / tf);

    if (rnd > ((surgeConfig.DURATION - diff_sec) * tf) / 60) {
      surgeManager.isTimeForwarded = true;
      surgeManager.ui_disabled = true;
      surgeManager.kill_all_unhided();
      surgeManager.endSurge();
    }
  }

  level.change_game_time(0, 0, rnd);
  weatherManager.forced_weather_change();
};

// @ts-ignore global declararation
anabiotic_callback2 = () => {
  get_global<AnyCallablesModule>("xr_effects").enable_ui(getActor(), null);

  get_console().execute("snd_volume_music " + tostring(get_global("mus_vol")));
  get_console().execute("snd_volume_eff " + tostring(get_global("amb_vol")));

  declare_global("amb_vol", 0);
  declare_global("mus_vol", 0);

  disableInfo("anabiotic_in_process");
};

export function surge_callback(): void {
  level.add_cam_effector(camera_effects.surge_01, sleep_cam_eff_id, false, "_extern.surge_callback2");
  // --    level.stop_weather_fx()
  // --    level.change_game_time(0,0,15)
  // --    WeatherManager.get_weather_manager():forced_weather_change()
}

export function surge_callback2(): void {
  get_global<AnyCallablesModule>("xr_effects").enable_ui(getActor(), null);
  /* --[[
  level.enable_input()
  level.show_indicators()
  getActor():restore_weapon()
]]-- */
}

// @ts-ignore global declararation
task_complete = (task_id: string): boolean => {
  return get_task_manager().task_complete(task_id);
};

// @ts-ignore global declararation
task_fail = (task_id: string): boolean => {
  return get_task_manager().task_fail(task_id);
};

// @ts-ignore global declararation
task_callback = (target: XR_CGameTask, state: TXR_TaskState): void => {
  if (state == task.fail || state == task.completed) {
    get_task_manager().task_callback(target, state == task.completed);
  }
};

// @ts-ignore global declararation
loadscreen = {
  get_tip_number: (levelName: string) => loadScreenManager.get_tip_number(levelName),
  get_mp_tip_number: (levelName: string) => loadScreenManager.get_mp_tip_number(levelName)
};

// @ts-ignore
trade_manager = {
  get_sell_discount: get_sell_discount,
  get_buy_discount: get_buy_discount
};

// @ts-ignore
inventory_upgrades = inventory_upgrades_functors;

// @ts-ignore
travel_manager = {
  init_traveler_dialog: externClassMethod(travelManager, travelManager.init_traveler_dialog),
  uni_traveler_precond: externClassMethod(travelManager, travelManager.uni_traveler_precond),
  check_squad_for_enemies: externClassMethod(travelManager, travelManager.check_squad_for_enemies),
  traveling: externClassMethod(travelManager, travelManager.traveling),
  squad_action_description: externClassMethod(travelManager, travelManager.squad_action_description),
  squad_on_move: externClassMethod(travelManager, travelManager.squad_on_move),
  squad_can_take_actor: externClassMethod(travelManager, travelManager.squad_can_take_actor),
  squad_cannot_take_actor: externClassMethod(travelManager, travelManager.squad_cannot_take_actor),
  actor_go_with_squad: externClassMethod(travelManager, travelManager.actor_go_with_squad),
  check_smart_availability: externClassMethod(travelManager, travelManager.check_smart_availability),
  actor_travel_with_squad: externClassMethod(travelManager, travelManager.actor_travel_with_squad),
  squad_can_travel: externClassMethod(travelManager, travelManager.squad_can_travel),
  travel_condlist: externClassMethod(travelManager, travelManager.travel_condlist),
  get_price_by_distance: externClassMethod(travelManager, travelManager.get_price_by_distance),
  get_travel_cost: externClassMethod(travelManager, travelManager.get_travel_cost),
  actor_have_money: externClassMethod(travelManager, travelManager.actor_have_money),
  actor_have_not_money: externClassMethod(travelManager, travelManager.actor_have_not_money),
  squad_cannot_travel: externClassMethod(travelManager, travelManager.squad_cannot_travel)
};
