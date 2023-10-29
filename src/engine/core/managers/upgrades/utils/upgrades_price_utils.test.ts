import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import {
  canRepairItem,
  getRepairPrice,
  getUpgradeCost,
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
});
