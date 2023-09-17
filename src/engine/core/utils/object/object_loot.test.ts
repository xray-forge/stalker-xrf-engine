import { describe, expect, it } from "@jest/globals";

import { transferLoot } from "@/engine/core/utils/object/object_loot";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { ClientObject, LuaArray } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("object_loot utils", () => {
  it("'transferLoot' should correctly transfer lootable items", () => {
    const ak74: ClientObject = mockClientGameObject({ sectionOverride: weapons.wpn_ak74u });
    const akAmmo: ClientObject = mockClientGameObject({ sectionOverride: ammo["ammo_5.45x39_ap"] });
    const questItem: ClientObject = mockClientGameObject({ sectionOverride: "secret_quest_container" });
    const from: ClientObject = mockClientGameObject({
      inventory: [
        [ak74.section(), ak74],
        [akAmmo.section(), akAmmo],
        [questItem.section(), questItem],
      ],
    });
    const to: ClientObject = mockClientGameObject();

    const transferred: LuaArray<ClientObject> = transferLoot(from, to);

    expect(transferred).toEqualLuaArrays([ak74, akAmmo]);
    expect(from.object(ak74.section())).toBeNull();
    expect(to.object(ak74.section())).toBe(ak74);
    expect(from.object(akAmmo.section())).toBeNull();
    expect(to.object(akAmmo.section())).toBe(akAmmo);
    expect(from.object(questItem.section())).toBe(questItem);
    expect(to.object(questItem.section())).toBeNull();
  });
});
