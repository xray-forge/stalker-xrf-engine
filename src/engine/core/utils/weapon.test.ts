import { describe, expect, it, jest } from "@jest/globals";

import { getObjectActiveWeaponSlot, isObjectStrappingWeapon } from "@/engine/core/utils/weapon";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("getObjectActiveWeaponSlot util", () => {
  it("should correctly get slot", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "active_item").mockImplementation(() => null);
    jest.spyOn(object, "weapon_strapped").mockImplementation(() => true);
    expect(getObjectActiveWeaponSlot(object)).toBe(0);

    const fourthSlotItem: GameObject = MockGameObject.mock();

    jest.spyOn(fourthSlotItem, "animation_slot").mockImplementation(() => 4);

    jest.spyOn(object, "active_item").mockImplementation(() => fourthSlotItem);
    expect(getObjectActiveWeaponSlot(object)).toBe(0);

    jest.spyOn(object, "weapon_strapped").mockImplementation(() => false);
    expect(getObjectActiveWeaponSlot(object)).toBe(4);

    const thirdSlotItem: GameObject = MockGameObject.mock();

    jest.spyOn(thirdSlotItem, "animation_slot").mockImplementation(() => 3);

    jest.spyOn(object, "active_item").mockImplementation(() => thirdSlotItem);
    expect(getObjectActiveWeaponSlot(object)).toBe(3);
  });
});

describe("isObjectStrappingWeapon util", () => {
  it("should correctly check weapon strap state", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "weapon_strapped").mockImplementation(() => true);
    jest.spyOn(object, "weapon_unstrapped").mockImplementation(() => false);
    expect(isObjectStrappingWeapon(object)).toBe(false);

    jest.spyOn(object, "weapon_strapped").mockImplementation(() => false);
    jest.spyOn(object, "weapon_unstrapped").mockImplementation(() => true);
    expect(isObjectStrappingWeapon(object)).toBe(false);

    jest.spyOn(object, "weapon_strapped").mockImplementation(() => true);
    jest.spyOn(object, "weapon_unstrapped").mockImplementation(() => true);
    expect(isObjectStrappingWeapon(object)).toBe(false);

    jest.spyOn(object, "weapon_strapped").mockImplementation(() => false);
    jest.spyOn(object, "weapon_unstrapped").mockImplementation(() => false);
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
