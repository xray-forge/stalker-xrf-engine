import { getManager } from "@/engine/core/database";
import { ActorInventoryMenuManager } from "@/engine/core/managers/actor/ActorInventoryMenuManager";
import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";
import { PdaManager } from "@/engine/core/managers/pda/PdaManager";
import { TradeManager } from "@/engine/core/managers/trade";
import { UpgradesManager } from "@/engine/core/managers/upgrades/UpgradesManager";
import {
  getRepairItemAskReplicLabel,
  getUpgradeCostLabel,
  issueUpgradeProperty,
} from "@/engine/core/managers/upgrades/utils/upgrades_label_utils";
import { canRepairItem } from "@/engine/core/managers/upgrades/utils/upgrades_price_utils";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  readWeaponAccuracy,
  readWeaponDamage,
  readWeaponDamageMultiplayer,
  readWeaponHandling,
  readWeaponRPM,
} from "@/engine/core/utils/weapon_parameters";
import {
  AnyArgs,
  AnyObject,
  EActorMenuMode,
  EActorMenuType,
  GameObject,
  TCount,
  TIndex,
  TLabel,
  TName,
  TNotCastedBoolean,
  TRate,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind interface externals");

/**
 * Callbacks related to loading screen tips generation.
 */
extern("loadscreen", {
  get_tip_number: () => getManager(LoadScreenManager).getRandomTipIndex(),
  get_mp_tip_number: () => getManager(LoadScreenManager).getRandomMultiplayerTipIndex(),
});

/**
 * Item upgrade callbacks from game engine.
 */
extern("inventory_upgrades", {
  get_upgrade_cost: (section: TSection): TLabel => getUpgradeCostLabel(section),
  can_repair_item: (section: TSection, condition: TRate, mechanicName: TName): boolean =>
    canRepairItem(section, condition, mechanicName),
  can_upgrade_item: (section: TSection, mechanicName: TName): boolean =>
    getManager(UpgradesManager).canUpgradeItem(section, mechanicName),
  effect_repair_item: (section: TSection, condition: TRate) =>
    getManager(UpgradesManager).getRepairItemPayment(section, condition),
  effect_functor_a: (name: TName, section: TSection, loading: TNotCastedBoolean) =>
    getManager(UpgradesManager).getUpgradeItemPayment(name, section, loading),
  prereq_functor_a: (name: TName, section: TSection): TLabel =>
    getManager(UpgradesManager).getPreRequirementsFunctorA(name, section),
  precondition_functor_a: (name: TName, section: TSection) =>
    getManager(UpgradesManager).getPreconditionFunctorA(name, section),
  property_functor_a: (data: string, name: TName): TLabel =>
    getManager(UpgradesManager).getPropertyFunctorA(data, name),
  property_functor_b: (data: string, upgrade: TName): TName => issueUpgradeProperty(data, upgrade),
  property_functor_c: (data: string, upgrade: TName): TName => issueUpgradeProperty(data, upgrade),
  question_repair_item: (section: TSection, condition: TRate, canRepair: boolean, mechanicName: TName): TLabel =>
    getRepairItemAskReplicLabel(section, condition, canRepair, mechanicName),
});

/**
 * Actor menu modes switching (pda, map, inventory) callbacks declaration.
 */
extern("actor_menu", {
  actor_menu_mode: (mode: EActorMenuMode): void => {
    return getManager(ActorInventoryMenuManager).setActiveMode(mode);
  },
});

/**
 * Actor menu callbacks declaration.
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
    from: GameObject,
    to: GameObject,
    oldList: EActorMenuType,
    newList: EActorMenuType
  ): boolean => {
    getManager(ActorInventoryMenuManager).onItemDropped(from, to, oldList, newList);

    return true;
  },
  /**
   * @param item - item game object receiving focus
   */
  CUIActorMenu_OnItemFocusReceive: (item: GameObject) =>
    getManager(ActorInventoryMenuManager).onItemFocusReceived(item),
  /**
   * @param item - item game object losing focus
   */
  CUIActorMenu_OnItemFocusLost: (item: GameObject) => getManager(ActorInventoryMenuManager).onItemFocusLost(item),
  /**
   * Script utils for logics extending to override availability of some items in NPC trading.
   *
   * @param owner - item owning game object
   * @param item - item game object for check
   * @returns whether item is available for trading
   */
  CInventory_ItemAvailableToTrade: (owner: GameObject, item: GameObject): boolean =>
    getManager(TradeManager).isItemAvailableForTrade(owner, item),
});

/**
 * PDA callbacks.
 */
extern("pda", {
  set_active_subdialog: (...args: AnyArgs): void => {
    logger.info("Set active subdialog");
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
    logger.info("Pda actor menu mode changed");
  },
  // todo: m_UIPropertiesBox, m_cur_location
  property_box_clicked: (...args: AnyArgs): void => {
    logger.info("Pda box property clicked");
  },
  // todo: m_UIPropertiesBox, m_cur_location->ObjectID(), (LPCSTR)m_cur_location->GetLevelName().c_str(), m_cur_location
  property_box_add_properties: (...args: AnyArgs): void => {
    logger.info("Pda box property added");
  },
  fill_fraction_state: (state: AnyObject): void => {
    getManager(PdaManager).fillFactionState(state);
  },
  get_monster_back: (): TName => {
    return getManager(PdaManager).getMonsterBackground();
  },
  get_monster_icon: (): TName => {
    return "";
  },
  get_favorite_weapon: (): TSection => {
    return getManager(PdaManager).getFavoriteWeapon();
  },
  get_stat: (index: TIndex): TLabel => {
    return getManager(PdaManager).getStatisticsLabel(index);
  },
});

/**
 * Params calculation for weapon menu in inventory.
 */
extern("ui_wpn_params", {
  GetRPM: (section: TSection, upgradeSections: string): number => readWeaponRPM(section, upgradeSections),
  GetDamage: (section: TSection, upgradeSections: string): number => readWeaponDamage(section, upgradeSections),
  GetDamageMP: (section: TSection, upgradeSections: string): number =>
    readWeaponDamageMultiplayer(section, upgradeSections),
  GetHandling: (section: TSection, upgradeSections: string): number => readWeaponHandling(section, upgradeSections),
  GetAccuracy: (section: TSection, upgradeSections: string): number => readWeaponAccuracy(section, upgradeSections),
});
