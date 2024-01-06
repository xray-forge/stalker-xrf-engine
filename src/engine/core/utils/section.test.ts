import { describe, expect, it } from "@jest/globals";

import {
  isAmmoSection,
  isExcludedFromLootDropItemSection,
  isLootableItemSection,
  isSquadMonsterCommunity,
} from "@/engine/core/utils/section";

describe("isAmmoSection util", () => {
  it("should correctly check ammo section", () => {
    expect(isAmmoSection("another-section")).toBe(false);
    expect(isAmmoSection("ammo_not_existing")).toBe(false);
    expect(isAmmoSection("ammo_11.43x23_fmj")).toBe(true);
    expect(isAmmoSection("ammo_9x19_fmj")).toBe(true);
    expect(isAmmoSection("ammo_5.56x45_ap")).toBe(true);
    expect(isAmmoSection("ammo_gauss")).toBe(true);
  });
});

describe("isSquadMonsterCommunity util", () => {
  it("should correctly check if community matches squad monsters", () => {
    expect(isSquadMonsterCommunity("monster_predatory_day")).toBe(true);
    expect(isSquadMonsterCommunity("monster_predatory_night")).toBe(true);
    expect(isSquadMonsterCommunity("monster_special")).toBe(true);
    expect(isSquadMonsterCommunity("monster")).toBe(true);
    expect(isSquadMonsterCommunity("monster_zombied_day")).toBe(true);
    expect(isSquadMonsterCommunity("monster_zombied_night")).toBe(true);
    expect(isSquadMonsterCommunity("monster_zombied_night")).toBe(true);

    expect(isSquadMonsterCommunity("stalker")).toBe(false);
    expect(isSquadMonsterCommunity("army")).toBe(false);
    expect(isSquadMonsterCommunity("monolith")).toBe(false);
    expect(isSquadMonsterCommunity("actor")).toBe(false);
  });
});

describe("isLootableItemSection util", () => {
  it("should correctly check objects that are lootable", () => {
    expect(isLootableItemSection("")).toBe(false);
    expect(isLootableItemSection("wpn_ak74")).toBe(true);
    expect(isLootableItemSection("grenade_f1")).toBe(true);
    expect(isLootableItemSection("medkit")).toBe(true);
    expect(isLootableItemSection("medkit_army")).toBe(true);

    expect(isLootableItemSection("device_pda")).toBe(false);
    expect(isLootableItemSection("guitar_a")).toBe(false);
    expect(isLootableItemSection("device_torch")).toBe(false);
  });
});

describe("isExcludedFromLootDropItemSection util", () => {
  it("should correctly check objects that are not lootable", () => {
    expect(isExcludedFromLootDropItemSection("")).toBe(false);
    expect(isExcludedFromLootDropItemSection("wpn_ak74")).toBe(false);
    expect(isExcludedFromLootDropItemSection("grenade_f1")).toBe(false);
    expect(isExcludedFromLootDropItemSection("device_pda")).toBe(true);
    expect(isExcludedFromLootDropItemSection("guitar_a")).toBe(true);
    expect(isExcludedFromLootDropItemSection("device_torch")).toBe(true);
    expect(isExcludedFromLootDropItemSection("wpn_binoc")).toBe(true);
  });
});
