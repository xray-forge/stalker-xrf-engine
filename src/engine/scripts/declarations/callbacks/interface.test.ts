import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import { ActorInventoryMenuManager } from "@/engine/core/managers/actor";
import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";
import { PdaManager } from "@/engine/core/managers/pda";
import { canRepairItem, getRepairItemAskReplicLabel, UpgradesManager } from "@/engine/core/managers/upgrades";
import { TItemUpgradeBranch } from "@/engine/core/managers/upgrades/item_upgrades_types";
import { getUpgradeCostLabel } from "@/engine/core/managers/upgrades/utils/upgrades_price_utils";
import { WeaponParams } from "@/engine/core/ui/game/WeaponParams";
import { getExtern } from "@/engine/core/utils/binding";
import {
  AnyArgs,
  AnyCallablesModule,
  AnyObject,
  EActorMenuMode,
  EActorMenuType,
  GameObject,
  TName,
} from "@/engine/lib/types";
import { callBinding, checkBinding, checkNestedBinding } from "@/fixtures/engine";
import { mockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/managers/upgrades/utils/upgrades_price_utils", () => ({
  getUpgradeCostLabel: jest.fn(() => "100"),
  canRepairItem: jest.fn(() => true),
  getRepairItemAskReplicLabel: jest.fn(() => "test_label"),
}));

describe("interface external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/interface");
  });

  it("should correctly inject external methods for game", () => {
    checkBinding("ui_wpn_params");
    checkNestedBinding("ui_wpn_params", "GetRPM");
    checkNestedBinding("ui_wpn_params", "GetDamage");
    checkNestedBinding("ui_wpn_params", "GetDamageMP");
    checkNestedBinding("ui_wpn_params", "GetHandling");
    checkNestedBinding("ui_wpn_params", "GetAccuracy");

    checkBinding("inventory_upgrades");
    checkNestedBinding("inventory_upgrades", "get_upgrade_cost");
    checkNestedBinding("inventory_upgrades", "can_repair_item");
    checkNestedBinding("inventory_upgrades", "can_upgrade_item");
    checkNestedBinding("inventory_upgrades", "effect_repair_item");
    checkNestedBinding("inventory_upgrades", "effect_functor_a");
    checkNestedBinding("inventory_upgrades", "prereq_functor_a");
    checkNestedBinding("inventory_upgrades", "precondition_functor_a");
    checkNestedBinding("inventory_upgrades", "property_functor_a");
    checkNestedBinding("inventory_upgrades", "property_functor_b");
    checkNestedBinding("inventory_upgrades", "property_functor_c");
    checkNestedBinding("inventory_upgrades", "question_repair_item");

    checkBinding("pda");
    checkNestedBinding("pda", "set_active_subdialog");
    checkNestedBinding("pda", "fill_fraction_state");
    checkNestedBinding("pda", "get_max_resource");
    checkNestedBinding("pda", "get_max_power");
    checkNestedBinding("pda", "get_max_member_count");
    checkNestedBinding("pda", "actor_menu_mode");
    checkNestedBinding("pda", "property_box_clicked");
    checkNestedBinding("pda", "property_box_add_properties");
    checkNestedBinding("pda", "get_monster_back");
    checkNestedBinding("pda", "get_monster_icon");
    checkNestedBinding("pda", "get_favorite_weapon");
    checkNestedBinding("pda", "get_stat");

    checkBinding("actor_menu_inventory");
    checkNestedBinding("actor_menu_inventory", "CUIActorMenu_OnItemDropped");

    checkBinding("actor_menu");
    checkNestedBinding("actor_menu", "actor_menu_mode");
  });

  it("should correctly get tips from manager", () => {
    checkBinding("loadscreen");
    checkNestedBinding("loadscreen", "get_tip_number");
    checkNestedBinding("loadscreen", "get_mp_tip_number");

    const loadScreenManager: LoadScreenManager = LoadScreenManager.getInstance();

    jest.spyOn(loadScreenManager, "getRandomMultiplayerTipIndex");
    jest.spyOn(loadScreenManager, "getRandomTipIndex");

    expect(typeof getExtern<AnyCallablesModule>("loadscreen").get_tip_number()).toBe("number");
    expect(typeof getExtern<AnyCallablesModule>("loadscreen").get_mp_tip_number()).toBe("number");

    expect(loadScreenManager.getRandomTipIndex).toHaveBeenCalledTimes(1);
    expect(loadScreenManager.getRandomMultiplayerTipIndex).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle inventory upgrades callbacks", () => {
    const upgradesManager: UpgradesManager = UpgradesManager.getInstance();

    jest.spyOn(upgradesManager, "canUpgradeItem").mockImplementation(jest.fn(() => true));
    jest.spyOn(upgradesManager, "getRepairItemPayment").mockImplementation(jest.fn(() => true));
    jest.spyOn(upgradesManager, "useEffectFunctorA").mockImplementation(jest.fn(() => true));
    jest.spyOn(upgradesManager, "getPreRequirementsFunctorA").mockImplementation(jest.fn(() => "test-1"));
    jest.spyOn(upgradesManager, "getPreconditionFunctorA").mockImplementation(jest.fn(() => 1 as TItemUpgradeBranch));
    jest.spyOn(upgradesManager, "getPropertyFunctorA").mockImplementation(jest.fn(() => "a"));
    jest.spyOn(upgradesManager, "getPropertyFunctorB").mockImplementation(jest.fn(() => "b"));
    jest.spyOn(upgradesManager, "getPropertyFunctorC").mockImplementation(jest.fn(() => "c"));

    const callUpgradeBinding = (name: TName, args: AnyArgs = []) =>
      callBinding(name, args, (_G as AnyObject)["inventory_upgrades"]);

    expect(callUpgradeBinding("get_upgrade_cost", ["test"])).toBe("100");
    expect(getUpgradeCostLabel).toHaveBeenCalledWith("test");

    expect(callUpgradeBinding("can_repair_item", ["test", 1, "name"])).toBe(true);
    expect(canRepairItem).toHaveBeenCalledWith("test", 1, "name");

    expect(callUpgradeBinding("can_upgrade_item", ["test", "name"])).toBe(true);
    expect(upgradesManager.canUpgradeItem).toHaveBeenCalledWith("test", "name");

    callUpgradeBinding("effect_repair_item", ["test", 1]);
    expect(upgradesManager.getRepairItemPayment).toHaveBeenCalledWith("test", 1);

    callUpgradeBinding("effect_functor_a", ["test", "test-2", true]);
    expect(upgradesManager.useEffectFunctorA).toHaveBeenCalledWith("test", "test-2", true);

    expect(callUpgradeBinding("prereq_functor_a", ["test", "test-2"])).toBe("test-1");
    expect(upgradesManager.getPreRequirementsFunctorA).toHaveBeenCalledWith("test", "test-2");

    expect(callUpgradeBinding("precondition_functor_a", ["test", "test-2"])).toBe(1);
    expect(upgradesManager.getPreRequirementsFunctorA).toHaveBeenCalledWith("test", "test-2");

    expect(callUpgradeBinding("property_functor_a", ["test", "test-2"])).toBe("a");
    expect(upgradesManager.getPreRequirementsFunctorA).toHaveBeenCalledWith("test", "test-2");

    expect(callUpgradeBinding("property_functor_b", ["test", "test-2"])).toBe("b");
    expect(upgradesManager.getPreRequirementsFunctorA).toHaveBeenCalledWith("test", "test-2");

    expect(callUpgradeBinding("property_functor_c", ["test", "test-2"])).toBe("c");
    expect(upgradesManager.getPreRequirementsFunctorA).toHaveBeenCalledWith("test", "test-2");

    expect(callUpgradeBinding("question_repair_item", ["test", 1, true, "test"])).toBe("test_label");
    expect(getRepairItemAskReplicLabel).toHaveBeenCalledWith("test", 1, true, "test");
  });

  it("actor_menu callbacks", () => {
    const actorInventoryMenuManager: ActorInventoryMenuManager = ActorInventoryMenuManager.getInstance();

    jest.spyOn(actorInventoryMenuManager, "setActiveMode").mockImplementation(jest.fn());

    callBinding("actor_menu_mode", [EActorMenuMode.TALK_DIALOG], (_G as AnyObject)["actor_menu"]);
    expect(actorInventoryMenuManager.setActiveMode).toHaveBeenCalledWith(EActorMenuMode.TALK_DIALOG);
  });

  it("actor_menu_inventory callbacks", () => {
    const actorInventoryMenuManager: ActorInventoryMenuManager = ActorInventoryMenuManager.getInstance();

    jest.spyOn(actorInventoryMenuManager, "onItemDropped").mockImplementation(jest.fn());

    const from: GameObject = mockGameObject();
    const to: GameObject = mockGameObject();
    const oldList: EActorMenuType = EActorMenuType.ACTOR_BELT;
    const newList: EActorMenuType = EActorMenuType.ACTOR_BAG;

    callBinding("CUIActorMenu_OnItemDropped", [from, to, oldList, newList], (_G as AnyObject)["actor_menu_inventory"]);
    expect(actorInventoryMenuManager.onItemDropped).toHaveBeenCalledWith(from, to, oldList, newList);
  });

  it("pda callbacks", () => {
    const pdaManager: PdaManager = PdaManager.getInstance();

    jest.spyOn(pdaManager, "fillFactionState").mockImplementation(jest.fn());
    jest.spyOn(pdaManager, "getMonsterBackground").mockImplementation(jest.fn(() => "test-bg"));
    jest.spyOn(pdaManager, "getMonsterIcon").mockImplementation(jest.fn(() => "test-icon"));
    jest.spyOn(pdaManager, "getFavoriteWeapon").mockImplementation(jest.fn(() => "test-wpn"));
    jest.spyOn(pdaManager, "getStat").mockImplementation(jest.fn(() => "test-stat"));

    const callPdaBinding = (name: TName, args: AnyArgs = []) => callBinding(name, args, (_G as AnyObject)["pda"]);

    expect(() => callPdaBinding("set_active_subdialog", [])).not.toThrow();

    expect(callPdaBinding("get_max_resource", [])).toBe(10);

    expect(callPdaBinding("get_max_power", [])).toBe(10);

    expect(callPdaBinding("get_max_member_count", [])).toBe(10);

    expect(() => callPdaBinding("actor_menu_mode", [])).not.toThrow();

    expect(() => callPdaBinding("property_box_clicked", [])).not.toThrow();

    expect(() => callPdaBinding("property_box_add_properties", [])).not.toThrow();

    callPdaBinding("fill_fraction_state", [123]);
    expect(pdaManager.fillFactionState).toHaveBeenCalledWith(123);

    expect(callPdaBinding("get_monster_back", [])).toBe("test-bg");
    expect(pdaManager.getMonsterBackground).toHaveBeenCalled();

    expect(callPdaBinding("get_monster_icon", [])).toBe("test-icon");
    expect(pdaManager.getMonsterIcon).toHaveBeenCalled();

    expect(callPdaBinding("get_favorite_weapon", [])).toBe("test-wpn");
    expect(pdaManager.getFavoriteWeapon).toHaveBeenCalled();

    expect(callPdaBinding("get_stat", [3])).toBe("test-stat");
    expect(pdaManager.getStat).toHaveBeenCalledWith(3);
  });
  it("ui_wpn_params callbacks", () => {
    jest.spyOn(WeaponParams, "getWeaponRPM").mockImplementation(jest.fn(() => 1));
    jest.spyOn(WeaponParams, "getWeaponDamage").mockImplementation(jest.fn(() => 2));
    jest.spyOn(WeaponParams, "getWeaponDamageMultiplayer").mockImplementation(jest.fn(() => 3));
    jest.spyOn(WeaponParams, "getWeaponHandling").mockImplementation(jest.fn(() => 4));
    jest.spyOn(WeaponParams, "getWeaponAccuracy").mockImplementation(jest.fn(() => 5));

    const callWeaponBinding = (name: TName, args: AnyArgs = []) =>
      callBinding(name, args, (_G as AnyObject)["ui_wpn_params"]);

    expect(callWeaponBinding("GetRPM", ["a", "b"])).toBe(1);
    expect(WeaponParams.getWeaponRPM).toHaveBeenCalledWith("a", "b");

    expect(callWeaponBinding("GetDamage", ["a", "b"])).toBe(2);
    expect(WeaponParams.getWeaponDamage).toHaveBeenCalledWith("a", "b");

    expect(callWeaponBinding("GetDamageMP", ["a", "b"])).toBe(3);
    expect(WeaponParams.getWeaponDamageMultiplayer).toHaveBeenCalledWith("a", "b");

    expect(callWeaponBinding("GetHandling", ["a", "b"])).toBe(4);
    expect(WeaponParams.getWeaponHandling).toHaveBeenCalledWith("a", "b");

    expect(callWeaponBinding("GetAccuracy", ["a", "b"])).toBe(5);
    expect(WeaponParams.getWeaponAccuracy).toHaveBeenCalledWith("a", "b");
  });
});
