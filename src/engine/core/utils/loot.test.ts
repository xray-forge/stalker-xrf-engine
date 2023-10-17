import { describe, expect, it } from "@jest/globals";

import { isObjectWithValuableLoot, transferLoot } from "@/engine/core/utils/loot";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GameObject, LuaArray } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("loot utils", () => {
  it("isObjectWithValuableLoot should correctly check object valuable loot", () => {
    expect(isObjectWithValuableLoot(mockGameObject())).toBe(false);
    expect(
      isObjectWithValuableLoot(
        mockGameObject({
          inventory: [
            ["grenade_f2", mockGameObject({ sectionOverride: "grenade_f2" })],
            ["grenade_f3", mockGameObject({ sectionOverride: "grenade_f3" })],
          ],
        })
      )
    ).toBe(false);
    expect(
      isObjectWithValuableLoot(
        mockGameObject({
          inventory: [
            ["grenade_f2", mockGameObject({ sectionOverride: "grenade_f2" })],
            [weapons.wpn_ak74u, mockGameObject({ sectionOverride: weapons.wpn_ak74u })],
          ],
        })
      )
    ).toBe(true);
    expect(
      isObjectWithValuableLoot(
        mockGameObject({
          inventory: [
            [weapons.wpn_ak74u, mockGameObject({ sectionOverride: weapons.wpn_ak74u })],
            [ammo["ammo_5.45x39_fmj"], mockGameObject({ sectionOverride: ammo["ammo_5.45x39_fmj"] })],
          ],
        })
      )
    ).toBe(true);
  });

  it("transferLoot should correctly transfer lootable items", () => {
    const ak74: GameObject = mockGameObject({ sectionOverride: weapons.wpn_ak74u });
    const akAmmo: GameObject = mockGameObject({ sectionOverride: ammo["ammo_5.45x39_ap"] });
    const questItem: GameObject = mockGameObject({ sectionOverride: "secret_quest_container" });
    const from: GameObject = mockGameObject({
      inventory: [
        [ak74.section(), ak74],
        [akAmmo.section(), akAmmo],
        [questItem.section(), questItem],
      ],
    });
    const to: GameObject = mockGameObject();

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
