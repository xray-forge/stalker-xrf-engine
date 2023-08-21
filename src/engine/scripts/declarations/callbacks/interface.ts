import { ActorInventoryMenuManager } from "@/engine/core/managers/interface/ActorInventoryMenuManager";
import { ItemUpgradesManager } from "@/engine/core/managers/interface/ItemUpgradesManager";
import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";
import { PdaManager } from "@/engine/core/managers/interface/PdaManager";
import { WeaponParams } from "@/engine/core/ui/game/WeaponParams";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TWeapon } from "@/engine/lib/constants/items/weapons";
import {
  AnyArgs,
  AnyObject,
  ClientObject,
  EActorMenuMode,
  EActorMenuType,
  TCount,
  TIndex,
  TLabel,
  TName,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind interface externals");

/**
 * Callbacks related to loading screen tips generation.
 */
extern("loadscreen", {
  get_tip_number: (levelName: TName) => LoadScreenManager.getInstance().getRandomTipIndex(levelName),
  get_mp_tip_number: (levelName: TName) => LoadScreenManager.getInstance().getRandomMultiplayerTipIndex(levelName),
});

/**
 * Handle item upgrade callbacks from game engine.
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
 * Handle actor menu modes switching (pda, map, inventory).
 */
extern("actor_menu", {
  actor_menu_mode: (mode: EActorMenuMode): void => {
    return ActorInventoryMenuManager.getInstance().setActiveMode(mode);
  },
});

/**
 * Handle actor menu callbacks.
 */
extern("actor_menu_inventory", {
  /**
   * Handle drag and drop event in inventory.
   *
   * @param from - from object in inventory dropped
   * @param to - to object in inventory dropped
   * @param oldList - old menu type
   * @param newList - new menu type
   * @returns whether drag drop was handled
   */
  CUIActorMenu_OnItemDropped: (
    from: ClientObject,
    to: ClientObject,
    oldList: EActorMenuType,
    newList: EActorMenuType
  ): boolean => {
    ActorInventoryMenuManager.getInstance().onItemDropped(from, to, oldList, newList);

    return true;
  },
});

/**
 * todo;
 */
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
    logger.info("Pda actor menu mode changed:", ...args);
  },
  property_box_clicked: (...args: AnyArgs): void => {
    logger.info("Pda box property clicked");
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
  GetRPM: (section: TSection, upgradeSections: string): number => WeaponParams.getWeaponRPM(section, upgradeSections),
  GetDamage: (section: TSection, upgradeSections: string): number =>
    WeaponParams.getWeaponDamage(section, upgradeSections),
  GetDamageMP: (section: TSection, upgradeSections: string): number =>
    WeaponParams.getWeaponDamageMultiplayer(section, upgradeSections),
  GetHandling: (section: TSection, upgradeSections: string): number =>
    WeaponParams.getWeaponHandling(section, upgradeSections),
  GetAccuracy: (section: TSection, upgradeSections: string): number =>
    WeaponParams.getWeaponAccuracy(section, upgradeSections),
});
