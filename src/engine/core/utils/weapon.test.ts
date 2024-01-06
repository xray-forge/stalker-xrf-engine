import { describe, expect, it } from "@jest/globals";

import { getObjectActiveWeaponSlot, isObjectStrappingWeapon } from "@/engine/core/utils/weapon";
import { GameObject } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

describe("getObjectActiveWeaponSlot util", () => {
  it("should correctly get slot", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(object.active_item, () => null);
    replaceFunctionMock(object.weapon_strapped, () => true);
    expect(getObjectActiveWeaponSlot(object)).toBe(0);

    replaceFunctionMock(object.active_item, () => MockGameObject.mock({ animation_slot: () => 4 }));
    expect(getObjectActiveWeaponSlot(object)).toBe(0);

    replaceFunctionMock(object.weapon_strapped, () => false);
    expect(getObjectActiveWeaponSlot(object)).toBe(4);

    replaceFunctionMock(object.active_item, () => MockGameObject.mock({ animation_slot: () => 3 }));
    expect(getObjectActiveWeaponSlot(object)).toBe(3);
  });
});

describe("isObjectStrappingWeapon util", () => {
  it("should correctly check weapon strap state", () => {
    const object: GameObject = MockGameObject.mock();

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
});

describe("isObjectWeaponLocked util", () => {
  it.todo("should correctly check weapon locked state");
});

describe("setObjectBestWeapon util", () => {
  it.todo("should correctly set best weapon for object");
});

describe("getWeaponStateForAnimationState util", () => {
  it.todo("getWeaponStateForAnimationState should correctly get weapon state for animation");
});

describe("getObjectWeaponForAnimationState util", () => {
  it.todo("should correctly get weapon for animation");
});
