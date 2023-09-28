import { describe, expect, it } from "@jest/globals";

import { getObjectActiveWeaponSlot, isObjectStrappingWeapon } from "@/engine/core/utils/weapon";
import { ClientObject } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockClientGameObject } from "@/fixtures/xray";

describe("object_weapon utils", () => {
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

  it("isObjectStrappingWeapon should correctly check weapon strap state", () => {
    const object: ClientObject = mockClientGameObject();

    replaceFunctionMock(object.weapon_strapped, () => true);
    replaceFunctionMock(object.weapon_unstrapped, () => false);
    expect(isObjectStrappingWeapon(object)).toBe(false);

    replaceFunctionMock(object.weapon_strapped, () => false);
    replaceFunctionMock(object.weapon_unstrapped, () => true);
    expect(isObjectStrappingWeapon(object)).toBe(false);

    replaceFunctionMock(object.weapon_strapped, () => true);
    replaceFunctionMock(object.weapon_unstrapped, () => true);
    expect(isObjectStrappingWeapon(object)).toBe(false);

    replaceFunctionMock(object.weapon_strapped, () => false);
    replaceFunctionMock(object.weapon_unstrapped, () => false);
    expect(isObjectStrappingWeapon(object)).toBe(true);
  });

  it.todo("isObjectWeaponLocked should correctly check weapon locked state");

  it.todo("setObjectBestWeapon should correctly set best weapon for object");

  it.todo("getWeaponStateForAnimationState should correctly get weapon state for animation");

  it.todo("getObjectWeaponForAnimationState should correctly get weapon for animation");
});
