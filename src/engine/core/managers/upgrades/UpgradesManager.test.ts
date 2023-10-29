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
    upgradesConfig.UPGRADES_HINTS = null;
    upgradesConfig.CURRENT_MECHANIC_NAME = "";
  });

  it("should correctly set hints", () => {
    const hints: LuaArray<TLabel> = $fromArray(["a", "b"]);
    const manager: UpgradesManager = UpgradesManager.getInstance();

    expect(upgradesConfig.UPGRADES_HINTS).toBeNull();

    manager.setCurrentHints(hints);
    expect(upgradesConfig.UPGRADES_HINTS).toBe(hints);
  });

  it("should correctly set discount", () => {
    const manager: UpgradesManager = UpgradesManager.getInstance();

    manager.setCurrentPriceDiscount(0.44);
    expect(upgradesConfig.PRICE_DISCOUNT_RATE).toBe(0.44);

    manager.setCurrentPriceDiscount(1);
    expect(upgradesConfig.PRICE_DISCOUNT_RATE).toBe(1);
  });

  it("should correctly setup discounts", () => {
    mockRegisteredActor();

    const manager: UpgradesManager = UpgradesManager.getInstance();

    upgradesConfig.CURRENT_MECHANIC_NAME = "";
    expect(() => manager.setupDiscounts()).not.toThrow();

    upgradesConfig.CURRENT_MECHANIC_NAME = "test_mechanic_name";
    STALKER_UPGRADE_INFO.w_string(
      upgradesConfig.CURRENT_MECHANIC_NAME,
      "discount_condlist",
      "{+some_info} true %+another_info%"
    );

    manager.setupDiscounts();
    expect(hasInfoPortion("another_info")).toBe(false);

    giveInfoPortion("some_info");

    manager.setupDiscounts();
    expect(hasInfoPortion("another_info")).toBe(true);
  });

  it("should correctly get repair payment", () => {
    const { actorGameObject } = mockRegisteredActor();
    const manager: UpgradesManager = UpgradesManager.getInstance();

    upgradesConfig.ITEM_REPAIR_PRICE_COEFFICIENT = 0.6;
    upgradesConfig.PRICE_DISCOUNT_RATE = 0.5;

    manager.getRepairItemPayment("wpn_ak74u", 0.75);
    expect(actorGameObject.give_money).toHaveBeenCalledWith(-300);

    manager.getRepairItemPayment("wpn_abakan", 0.5);
    expect(actorGameObject.give_money).toHaveBeenCalledWith(-750);
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
