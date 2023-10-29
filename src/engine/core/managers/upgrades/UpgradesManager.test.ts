import { beforeEach, describe, expect, it } from "@jest/globals";

import { STALKER_UPGRADE_INFO, upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { UpgradesManager } from "@/engine/core/managers/upgrades/UpgradesManager";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaArray, TLabel } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

describe("UpgradesManager class", () => {
  beforeEach(() => {
    resetRegistry();

    upgradesConfig.ITEM_REPAIR_PRICE_COEFFICIENT = 0.6;
  });

  it("should correctly set hints", () => {
    const hints: LuaArray<TLabel> = $fromArray(["a", "b"]);
    const manager: UpgradesManager = UpgradesManager.getInstance();

    expect(manager.upgradeHints).toBeNull();

    manager.setCurrentHints(hints);
    expect(manager.upgradeHints).toBe(hints);
  });

  it("should correctly setup discounts", () => {
    mockRegisteredActor();

    const manager: UpgradesManager = UpgradesManager.getInstance();

    manager.currentMechanicName = "";
    expect(() => manager.setupDiscounts()).not.toThrow();

    manager.currentMechanicName = "test_mechanic_name";
    STALKER_UPGRADE_INFO.w_string(
      manager.currentMechanicName,
      "discount_condlist",
      "{+some_info} true %+another_info%"
    );

    manager.setupDiscounts();
    expect(hasInfoPortion("another_info")).toBe(false);

    giveInfoPortion("some_info");

    manager.setupDiscounts();
    expect(hasInfoPortion("another_info")).toBe(true);
  });

  it("should correctly get repair prices", () => {
    const manager: UpgradesManager = UpgradesManager.getInstance();

    upgradesConfig.ITEM_REPAIR_PRICE_COEFFICIENT = 0.6;

    expect(manager.getRepairPrice("wpn_ak74u", 1)).toBe(0);
    expect(manager.getRepairPrice("wpn_ak74u", 0.75)).toBe(600);
    expect(manager.getRepairPrice("wpn_abakan", 0.5)).toBe(1500);
    expect(manager.getRepairPrice("wpn_abakan", 0)).toBe(3000);

    manager.currentPriceDiscountRate = 0.5;

    expect(manager.getRepairPrice("wpn_ak74u", 1)).toBe(0);
    expect(manager.getRepairPrice("wpn_ak74u", 0.75)).toBe(300);
    expect(manager.getRepairPrice("wpn_abakan", 0.5)).toBe(750);
    expect(manager.getRepairPrice("wpn_abakan", 0)).toBe(1500);

    upgradesConfig.ITEM_REPAIR_PRICE_COEFFICIENT = 1.5;

    expect(manager.getRepairPrice("wpn_ak74u", 1)).toBe(0);
    expect(manager.getRepairPrice("wpn_ak74u", 0.75)).toBe(750);
    expect(manager.getRepairPrice("wpn_abakan", 0.5)).toBe(1875);
    expect(manager.getRepairPrice("wpn_abakan", 0)).toBe(3750);
  });

  it("should correctly get repair payment", () => {
    const { actorGameObject } = mockRegisteredActor();
    const manager: UpgradesManager = UpgradesManager.getInstance();

    upgradesConfig.ITEM_REPAIR_PRICE_COEFFICIENT = 0.6;
    manager.currentPriceDiscountRate = 0.5;

    manager.getRepairItemPayment("wpn_ak74u", 0.75);
    expect(actorGameObject.give_money).toHaveBeenCalledWith(-300);

    manager.getRepairItemPayment("wpn_abakan", 0.5);
    expect(actorGameObject.give_money).toHaveBeenCalledWith(-750);
  });

  it("should correctly get upgrade cost", () => {
    const manager: UpgradesManager = UpgradesManager.getInstance();

    manager.currentPriceDiscountRate = 0.5;

    expect(manager.getUpgradeCost("up_sect_firsta_ak74u")).toBe(" ");
    expect(manager.getUpgradeCost("up_sect_firstc_ak74u")).toBe(" ");
    expect(manager.getUpgradeCost("up_sect_firste_ak74u")).toBe(" ");

    mockRegisteredActor();

    expect(manager.getUpgradeCost("up_sect_firsta_ak74u")).toBe("translated_st_upgr_cost: 200");
    expect(manager.getUpgradeCost("up_sect_firstc_ak74u")).toBe("translated_st_upgr_cost: 325");
    expect(manager.getUpgradeCost("up_sect_firste_ak74u")).toBe("translated_st_upgr_cost: 450");
  });

  it.todo("should correctly get possibilities label");

  it.todo("should correctly check if item can be upgraded");

  it.todo("should correctly set price discounts");

  it.todo("should correctly check if able to repair item");

  it.todo("should correctly generate ask repair replics");

  it.todo("should correctly get pre-condition functor A");

  it.todo("should correctly get pre-requirement functor A");

  it.todo("should correctly handle effect A");

  it.todo("should correctly get property functor A");

  it.todo("should correctly get property functor B");

  it.todo("should correctly get property functor C");

  it.todo("should correctly issue properties");
});
