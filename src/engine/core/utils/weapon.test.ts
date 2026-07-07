import { describe, expect, it, jest } from "@jest/globals";
import { clsid, object as xrayObject } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EStalkerState } from "@/engine/core/animation/types";
import {
  getObjectActiveWeaponSlot,
  getObjectWeaponForAnimationState,
  getWeaponActionForAnimationState,
  isObjectStrappingWeapon,
  isObjectWeaponLocked,
  setObjectBestWeapon,
} from "@/engine/core/utils/weapon";

describe("getObjectActiveWeaponSlot", () => {
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

describe("isObjectStrappingWeapon", () => {
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

describe("isObjectWeaponLocked", () => {
  it("should correctly check weapon locked state", () => {
    const object: GameObject = MockGameObject.mock();
    const weapon: GameObject = MockGameObject.mockWithClassId(clsid.wpn_ak74);

    jest.spyOn(object, "best_weapon").mockImplementation(() => null);
    expect(isObjectWeaponLocked(object)).toBe(false);

    jest.spyOn(object, "best_weapon").mockImplementation(() => weapon);
    jest.spyOn(object, "weapon_strapped").mockImplementation(() => true);
    jest.spyOn(object, "weapon_unstrapped").mockImplementation(() => false);
    jest.spyOn(object, "is_weapon_going_to_be_strapped").mockImplementation(() => false);
    expect(isObjectWeaponLocked(object)).toBe(false);

    jest.spyOn(object, "weapon_strapped").mockImplementation(() => false);
    jest.spyOn(object, "weapon_unstrapped").mockImplementation(() => false);
    expect(isObjectWeaponLocked(object)).toBe(true);

    jest.spyOn(object, "weapon_strapped").mockImplementation(() => false);
    jest.spyOn(object, "weapon_unstrapped").mockImplementation(() => true);
    jest.spyOn(object, "is_weapon_going_to_be_strapped").mockImplementation(() => true);
    expect(isObjectWeaponLocked(object)).toBe(true);
    expect(object.is_weapon_going_to_be_strapped).toHaveBeenCalledWith(weapon);

    jest.spyOn(object, "weapon_strapped").mockImplementation(() => true);
    jest.spyOn(object, "weapon_unstrapped").mockImplementation(() => false);
    expect(isObjectWeaponLocked(object)).toBe(false);
  });
});

describe("setObjectBestWeapon", () => {
  it("should correctly set best weapon for object", () => {
    const object: GameObject = MockGameObject.mock();
    const weapon: GameObject = MockGameObject.mockWithClassId(clsid.wpn_ak74);
    const item: GameObject = MockGameObject.mockWithClassId(clsid.artefact);

    jest.spyOn(object, "best_weapon").mockImplementation(() => null);
    setObjectBestWeapon(object);
    expect(object.set_item).not.toHaveBeenCalled();

    jest.spyOn(object, "best_weapon").mockImplementation(() => item);
    setObjectBestWeapon(object);
    expect(object.set_item).not.toHaveBeenCalled();

    jest.spyOn(object, "best_weapon").mockImplementation(() => weapon);
    setObjectBestWeapon(object);
    expect(object.set_item).toHaveBeenCalledWith(xrayObject.idle, weapon);
  });
});

describe("getWeaponStateForAnimationState", () => {
  it("getWeaponStateForAnimationState should correctly get weapon state for animation", () => {
    expect(getWeaponActionForAnimationState(EStalkerState.THREAT)).toBe(xrayObject.aim1);
    expect(getWeaponActionForAnimationState(EStalkerState.IDLE)).toBe(xrayObject.idle);
    expect(getWeaponActionForAnimationState(EStalkerState.RAID)).toBe(xrayObject.idle);
  });
});

describe("getObjectWeaponForAnimationState", () => {
  it("should correctly get weapon for animation", () => {
    const object: GameObject = MockGameObject.mock();
    const bestWeapon: GameObject = MockGameObject.mockWithClassId(clsid.wpn_ak74);
    const slotWeapon: GameObject = MockGameObject.mockWithClassId(clsid.wpn_walther);

    jest.spyOn(object, "best_weapon").mockImplementation(() => bestWeapon);
    jest.spyOn(object, "item_in_slot").mockImplementation((slot) => (slot === 1 ? slotWeapon : null));

    expect(getObjectWeaponForAnimationState(object, EStalkerState.PSY_SHOOT)).toBe(slotWeapon);
    expect(object.item_in_slot).toHaveBeenCalledWith(1);

    expect(getObjectWeaponForAnimationState(object, EStalkerState.IDLE)).toBe(bestWeapon);
    expect(object.item_in_slot).toHaveBeenCalledWith(1);
  });
});
