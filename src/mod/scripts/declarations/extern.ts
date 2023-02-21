import { game, get_console, level, task, TXR_TaskState, XR_CGameTask, XR_game_object } from "xray16";

import { animations } from "@/mod/globals/animation/animations";
import { info_portions } from "@/mod/globals/info_portions";
import { TWeapon } from "@/mod/globals/items/weapons";
import { surgeConfig } from "@/mod/lib/configs/SurgeConfig";
import { AnyArgs, AnyCallable, AnyCallablesModule, AnyObject, PartialRecord } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { inventory_upgrades_functors } from "@/mod/scripts/core/inventory_upgrades";
import { AchievementsManager, EAchievement } from "@/mod/scripts/core/managers/AchievementsManager";
import { ActorInventoryMenuManager, EActorMenuMode } from "@/mod/scripts/core/managers/ActorInventoryMenuManager";
import { loadScreenManager } from "@/mod/scripts/core/managers/LoadScreenManager";
import { PdaManager } from "@/mod/scripts/core/managers/PdaManager";
import { sleep_cam_eff_id, SurgeManager } from "@/mod/scripts/core/managers/SurgeManager";
import { TradeManager } from "@/mod/scripts/core/managers/TradeManager";
import { WeatherManager } from "@/mod/scripts/core/managers/WeatherManager";
import { SchemeCutscene } from "@/mod/scripts/core/schemes/sr_cutscene/ActionCustscene";
import { smart_covers_list } from "@/mod/scripts/core/smart_covers/smart_covers_list";
import { get_task_manager } from "@/mod/scripts/core/task/TaskManager";
import { travelManager } from "@/mod/scripts/core/TravelManager";
import { GameOutroManager } from "@/mod/scripts/ui/game/GameOutroManager";
import { WeaponParams } from "@/mod/scripts/ui/game/WeaponParams";
import * as SleepDialogModule from "@/mod/scripts/ui/interaction/SleepDialog";
import { disableInfo } from "@/mod/scripts/utils/actor";
import { externClassMethod } from "@/mod/scripts/utils/general";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("extern");

logger.info("Resolve externals");

// eslint-disable-next-line @typescript-eslint/no-var-requires
declare_global("xr_conditions", require("@/mod/scripts/declarations/conditions"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
declare_global("xr_effects", require("@/mod/scripts/declarations/effects"));

// eslint-disable-next-line @typescript-eslint/no-var-requires
declare_global("dialogs_pripyat", require("@/mod/scripts/declarations/dialogs_pripyat"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
declare_global("dialogs_jupiter", require("@/mod/scripts/declarations/dialogs_jupiter"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
declare_global("dialogs_zaton", require("@/mod/scripts/declarations/dialogs_zaton"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
declare_global("dialogs", require("@/mod/scripts/declarations/dialogs"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
declare_global("dialog_manager", require("@/mod/scripts/declarations/dialog_manager"));

// eslint-disable-next-line @typescript-eslint/no-var-requires
declare_global("functors", require("@/mod/scripts/declarations/functors"));

declare_global("smart_covers", {});
declare_global("smart_covers.descriptions", smart_covers_list);

declare_global("extern", {});

/**
 * Sleeping functionality.
 */

declare_global("extern.dream_callback", SleepDialogModule.dream_callback);

declare_global("extern.dream_callback2", SleepDialogModule.dream_callback2);

/**
 * Anabiotic functionality.
 */

declare_global("extern.anabiotic_callback", () => {
  level.add_cam_effector(animations.camera_effects_surge_01, 10, false, "extern.anabiotic_callback2");

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
  WeatherManager.getInstance().forced_weather_change();
});

declare_global("extern.anabiotic_callback2", () => {
  get_global<AnyCallablesModule>("xr_effects").enable_ui(registry.actor, null);

  get_console().execute("snd_volume_music " + tostring(registry.sounds.musicVolume));
  get_console().execute("snd_volume_eff " + tostring(registry.sounds.effectsVolume));

  registry.sounds.effectsVolume = 0;
  registry.sounds.musicVolume = 0;

  disableInfo(info_portions.anabiotic_in_process);
});

declare_global("extern.surge_callback", () => {
  level.add_cam_effector(animations.camera_effects_surge_01, sleep_cam_eff_id, false, "extern.surge_callback2");
  // --    level.stop_weather_fx()
  // --    level.change_game_time(0,0,15)
  // --    WeatherManager.get_weather_manager():forced_weather_change()
});

declare_global("extern.surge_callback", () => {
  get_global<AnyCallablesModule>("xr_effects").enable_ui(registry.actor, null);
  /* --[[
    level.enable_input()
    level.show_indicators()
    registry.actor:restore_weapon()
  ]]-- */
});

declare_global("extern.task_complete", (task_id: string): boolean => get_task_manager().task_complete(task_id));

declare_global("extern.task_fail", (task_id: string): boolean => get_task_manager().task_fail(task_id));

declare_global("extern.task_callback", (target: XR_CGameTask, state: TXR_TaskState): void => {
  if (state === task.fail || state === task.completed) {
    get_task_manager().task_callback(target, state === task.completed);
  }
});

declare_global("loadscreen", {
  get_tip_number: (levelName: string) => loadScreenManager.get_tip_number(levelName),
  get_mp_tip_number: (levelName: string) => loadScreenManager.get_mp_tip_number(levelName),
});

declare_global("trade_manager", {
  get_sell_discount: (objectId: number) => TradeManager.getInstance().getSellDiscountForObject(objectId),
  get_buy_discount: (objectId: number) => TradeManager.getInstance().getBuyDiscountForObject(objectId),
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
  squad_cannot_travel: externClassMethod(travelManager, travelManager.squad_cannot_travel),
});

declare_global("extern.effector_callback", () => SchemeCutscene.onCutsceneEnd());

declare_global("on_actor_critical_power", () => {
  logger.info("Actor critical power");
});

declare_global("on_actor_critical_max_power", () => {
  logger.info("Actor critical max power");
});

declare_global("on_actor_bleeding", () => {
  logger.info("Actor bleeding");
});

declare_global("on_actor_satiety", () => {
  logger.info("Actor satiety");
});

declare_global("on_actor_radiation", () => {
  logger.info("Actor radiation");
});

declare_global("on_actor_weapon_jammed", () => {
  logger.info("Actor weapon jammed");
});

declare_global("on_actor_cant_walk_weight", () => {
  logger.info("Actor cant walk weight");
});

declare_global("on_actor_psy", () => {
  logger.info("Actor psy");
});

declare_global("actor_menu", {
  actor_menu_mode: (mode: EActorMenuMode): void => {
    return ActorInventoryMenuManager.getInstance().setActiveMode(mode);
  },
});

declare_global("actor_menu_inventory", {
  CUIActorMenu_OnItemDropped: (from: XR_game_object, to: XR_game_object, oldList: number, newList: number): void => {
    return ActorInventoryMenuManager.getInstance().onItemDropped();
  },
});

declare_global("pda", {
  set_active_subdialog: (...args: AnyArgs): void => {
    logger.info("Set active subdialog", ...args);
  },
  fill_fraction_state: (state: AnyObject): void => {
    return PdaManager.getInstance().fillFactionState(state);
  },
  get_max_resource: (): number => {
    return 10;
  },
  get_max_power: (): number => {
    return 10;
  },
  get_max_member_count: (): number => {
    return 10;
  },
  actor_menu_mode: (...args: AnyArgs): void => {
    logger.info("Pda actor menu mode:", ...args);
  },
  property_box_clicked: (...args: AnyArgs): void => {
    logger.info("Pda box property clicked:", ...args);
  },
  property_box_add_properties: (...args: AnyArgs): void => {
    logger.info("Pda box property added:", ...args);
  },
  get_monster_back: () => {
    return PdaManager.getInstance().getMonsterBackground();
  },
  get_monster_icon: () => {
    return PdaManager.getInstance().getMonsterIcon();
  },
  get_favorite_weapon: (): TWeapon => {
    return PdaManager.getInstance().getFavoriteWeapon();
  },
  get_stat: (index: number): string => {
    return PdaManager.getInstance().getStat(index);
  },
});

/**
 * Params in weapon menu in inventory.
 */
declare_global("ui_wpn_params", {
  GetRPM: externClassMethod(WeaponParams, WeaponParams.GetRPM),
  GetDamage: externClassMethod(WeaponParams, WeaponParams.GetDamage),
  GetDamageMP: externClassMethod(WeaponParams, WeaponParams.GetDamageMP),
  GetHandling: externClassMethod(WeaponParams, WeaponParams.GetHandling),
  GetAccuracy: externClassMethod(WeaponParams, WeaponParams.GetAccuracy),
});

/**
 * Checkers for achievements called from C++.
 */
declare_global(
  "extern.check_achievement",
  Object.values(EAchievement).reduce<PartialRecord<EAchievement, AnyCallable>>((acc, it) => {
    acc[it] = () => AchievementsManager.getInstance().checkAchieved(it);

    return acc;
  }, {})
);

/**
 * Outro conditions for game ending based on alife information.
 */
declare_global("outro", {
  conditions: GameOutroManager.getInstance().conditions,
  start_bk_sound: () => GameOutroManager.getInstance().start_bk_sound(),
  stop_bk_sound: () => GameOutroManager.getInstance().stop_bk_sound(),
  update_bk_sound_fade_start: (factor: number) => GameOutroManager.getInstance().update_bk_sound_fade_start(factor),
  update_bk_sound_fade_stop: (factor: number) => GameOutroManager.getInstance().update_bk_sound_fade_stop(factor),
});