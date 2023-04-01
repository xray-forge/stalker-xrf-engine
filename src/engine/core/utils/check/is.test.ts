import { describe, expect, it } from "@jest/globals";
import { TXR_class_id } from "xray16";

import { isWeapon } from "@/engine/core/utils/check/is";
import { classIds } from "@/engine/lib/constants/class_ids";
import { mockClientGameObject } from "@/fixtures/xray";

describe("'is' utils", () => {
  it("'isWeapon' utils should correctly check object class ids", () => {
    const mockClassIdObject = (classId: number) => {
      return mockClientGameObject({ clsid: () => classId as TXR_class_id });
    };

    expect(isWeapon(null)).toBeFalsy();
    expect(isWeapon(mockClassIdObject(1))).toBeFalsy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_ammo))).toBeFalsy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_ammo_s))).toBeFalsy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_ammo_vog25))).toBeFalsy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_binocular))).toBeFalsy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_binocular_s))).toBeFalsy();

    expect(isWeapon(mockClassIdObject(classIds.wpn_knife))).toBeTruthy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_knife_s))).toBeTruthy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_silencer))).toBeTruthy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_silencer_s))).toBeTruthy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_ak74))).toBeTruthy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_grenade_rgd5))).toBeTruthy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_shotgun_s))).toBeTruthy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_shotgun))).toBeTruthy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_walther))).toBeTruthy();
    expect(isWeapon(mockClassIdObject(classIds.wpn_walther))).toBeTruthy();
  });
});
