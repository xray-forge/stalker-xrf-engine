import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import {
  getRepairItemAskReplicLabel,
  getUpgradeCostLabel,
  issueUpgradeProperty,
} from "@/engine/core/managers/upgrades/utils/upgrades_label_utils";
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
