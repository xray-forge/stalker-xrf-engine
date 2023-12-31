import { describe, expect, it } from "@jest/globals";

import {
  getAmmoSections,
  getArtefactsSections,
  getBoosterSections,
  getDetectorsSections,
  getHelmetsSections,
  getOutfitSections,
  getSectionsWithoutStoryIDs,
  getSimulationGroupSections,
  getStalkerSections,
  getWeaponAddonsSections,
  getWeaponSections,
} from "@/engine/core/utils/ini/ini_sections";
import { LuaArray, TSection } from "@/engine/lib/types";

describe("getSectionsWithoutStoryIDs util", () => {
  it("should get list of sections without story IDs", () => {
    const all: LuaArray<TSection> = getSimulationGroupSections();

    expect(all).toEqualLuaArrays([
      "test_squad",
      "simulation_stalker",
      "stalker_sim_squad_novice",
      "simulation_bandit",
      "simulation_duty_1",
      "jup_a10_bandit_squad",
    ]);

    expect(getSectionsWithoutStoryIDs(all)).toEqualLuaArrays([
      "test_squad",
      "simulation_stalker",
      "stalker_sim_squad_novice",
      "simulation_bandit",
      "simulation_duty_1",
    ]);
  });
});

describe("getStalkerSections util", () => {
  it("should get list of sections", () => {
    expect(getStalkerSections()).toEqualLuaArrays(["default_duty", "sim_default_monolith_1", "sim_default_freedom_3"]);
  });
});

describe("getSimulationGroupSections util", () => {
  it("should get list of sections", () => {
    expect(getSimulationGroupSections()).toEqualLuaArrays([
      "test_squad",
      "simulation_stalker",
      "stalker_sim_squad_novice",
      "simulation_bandit",
      "simulation_duty_1",
      "jup_a10_bandit_squad",
    ]);
  });
});

describe("getOutfitSections util", () => {
  it("should get list of sections", () => {
    expect(getOutfitSections()).toEqualLuaArrays(["specops_outfit", "svoboda_heavy_outfit", "cs_heavy_outfit"]);
  });
});

describe("getArtefactsSections util", () => {
  it("should get list of sections", () => {
    expect(getArtefactsSections()).toEqualLuaArrays([
      "af_electra_sparkler",
      "af_electra_flash",
      "af_electra_moonlight",
      "af_dummy_battery",
      "af_dummy_dummy",
    ]);
  });
});

describe("getDetectorsSections util", () => {
  it("should get list of sections", () => {
    expect(getDetectorsSections()).toEqualLuaArrays([
      "detector_simple",
      "detector_advanced",
      "detector_elite",
      "detector_scientific",
    ]);
  });
});

describe("getAmmoSections util", () => {
  it("should get list of sections", () => {
    expect(getAmmoSections()).toEqualLuaArrays([
      "ammo_9x18_pmm",
      "ammo_5.45x39_ap",
      "ammo_9x39_ap",
      "ammo_5.56x45_ap",
      "ammo_12x76_zhekan",
      "ammo_m209",
      "ammo_og-7b",
    ]);
  });
});

describe("getHelmetsSections util", () => {
  it("should get list of sections", () => {
    expect(getHelmetsSections()).toEqualLuaArrays(["helm_respirator", "helm_hardhat", "helm_protective"]);
  });
});

describe("getWeaponSections util", () => {
  it("should get list of sections", () => {
    expect(getWeaponSections()).toEqualLuaArrays([
      "pri_a17_gauss_rifle",
      "wpn_ak74",
      "wpn_ak74u",
      "wpn_svu",
      "wpn_abakan",
      "grenade_f1",
    ]);
  });
});

describe("getWeaponAddonsSections util", () => {
  it("should get list of sections", () => {
    expect(getWeaponAddonsSections()).toEqualLuaArrays(["wpn_addon_scope"]);
  });
});

describe("getBoosterSections util", () => {
  it("should get list of sections", () => {
    expect(getBoosterSections()).toEqualLuaArrays(["bread", "bandage", "kolbasa", "conserva"]);
  });
});
