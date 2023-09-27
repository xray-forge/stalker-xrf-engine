import { describe, expect, it } from "@jest/globals";

import {
  getAmmoSections,
  getArtefactsSections,
  getHelmetsSections,
  getOutfitSections,
  getSimulationGroupSections,
  getStalkerSections,
  getWeaponSections,
} from "@/engine/core/utils/ini/ini_sections";

describe("ini_sections utils for ini file", () => {
  it("getStalkerSections utils should correctly get list of sections", () => {
    expect(getStalkerSections()).toEqualLuaArrays(["sim_default_first", "sim_default_second"]);
  });

  it("getSimulationGroupSections utils should correctly get list of sections", () => {
    expect(getSimulationGroupSections()).toEqualLuaArrays(["simulation_first", "first_sim_squad_example"]);
  });

  it("getOutfitSections utils should correctly get list of sections", () => {
    expect(getOutfitSections()).toEqualLuaArrays(["first_outfit", "second_outfit"]);
  });

  it("getArtefactsSections utils should correctly get list of sections", () => {
    expect(getArtefactsSections()).toEqualLuaArrays(["af_first", "af_second"]);
  });

  it("getAmmoSections utils should correctly get list of sections", () => {
    expect(getAmmoSections()).toEqualLuaArrays([
      "ammo_9x18_pmm",
      "ammo_5.45x39_ap",
      "ammo_9x39_ap",
      "ammo_5.56x45_ap",
      "ammo_12x76_zhekan",
    ]);
  });

  it("getHelmetsSections utils should correctly get list of sections", () => {
    expect(getHelmetsSections()).toEqualLuaArrays(["helm_first", "helm_second"]);
  });

  it("getWeaponSections utils should correctly get list of sections", () => {
    expect(getWeaponSections()).toEqualLuaArrays([
      "wpn_ak74",
      "wpn_svu",
      "wpn_abakan",
      "wpn_addon_scope",
      "grenade_f1",
    ]);
  });
});
