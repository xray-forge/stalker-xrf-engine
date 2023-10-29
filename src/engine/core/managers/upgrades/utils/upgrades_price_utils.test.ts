import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import {
  canRepairItem,
  getRepairItemAskReplicLabel,
  getRepairPrice,
  getUpgradeCost,
  getUpgradeCostLabel,
  issueUpgradeProperty,
} from "@/engine/core/managers/upgrades/utils/upgrades_price_utils";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

describe("upgrades_price_utils module", () => {
  beforeEach(() => {
    resetRegistry();

    upgradesConfig.ITEM_REPAIR_PRICE_COEFFICIENT = 0.6;
    upgradesConfig.PRICE_DISCOUNT_RATE = 1;
    upgradesConfig.UPGRADES_HINTS = null;
    upgradesConfig.CURRENT_MECHANIC_NAME = "";
  });

  it("getRepairItemAskReplicLabel should correctly get label", () => {
    const { actorGameObject } = mockRegisteredActor();

    jest.spyOn(actorGameObject, "money").mockImplementation(() => 100_000);

    expect(getRepairItemAskReplicLabel("pri_a17_gauss_rifle", 1, true, "some_name")).toBe(
      "translated_st_gauss_cannot_be_repaired"
    );
    expect(getRepairItemAskReplicLabel("pri_a17_gauss_rifle", 0, true, "some_name")).toBe(
      "translated_st_gauss_cannot_be_repaired"
    );

    expect(getRepairItemAskReplicLabel("wpn_ak74u", 1, true, "some_name")).toBe(
      "translated_st_upgr_cost 0 RU. translated_ui_inv_repair?"
    );
    expect(getRepairItemAskReplicLabel("wpn_abakan", 0.5, true, "some_name")).toBe(
      "translated_st_upgr_cost 1500 RU. translated_ui_inv_repair?"
    );
    expect(getRepairItemAskReplicLabel("wpn_svu", 0, true, "some_name")).toBe(
      "translated_st_upgr_cost 4200 RU. translated_ui_inv_repair?"
    );

    jest.spyOn(actorGameObject, "money").mockImplementation(() => 100);

    expect(getRepairItemAskReplicLabel("wpn_ak74u", 1, true, "some_name")).toBe(
      "translated_st_upgr_cost 0 RU. translated_ui_inv_repair?"
    );
    expect(getRepairItemAskReplicLabel("wpn_abakan", 0.5, true, "some_name")).toBe(
      "translated_st_upgr_cost: 1500 RU\\ntranslated_ui_inv_not_enought_money: 1400 RU"
    );
    expect(getRepairItemAskReplicLabel("wpn_svu", 0, true, "some_name")).toBe(
      "translated_st_upgr_cost: 4200 RU\\ntranslated_ui_inv_not_enought_money: 4100 RU"
    );
  });

  it("canRepairItem should correctly check", () => {
    const { actorGameObject } = mockRegisteredActor();

    jest.spyOn(actorGameObject, "money").mockImplementation(() => 100_000);

    upgradesConfig.ITEM_REPAIR_PRICE_COEFFICIENT = 0.6;
    upgradesConfig.PRICE_DISCOUNT_RATE = 0.5;

    expect(canRepairItem("wpn_ak74u", 1, "some_name")).toBe(true);
    expect(canRepairItem("wpn_ak74u", 0.75, "some_name")).toBe(true);
    expect(canRepairItem("wpn_abakan", 0.5, "some_name")).toBe(true);
    expect(canRepairItem("wpn_abakan", 0, "some_name")).toBe(true);
    expect(canRepairItem("pri_a17_gauss_rifle", 1, "some_name")).toBe(false);
    expect(canRepairItem("pri_a17_gauss_rifle", 0, "some_name")).toBe(false);

    jest.spyOn(actorGameObject, "money").mockImplementation(() => 300);

    expect(canRepairItem("wpn_ak74u", 1, "some_name")).toBe(true);
    expect(canRepairItem("wpn_ak74u", 0.75, "some_name")).toBe(true);
    expect(canRepairItem("wpn_abakan", 0.5, "some_name")).toBe(false);
    expect(canRepairItem("wpn_abakan", 0, "some_name")).toBe(false);
    expect(canRepairItem("pri_a17_gauss_rifle", 1, "some_name")).toBe(false);
    expect(canRepairItem("pri_a17_gauss_rifle", 0, "some_name")).toBe(false);
  });

  it("getRepairPrice should correctly get repair prices", () => {
    upgradesConfig.ITEM_REPAIR_PRICE_COEFFICIENT = 0.6;

    expect(getRepairPrice("wpn_ak74u", 1)).toBe(0);
    expect(getRepairPrice("wpn_ak74u", 0.75)).toBe(600);
    expect(getRepairPrice("wpn_abakan", 0.5)).toBe(1500);
    expect(getRepairPrice("wpn_abakan", 0)).toBe(3000);

    upgradesConfig.PRICE_DISCOUNT_RATE = 0.5;

    expect(getRepairPrice("wpn_ak74u", 1)).toBe(0);
    expect(getRepairPrice("wpn_ak74u", 0.75)).toBe(300);
    expect(getRepairPrice("wpn_abakan", 0.5)).toBe(750);
    expect(getRepairPrice("wpn_abakan", 0)).toBe(1500);

    upgradesConfig.ITEM_REPAIR_PRICE_COEFFICIENT = 1.5;

    expect(getRepairPrice("wpn_ak74u", 1)).toBe(0);
    expect(getRepairPrice("wpn_ak74u", 0.75)).toBe(750);
    expect(getRepairPrice("wpn_abakan", 0.5)).toBe(1875);
    expect(getRepairPrice("wpn_abakan", 0)).toBe(3750);
  });

  it("getUpgradeCost should correctly get upgrade cost", () => {
    upgradesConfig.PRICE_DISCOUNT_RATE = 1;

    expect(getUpgradeCost("up_sect_firsta_ak74u")).toBe(400);
    expect(getUpgradeCost("up_sect_firstc_ak74u")).toBe(650);
    expect(getUpgradeCost("up_sect_firste_ak74u")).toBe(900);

    upgradesConfig.PRICE_DISCOUNT_RATE = 0.5;

    expect(getUpgradeCost("up_sect_firsta_ak74u")).toBe(200);
    expect(getUpgradeCost("up_sect_firstc_ak74u")).toBe(325);
    expect(getUpgradeCost("up_sect_firste_ak74u")).toBe(450);
  });

  it("getUpgradeCostLabel should correctly get upgrade cost", () => {
    upgradesConfig.PRICE_DISCOUNT_RATE = 0.5;

    expect(getUpgradeCostLabel("up_sect_firsta_ak74u")).toBe(" ");
    expect(getUpgradeCostLabel("up_sect_firstc_ak74u")).toBe(" ");
    expect(getUpgradeCostLabel("up_sect_firste_ak74u")).toBe(" ");

    mockRegisteredActor();

    expect(getUpgradeCostLabel("up_sect_firsta_ak74u")).toBe("translated_st_upgr_cost: 200");
    expect(getUpgradeCostLabel("up_sect_firstc_ak74u")).toBe("translated_st_upgr_cost: 325");
    expect(getUpgradeCostLabel("up_sect_firste_ak74u")).toBe("translated_st_upgr_cost: 450");
  });

  it("issueUpgradeProperty should correctly get label", () => {
    expect(issueUpgradeProperty("", "up_firsta_ak74u")).toBe("translated_st_up_zat_a3_name");
    expect(issueUpgradeProperty("up_sect_unknonwn,b", "up_firsta_ak74u")).toBe("translated_st_up_zat_a3_name");
    expect(issueUpgradeProperty("up_sect_firsta_ak74u,b,c", "up_firsta_ak74u")).toBe("translated_st_up_zat_a3_name 1");
    expect(issueUpgradeProperty("up_sect_seconf_ak74u,b,c", "up_firsta_ak74u")).toBe("translated_st_up_zat_a3_name 2");
    expect(issueUpgradeProperty("up_sect_fourte_ak74u,b,c", "up_firsta_ak74u")).toBe("translated_st_up_zat_a3_name 2");
  });
});
