import { game, get_console, level, task, TXR_TaskState, XR_CGameTask } from "xray16";

import { animations } from "@/mod/globals/animations";
import { surgeConfig } from "@/mod/lib/configs/SurgeConfig";
import { AnyArgs, AnyCallablesModule, AnyObject } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { inventory_upgrades_functors } from "@/mod/scripts/core/inventory_upgrades";
import { loadScreenManager } from "@/mod/scripts/core/LoadScreenManager";
import { startGame } from "@/mod/scripts/core/start_game";
import { sleep_cam_eff_id, SurgeManager } from "@/mod/scripts/core/SurgeManager";
import { get_buy_discount, get_sell_discount } from "@/mod/scripts/core/TradeManager";
import { travelManager } from "@/mod/scripts/core/TravelManager";
import { weatherManager } from "@/mod/scripts/core/WeatherManager";
import { ActionCutscene } from "@/mod/scripts/cutscenes/ActionCustscene";
import { get_task_manager } from "@/mod/scripts/se/task/TaskManager";
import { smart_covers_list } from "@/mod/scripts/smart_covers/smart_covers_list";
import { EActorMenuMode } from "@/mod/scripts/ui/game/AbstractActorMenu";
import { actorMenu } from "@/mod/scripts/ui/game/ActorMenu";
import { pdaMenu } from "@/mod/scripts/ui/game/PdaMenu";
import * as SleepDialogModule from "@/mod/scripts/ui/interaction/SleepDialog";
import { disableInfo } from "@/mod/scripts/utils/actor";
import { externClassMethod } from "@/mod/scripts/utils/general";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("_extern");

log.info("Resolve externals");

declare_global("_extern", {});

declare_global("smart_covers", {});
declare_global("smart_covers.descriptions", smart_covers_list);

/**
 * Called by game engine on game start
 */

declare_global("_extern.start_game_callback", startGame);

/**
 * Sleeping functionality.
 */

declare_global("_extern.dream_callback", SleepDialogModule.dream_callback);

declare_global("_extern.dream_callback2", SleepDialogModule.dream_callback2);

/**
 * Anabiotic functionality.
 */

declare_global("_extern.anabiotic_callback", () => {
  level.add_cam_effector(animations.camera_effects_surge_01, 10, false, "_extern.anabiotic_callback2");

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
});

declare_global("_extern.anabiotic_callback2", () => {
  get_global<AnyCallablesModule>("xr_effects").enable_ui(getActor(), null);

  get_console().execute("snd_volume_music " + tostring(get_global("mus_vol")));
  get_console().execute("snd_volume_eff " + tostring(get_global("amb_vol")));

  declare_global("amb_vol", 0);
  declare_global("mus_vol", 0);

  disableInfo("anabiotic_in_process");
});

declare_global("_extern.surge_callback", () => {
  level.add_cam_effector(animations.camera_effects_surge_01, sleep_cam_eff_id, false, "_extern.surge_callback2");
  // --    level.stop_weather_fx()
  // --    level.change_game_time(0,0,15)
  // --    WeatherManager.get_weather_manager():forced_weather_change()
});

declare_global("_extern.surge_callback", () => {
  get_global<AnyCallablesModule>("xr_effects").enable_ui(getActor(), null);
  /* --[[
    level.enable_input()
    level.show_indicators()
    getActor():restore_weapon()
  ]]-- */
});

declare_global("_extern.task_complete", (task_id: string): boolean => get_task_manager().task_complete(task_id));

declare_global("_extern.task_fail", (task_id: string): boolean => get_task_manager().task_fail(task_id));

declare_global("_extern.task_callback", (target: XR_CGameTask, state: TXR_TaskState): void => {
  if (state === task.fail || state === task.completed) {
    get_task_manager().task_callback(target, state === task.completed);
  }
});

declare_global("loadscreen", {
  get_tip_number: (levelName: string) => loadScreenManager.get_tip_number(levelName),
  get_mp_tip_number: (levelName: string) => loadScreenManager.get_mp_tip_number(levelName)
});

declare_global("trade_manager", {
  get_sell_discount: get_sell_discount,
  get_buy_discount: get_buy_discount
});

declare_global("inventory_upgrades", inventory_upgrades_functors);

declare_global("travel_manager", {
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
});

declare_global("_extern.effector_callback", () => ActionCutscene.onCutsceneEnd());

declare_global("on_actor_critical_power", () => log.info("Actor critical power"));

declare_global("on_actor_critical_max_power", () => log.info("Actor critical max power"));

declare_global("on_actor_bleeding", () => log.info("Actor bleeding"));

declare_global("on_actor_satiety", () => log.info("Actor satiety"));

declare_global("on_actor_radiation", () => log.info("Actor radiation"));

declare_global("on_actor_weapon_jammed", () => log.info("Actor weapon jammed"));

declare_global("on_actor_cant_walk_weight", () => log.info("Actor cant walk weight"));

declare_global("on_actor_psy", () => log.info("Actor psy"));

declare_global("actor_menu", {
  actor_menu_mode(mode: EActorMenuMode): void {
    return actorMenu.setActiveMode(mode);
  }
});

declare_global("pda", {
  set_active_subdialog(...args: AnyArgs): void {
    return log.info("Set active subdialog", ...args);
  },
  fill_fraction_state(state: AnyObject): void {
    return pdaMenu.fillFactionState(state);
  },
  get_max_resource(): number {
    return 10;
  },
  get_max_power(): number {
    return 10;
  },
  get_max_member_count(): number {
    return 10;
  },
  actor_menu_mode(...args: AnyArgs): void {
    log.info("Pda actor menu mode:", ...args);
  },
  property_box_clicked(...args: AnyArgs): void {
    log.info("Pda box property clicked:", ...args);
  },
  property_box_add_properties(...args: AnyArgs): void {
    log.info("Pda box property added:", ...args);
  },
  get_monster_back() {
    return pdaMenu.getMonsterBackground();
  },
  get_monster_icon() {
    return pdaMenu.getMonsterIcon();
  },
  get_favorite_weapon(): string {
    return pdaMenu.getFavoriteWeapon();
  },
  get_stat(index: number): string {
    return pdaMenu.getStat(index);
  }
});
