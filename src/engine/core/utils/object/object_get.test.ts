import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import { getObjectActiveWeaponSlot } from "@/engine/core/utils/object/object_get";
import { ClientObject } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockClientGameObject } from "@/fixtures/xray";

describe("object get utils", () => {
  beforeEach(() => registerSimulator());

  it("getObjectActiveWeaponSlot should correctly get slot", () => {
    const object: ClientObject = mockClientGameObject();

    replaceFunctionMock(object.active_item, () => null);
    replaceFunctionMock(object.weapon_strapped, () => true);
    expect(getObjectActiveWeaponSlot(object)).toBe(0);

    replaceFunctionMock(object.active_item, () => mockClientGameObject({ animation_slot: () => 4 }));
    expect(getObjectActiveWeaponSlot(object)).toBe(0);

    replaceFunctionMock(object.weapon_strapped, () => false);
    expect(getObjectActiveWeaponSlot(object)).toBe(4);

    replaceFunctionMock(object.active_item, () => mockClientGameObject({ animation_slot: () => 3 }));
    expect(getObjectActiveWeaponSlot(object)).toBe(3);
  });
});
