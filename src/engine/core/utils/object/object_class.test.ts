import { describe, expect, it } from "@jest/globals";

import {
  isArtefact,
  isGrenade,
  isMonster,
  isStalker,
  isStrappableWeapon,
  isWeapon,
} from "@/engine/core/utils/object/object_class";
import { classIds } from "@/engine/lib/constants/class_ids";
import { TClassId, TSection } from "@/engine/lib/types";
import { mockClientGameObject, mockServerAlifeObject } from "@/fixtures/xray";

describe("'object_class' utils", () => {
  const mockSectionClientObject = (section: TSection) => {
    return mockClientGameObject({ section: <T>() => section as T });
  };
  const mockClassIdClientObject = (classId: number) => {
    return mockClientGameObject({ clsid: () => classId as TClassId });
  };
  const mockClassIdServerObject = (classId: number) => {
    return mockServerAlifeObject({ clsid: () => classId as TClassId });
  };

  it("'isArtefact' should correctly check if object is an artefact", () => {
    expect(isArtefact(mockClassIdClientObject(classIds.artefact))).toBe(true);
    expect(isArtefact(mockClassIdClientObject(classIds.artefact_s))).toBe(true);
    expect(isArtefact(mockClassIdClientObject(classIds.art_black_drops))).toBe(true);
    expect(isArtefact(mockClassIdServerObject(classIds.artefact))).toBe(true);
    expect(isArtefact(mockClassIdServerObject(classIds.artefact_s))).toBe(true);
    expect(isArtefact(mockClassIdServerObject(classIds.art_black_drops))).toBe(true);

    expect(isArtefact(mockClassIdClientObject(classIds.script_stalker))).toBe(false);
    expect(isArtefact(mockClassIdServerObject(classIds.zone_mbald_s))).toBe(false);
  });

  it("'isGrenade' should correctly check if object is a grenade", () => {
    expect(isGrenade(mockClassIdClientObject(classIds.wpn_grenade_f1_s))).toBe(true);
    expect(isGrenade(mockClassIdClientObject(classIds.wpn_grenade_rgd5_s))).toBe(true);
    expect(isGrenade(mockClassIdServerObject(classIds.wpn_grenade_f1_s))).toBe(true);
    expect(isGrenade(mockClassIdServerObject(classIds.wpn_grenade_rgd5_s))).toBe(true);

    expect(isGrenade(mockClassIdClientObject(classIds.script_stalker))).toBe(false);
    expect(isGrenade(mockClassIdServerObject(classIds.wpn_ak74_s))).toBe(false);
  });

  it("'isMonster' should correctly check if object is a monster", () => {
    expect(isMonster(mockClassIdClientObject(classIds.boar_s))).toBe(true);
    expect(isMonster(mockClassIdServerObject(classIds.boar_s))).toBe(true);
    expect(isMonster(mockClassIdClientObject(classIds.dog_s))).toBe(true);
    expect(isMonster(mockClassIdServerObject(classIds.dog_s))).toBe(true);

    expect(isMonster(mockClassIdClientObject(classIds.zone_mbald_s))).toBe(false);
    expect(isMonster(mockClassIdServerObject(classIds.wpn_ak74_s))).toBe(false);
    expect(isMonster(mockClassIdServerObject(classIds.script_actor))).toBe(false);
    expect(isMonster(mockClassIdServerObject(classIds.script_stalker))).toBe(false);
  });

  it("'isStalker' should correctly check if object is a stalker", () => {
    expect(isStalker(mockClassIdClientObject(classIds.script_actor))).toBe(true);
    expect(isStalker(mockClassIdClientObject(classIds.script_stalker))).toBe(true);
    expect(isStalker(mockClassIdServerObject(classIds.script_actor))).toBe(true);
    expect(isStalker(mockClassIdServerObject(classIds.script_stalker))).toBe(true);

    expect(isStalker(mockClassIdClientObject(classIds.zone_mbald_s))).toBe(false);
    expect(isStalker(mockClassIdServerObject(classIds.wpn_ak74_s))).toBe(false);
    expect(isStalker(mockClassIdServerObject(classIds.boar_s))).toBe(false);
  });

  it("'isStrappableWeapon' should correctly check if object can be strapped", () => {
    expect(isStrappableWeapon(mockSectionClientObject("wpn_ak74"))).toBe(true);
    expect(isStrappableWeapon(mockSectionClientObject("wpn_svu"))).toBe(true);
    expect(isStrappableWeapon(mockSectionClientObject("wpn_another"))).toBe(false);
    expect(isStrappableWeapon(mockSectionClientObject("grenade_f1"))).toBe(false);
    expect(isStrappableWeapon(null)).toBe(false);
  });

  it("'isWeapon' utils should correctly check object class ids", () => {
    expect(isWeapon(null)).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(1))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_ammo))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_ammo_s))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_ammo_vog25))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_binocular))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_binocular_s))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(classIds.zone_mbald_s))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(classIds.artefact_s))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(classIds.script_stalker))).toBeFalsy();

    expect(isWeapon(mockClassIdClientObject(classIds.wpn_knife))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_knife_s))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_silencer))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_silencer_s))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_ak74))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_grenade_rgd5))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_shotgun_s))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_shotgun))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_walther))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(classIds.wpn_walther))).toBeTruthy();
  });
});
