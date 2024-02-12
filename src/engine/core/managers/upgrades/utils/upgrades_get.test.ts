import { describe, expect, it } from "@jest/globals";

import { SYSTEM_INI } from "@/engine/core/database";
import { readAllObjectUpgrades, readUpgradeGroup } from "@/engine/core/managers/upgrades";
import { TUpgradesList } from "@/engine/core/managers/upgrades/item_upgrades_types";
import { upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { weapons } from "@/engine/lib/constants/items/weapons";

describe("readUpgradeGroup util", () => {
  it("should correctly get all group data", () => {
    const first: TUpgradesList = new LuaTable();

    readUpgradeGroup(SYSTEM_INI, "up_gr_firstab_ak74u", first);

    expect(first).toEqualLuaArrays([
      {
        groupId: "up_gr_firstab_ak74u",
        id: "up_firsta_ak74u",
      },
      {
        groupId: "up_gr_firstcd_ak74u",
        id: "up_firstc_ak74u",
      },
      {
        groupId: "up_gr_firstef_ak74u",
        id: "up_firste_ak74u",
      },
      {
        groupId: "up_gr_firstcd_ak74u",
        id: "up_firstd_ak74u",
      },
      {
        groupId: "up_gr_firstef_ak74u",
        id: "up_firste_ak74u",
      },
    ]);

    const second: TUpgradesList = new LuaTable();

    readUpgradeGroup(SYSTEM_INI, "up_gr_firstcd_ak74u", second);

    expect(second).toEqualLuaArrays([
      {
        groupId: "up_gr_firstcd_ak74u",
        id: "up_firstc_ak74u",
      },
      {
        groupId: "up_gr_firstef_ak74u",
        id: "up_firste_ak74u",
      },
      {
        groupId: "up_gr_firstcd_ak74u",
        id: "up_firstd_ak74u",
      },
      {
        groupId: "up_gr_firstef_ak74u",
        id: "up_firste_ak74u",
      },
    ]);

    const third: TUpgradesList = new LuaTable();

    readUpgradeGroup(SYSTEM_INI, "up_gr_firstef_ak74u", third);

    expect(third).toEqualLuaArrays([
      {
        groupId: "up_gr_firstef_ak74u",
        id: "up_firste_ak74u",
      },
    ]);
  });
});

describe("readAllObjectUpgrades util", () => {
  it("should correctly get all upgrades from ini file", () => {
    expect(readAllObjectUpgrades(SYSTEM_INI, weapons.wpn_ak74)).toEqualLuaTables({});
    expect(readAllObjectUpgrades(SYSTEM_INI, weapons.wpn_svu)).toEqualLuaTables({});

    const ak74uUpgrades: TUpgradesList = readAllObjectUpgrades(SYSTEM_INI, weapons.wpn_ak74u);

    expect(ak74uUpgrades).toEqualLuaArrays([
      {
        groupId: "up_gr_firstab_ak74u",
        id: "up_firsta_ak74u",
      },
      {
        groupId: "up_gr_firstcd_ak74u",
        id: "up_firstc_ak74u",
      },
      {
        groupId: "up_gr_firstef_ak74u",
        id: "up_firste_ak74u",
      },
      {
        groupId: "up_gr_firstcd_ak74u",
        id: "up_firstd_ak74u",
      },
      {
        groupId: "up_gr_firstef_ak74u",
        id: "up_firste_ak74u",
      },
      {
        groupId: "up_gr_seconab_ak74u",
        id: "up_secona_ak74u",
      },
      {
        groupId: "up_gr_seconcd_ak74u",
        id: "up_seconc_ak74u",
      },
      {
        groupId: "up_gr_seconef_ak74u",
        id: "up_secone_ak74u",
      },
      {
        groupId: "up_gr_seconef_ak74u",
        id: "up_seconf_ak74u",
      },
      {
        groupId: "up_gr_thirdab_ak74u",
        id: "up_thirda_ak74u",
      },
      {
        groupId: "up_gr_thirdcd_ak74u",
        id: "up_thirdc_ak74u",
      },
      {
        groupId: "up_gr_thirdef_ak74u",
        id: "up_thirde_ak74u",
      },
      {
        groupId: "up_gr_thirdcd_ak74u",
        id: "up_thirdd_ak74u",
      },
      {
        groupId: "up_gr_thirdef_ak74u",
        id: "up_thirde_ak74u",
      },
      {
        groupId: "up_gr_fourtab_ak74u",
        id: "up_fourta_ak74u",
      },
      {
        groupId: "up_gr_fourtcd_ak74u",
        id: "up_fourtc_ak74u",
      },
      {
        groupId: "up_gr_fourtef_ak74u",
        id: "up_fourte_ak74u",
      },
      {
        groupId: "up_gr_fifthab_ak74u",
        id: "up_fiftha_ak74u",
      },
    ]);

    expect(upgradesConfig.UPGRADES_CACHE.length()).toBe(3);
    expect(upgradesConfig.UPGRADES_CACHE.get("wpn_ak74u")).toBe(ak74uUpgrades);
  });
});
