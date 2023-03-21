/* eslint @typescript-eslint/no-var-requires: 0 */

import { game, level, task, TXR_TaskState, XR_CGameTask, XR_CPhraseDialog, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { AchievementsManager } from "@/engine/core/managers/achievements/AchievementsManager";
import { EAchievement } from "@/engine/core/managers/achievements/EAchievement";
import { ActorInventoryMenuManager, EActorMenuMode } from "@/engine/core/managers/ActorInventoryMenuManager";
import { ItemUpgradesManager } from "@/engine/core/managers/ItemUpgradesManager";
import { LoadScreenManager } from "@/engine/core/managers/LoadScreenManager";
import { PdaManager } from "@/engine/core/managers/PdaManager";
import { sleep_cam_eff_id, SurgeManager } from "@/engine/core/managers/SurgeManager";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TradeManager } from "@/engine/core/managers/TradeManager";
import { TravelManager } from "@/engine/core/managers/TravelManager";
import { WeatherManager } from "@/engine/core/managers/WeatherManager";
import { smart_covers_list } from "@/engine/core/objects/alife/smart/smart_covers/smart_covers_list";
import { SchemeCutscene } from "@/engine/core/schemes/sr_cutscene/SchemeCutscene";
import { GameOutroManager } from "@/engine/core/ui/game/GameOutroManager";
import { WeaponParams } from "@/engine/core/ui/game/WeaponParams";
import * as SleepDialogModule from "@/engine/core/ui/interaction/SleepDialog";
import { extern, getExtern } from "@/engine/core/utils/binding";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { enableGameUi } from "@/engine/core/utils/control";
import { externClassMethod } from "@/engine/core/utils/general";
import { disableInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { surgeConfig } from "@/engine/lib/configs/SurgeConfig";
import { animations } from "@/engine/lib/constants/animation/animations";
import { console_commands } from "@/engine/lib/constants/console_commands";
import { info_portions } from "@/engine/lib/constants/info_portions";
import { TWeapon } from "@/engine/lib/constants/items/weapons";
import {
  AnyArgs,
  AnyCallable,
  AnyCallablesModule,
  AnyObject,
  PartialRecord,
  TCount,
  TIndex,
  TLabel,
  TName,
  TNumberId,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind externals");

/**
 * todo: Smaller registration files instead of one big file.
 * todo: Docblocks.
 */

extern("xr_conditions", require("@/engine/scripts/declarations/conditions"));
extern("xr_effects", require("@/engine/scripts/declarations/effects"));
extern("dialogs_pripyat", require("@/engine/scripts/declarations/dialogs/dialogs_pripyat"));
extern("dialogs_jupiter", require("@/engine/scripts/declarations/dialogs/dialogs_jupiter"));
extern("dialogs_zaton", require("@/engine/scripts/declarations/dialogs/dialogs_zaton"));
extern("dialogs", require("@/engine/scripts/declarations/dialogs/dialogs"));
extern("dialog_manager", require("@/engine/scripts/declarations/dialogs/dialog_manager"));
extern("functors", require("@/engine/scripts/declarations/functors"));

// todo: Check if needed.
extern("smart_covers", {
  descriptions: smart_covers_list,
});

/**
 * Sleeping functionality.
 */

extern("engine.dream_callback", SleepDialogModule.dream_callback);

extern("engine.dream_callback2", SleepDialogModule.dream_callback2);

/**
 * Anabiotic functionality.
 */

extern("engine.anabiotic_callback", () => {
  level.add_cam_effector(animations.camera_effects_surge_01, 10, false, "engine.anabiotic_callback2");

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

extern("engine.anabiotic_callback2", () => {
  enableGameUi();

  executeConsoleCommand(console_commands.snd_volume_music, registry.sounds.musicVolume);
  executeConsoleCommand(console_commands.snd_volume_eff, registry.sounds.effectsVolume);

  registry.sounds.effectsVolume = 0;
  registry.sounds.musicVolume = 0;

  disableInfo(info_portions.anabiotic_in_process);
});

extern("engine.surge_callback", () => {
  level.add_cam_effector(animations.camera_effects_surge_01, sleep_cam_eff_id, false, "engine.surge_callback2");
  // --    level.stop_weather_fx()
  // --    level.change_game_time(0,0,15)
  // --    WeatherManager.get_weather_manager():forced_weather_change()
});

extern("engine.surge_callback", () => {
  getExtern<AnyCallablesModule>("xr_effects").enable_ui(registry.actor, null);
  /* --[[
    level.enable_input()
    level.show_indicators()
    registry.actor:restore_weapon()
  ]]-- */
});

extern("engine.task_complete", (taskId: TStringId): boolean => {
  return TaskManager.getInstance().onTaskCompleted(taskId);
});

extern("engine.task_fail", (taskId: TStringId): boolean => TaskManager.getInstance().onTaskFailed(taskId));

extern("engine.task_callback", (target: XR_CGameTask, state: TXR_TaskState): void => {
  if (state === task.fail || state === task.completed) {
    // todo: Supply task state enum.
    TaskManager.getInstance().onTaskCallback(target, state === task.completed);
  }
});

extern("loadscreen", {
  get_tip_number: (levelName: TName) => LoadScreenManager.getInstance().getRandomTipIndex(levelName),
  get_mp_tip_number: (levelName: TName) => LoadScreenManager.getInstance().getRandomMultiplayerTipIndex(levelName),
});

extern("trade_manager", {
  get_sell_discount: (objectId: TNumberId) => TradeManager.getInstance().getSellDiscountForObject(objectId),
  get_buy_discount: (objectId: TNumberId) => TradeManager.getInstance().getBuyDiscountForObject(objectId),
});

/**
 * todo;
 */
extern("inventory_upgrades", {
  get_upgrade_cost: (section: TSection): TLabel => ItemUpgradesManager.getInstance().getUpgradeCost(section),
  can_repair_item: (itemName: TName, itemCondition: number, mechanicName: TName): boolean =>
    ItemUpgradesManager.getInstance().isAbleToRepairItem(itemName, itemCondition, mechanicName),
  can_upgrade_item: (itemName: TName, mechanicName: TName): boolean =>
    ItemUpgradesManager.getInstance().canUpgradeItem(itemName, mechanicName),
  effect_repair_item: (itemName: TName, itemCondition: number) =>
    ItemUpgradesManager.getInstance().getRepairItemPayment(itemName, itemCondition),
  effect_functor_a: (name: TName, section: TSection, loading: number) =>
    ItemUpgradesManager.getInstance().useEffectFunctorA(name, section, loading),
  prereq_functor_a: (name: TName, section: TSection): TLabel =>
    ItemUpgradesManager.getInstance().getPreRequirementsFunctorA(name, section),
  precondition_functor_a: (name: TName, section: TSection) =>
    ItemUpgradesManager.getInstance().getPreconditionFunctorA(name, section),
  property_functor_a: (data: string, name: TName): TLabel =>
    ItemUpgradesManager.getInstance().getPropertyFunctorA(data, name),
  property_functor_b: (data: string, name: TName): TName =>
    ItemUpgradesManager.getInstance().getPropertyFunctorB(data, name),
  property_functor_c: (data: string, name: TName): TName =>
    ItemUpgradesManager.getInstance().getPropertyFunctorC(data, name),
  question_repair_item: (itemName: TName, itemCondition: number, canRepair: boolean, mechanicName: TName): TLabel =>
    ItemUpgradesManager.getInstance().getRepairItemAskReplicLabel(itemName, itemCondition, canRepair, mechanicName),
});

/**
 * todo;
 */
extern("travel_callbacks", {
  initializeTravellerDialog: (dialog: XR_CPhraseDialog) =>
    TravelManager.getInstance().initializeTravellerDialog(dialog),
  canStartTravelingDialogs: (actor: XR_game_object, npc: XR_game_object) =>
    TravelManager.getInstance().canStartTravelingDialogs(actor, npc),
  getSquadCurrentActionDescription: (actor: XR_game_object, npc: XR_game_object): TLabel =>
    TravelManager.getInstance().getSquadCurrentActionDescription(actor, npc),
  canActorMoveWithSquad: (actor: XR_game_object, npc: XR_game_object): boolean =>
    TravelManager.getInstance().canActorMoveWithSquad(actor, npc),
  canSquadTakeActor: (actor: XR_game_object, npc: XR_game_object) =>
    TravelManager.getInstance().canSquadTakeActor(actor, npc),
  cannotSquadTakeActor: (npc: XR_game_object, actor: XR_game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().cannotSquadTakeActor(npc, actor, dialogId, phraseId),
  onTravelTogetherWithSquad: (npc: XR_game_object, actor: XR_game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().onTravelTogetherWithSquad(npc, actor, dialogId, phraseId),
  onTravelToSpecificSmartWithSquad: (
    actor: XR_game_object,
    npc: XR_game_object,
    dialogId: TStringId,
    phraseId: TStringId
  ) => TravelManager.getInstance().onTravelToSpecificSmartWithSquad(actor, npc, dialogId, phraseId),
  canSquadTravel: (npc: XR_game_object, actor: XR_game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().canSquadTravel(npc, actor, dialogId, phraseId),
  canNegotiateTravelToSmart: (
    actor: XR_game_object,
    npc: XR_game_object,
    dialogId: TStringId,
    prevPhraseId: TStringId,
    phraseId: TStringId
  ) => TravelManager.getInstance().canNegotiateTravelToSmart(actor, npc, dialogId, prevPhraseId, phraseId),
  getTravelConst: (actor: XR_game_object, npc: XR_game_object, dialogId: TStringId, phraseId: TStringId): TLabel =>
    TravelManager.getInstance().getTravelConst(actor, npc, dialogId, phraseId),
  isEnoughMoneyToTravel: (actor: XR_game_object, npc: XR_game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().isEnoughMoneyToTravel(actor, npc, dialogId, phraseId),
  isNotEnoughMoneyToTravel: (actor: XR_game_object, npc: XR_game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().isNotEnoughMoneyToTravel(actor, npc, dialogId, phraseId),
  cannotSquadTravel: (npc: XR_game_object, actor: XR_game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().cannotSquadTravel(npc, actor, dialogId, phraseId),
});

extern("engine.effector_callback", () => SchemeCutscene.onCutsceneEnd());

extern("on_actor_critical_power", () => {
  logger.info("Actor critical power");
});

extern("on_actor_critical_max_power", () => {
  logger.info("Actor critical max power");
});

extern("on_actor_bleeding", () => {
  logger.info("Actor bleeding");
});

extern("on_actor_satiety", () => {
  logger.info("Actor satiety");
});

extern("on_actor_radiation", () => {
  logger.info("Actor radiation");
});

extern("on_actor_weapon_jammed", () => {
  logger.info("Actor weapon jammed");
});

extern("on_actor_cant_walk_weight", () => {
  logger.info("Actor cant walk weight");
});

extern("on_actor_psy", () => {
  logger.info("Actor psy");
});

extern("actor_menu", {
  actor_menu_mode: (mode: EActorMenuMode): void => {
    return ActorInventoryMenuManager.getInstance().setActiveMode(mode);
  },
});

extern("actor_menu_inventory", {
  CUIActorMenu_OnItemDropped: (from: XR_game_object, to: XR_game_object, oldList: number, newList: number): void => {
    return ActorInventoryMenuManager.getInstance().onItemDropped();
  },
});

extern("pda", {
  set_active_subdialog: (...args: AnyArgs): void => {
    logger.info("Set active subdialog", ...args);
  },
  fill_fraction_state: (state: AnyObject): void => {
    return PdaManager.getInstance().fillFactionState(state);
  },
  get_max_resource: (): TCount => {
    return 10;
  },
  get_max_power: (): TCount => {
    return 10;
  },
  get_max_member_count: (): TCount => {
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
  get_stat: (index: TIndex): TLabel => {
    return PdaManager.getInstance().getStat(index);
  },
});

/**
 * Params in weapon menu in inventory.
 */
extern("ui_wpn_params", {
  GetRPM: externClassMethod(WeaponParams, WeaponParams.GetRPM),
  GetDamage: externClassMethod(WeaponParams, WeaponParams.GetDamage),
  GetDamageMP: externClassMethod(WeaponParams, WeaponParams.GetDamageMP),
  GetHandling: externClassMethod(WeaponParams, WeaponParams.GetHandling),
  GetAccuracy: externClassMethod(WeaponParams, WeaponParams.GetAccuracy),
});

/**
 * Checkers for achievements called from C++.
 */
extern(
  "engine.check_achievement",
  Object.values(EAchievement).reduce<PartialRecord<EAchievement, AnyCallable>>((acc, it) => {
    acc[it] = () => AchievementsManager.getInstance().checkAchieved(it);

    return acc;
  }, {})
);

/**
 * Outro conditions for game ending based on alife information.
 */
extern("outro", {
  conditions: GameOutroManager.OUTRO_CONDITIONS,
  start_bk_sound: () => GameOutroManager.getInstance().start_bk_sound(),
  stop_bk_sound: () => GameOutroManager.getInstance().stop_bk_sound(),
  update_bk_sound_fade_start: (factor: number) => GameOutroManager.getInstance().update_bk_sound_fade_start(factor),
  update_bk_sound_fade_stop: (factor: number) => GameOutroManager.getInstance().update_bk_sound_fade_stop(factor),
});
