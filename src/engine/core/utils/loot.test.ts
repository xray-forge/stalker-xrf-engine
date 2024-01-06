import { describe, expect, it } from "@jest/globals";

import { isObjectWithValuableLoot, transferLoot } from "@/engine/core/utils/loot";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GameObject, LuaArray } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("isObjectWithValuableLoot util", () => {
  it("should correctly check object valuable loot", () => {
    expect(isObjectWithValuableLoot(MockGameObject.mock())).toBe(false);
    expect(
      isObjectWithValuableLoot(
        MockGameObject.mock({
          inventory: [
            ["grenade_f2", MockGameObject.mock({ sectionOverride: "grenade_f2" })],
            ["grenade_f3", MockGameObject.mock({ sectionOverride: "grenade_f3" })],
          ],
        })
      )
    ).toBe(false);
    expect(
      isObjectWithValuableLoot(
        MockGameObject.mock({
          inventory: [
            ["grenade_f2", MockGameObject.mock({ sectionOverride: "grenade_f2" })],
            [weapons.wpn_ak74u, MockGameObject.mock({ sectionOverride: weapons.wpn_ak74u })],
          ],
        })
      )
    ).toBe(true);
    expect(
      isObjectWithValuableLoot(
        MockGameObject.mock({
          inventory: [
            [weapons.wpn_ak74u, MockGameObject.mock({ sectionOverride: weapons.wpn_ak74u })],
            [ammo["ammo_5.45x39_fmj"], MockGameObject.mock({ sectionOverride: ammo["ammo_5.45x39_fmj"] })],
          ],
        })
      )
    ).toBe(true);
  });
});

describe("transferLoot util", () => {
  it("should correctly transfer lootable items", () => {
    const ak74: GameObject = MockGameObject.mock({ sectionOverride: weapons.wpn_ak74u });
    const akAmmo: GameObject = MockGameObject.mock({ sectionOverride: ammo["ammo_5.45x39_ap"] });
    const questItem: GameObject = MockGameObject.mock({ sectionOverride: "secret_quest_container" });
    const from: GameObject = MockGameObject.mock({
      inventory: [
        [ak74.section(), ak74],
        [akAmmo.section(), akAmmo],
        [questItem.section(), questItem],
      ],
    });
    const to: GameObject = MockGameObject.mock();

    const transferred: LuaArray<GameObject> = transferLoot(from, to);

    expect(transferred).toEqualLuaArrays([ak74, akAmmo]);
    expect(from.object(ak74.section())).toBeNull();
    expect(to.object(ak74.section())).toBe(ak74);
    expect(from.object(akAmmo.section())).toBeNull();
    expect(to.object(akAmmo.section())).toBe(akAmmo);
    expect(from.object(questItem.section())).toBe(questItem);
    expect(to.object(questItem.section())).toBeNull();
  });
});

describe("getNearestCorpseToLoot util", () => {
  it.todo("should get nearest corpses for looting");
});
