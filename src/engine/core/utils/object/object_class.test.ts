import { describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import {
  isActor,
  isArtefact,
  isGrenade,
  isMonster,
  isSmartTerrain,
  isSquad,
  isSquadId,
  isStalker,
  isStrappableWeapon,
  isWeapon,
} from "@/engine/core/utils/object/object_class";
import { ServerActorObject, ServerGroupObject, ServerHumanObject, TClassId, TSection } from "@/engine/lib/types";
import {
  mockClientGameObject,
  mockServerAlifeCreatureActor,
  mockServerAlifeHumanStalker,
  mockServerAlifeObject,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray";

describe("object_class utils", () => {
  const mockSectionClientObject = (section: TSection) => {
    return mockClientGameObject({ section: <T>() => section as T });
  };
  const mockClassIdClientObject = (classId: number) => {
    return mockClientGameObject({ clsid: () => classId as TClassId });
  };
  const mockClassIdServerObject = (classId: number) => {
    return mockServerAlifeObject({ clsid: () => classId as TClassId });
  };

  it("isArtefact should correctly check if object is an artefact", () => {
    expect(isArtefact(mockClassIdClientObject(clsid.artefact))).toBe(true);
    expect(isArtefact(mockClassIdClientObject(clsid.artefact_s))).toBe(true);
    expect(isArtefact(mockClassIdClientObject(clsid.art_black_drops))).toBe(true);
    expect(isArtefact(mockClassIdServerObject(clsid.artefact))).toBe(true);
    expect(isArtefact(mockClassIdServerObject(clsid.artefact_s))).toBe(true);
    expect(isArtefact(mockClassIdServerObject(clsid.art_black_drops))).toBe(true);

    expect(isArtefact(mockClassIdClientObject(clsid.script_stalker))).toBe(false);
    expect(isArtefact(mockClassIdServerObject(clsid.zone_mbald_s))).toBe(false);
  });

  it("isGrenade should correctly check if object is a grenade", () => {
    expect(isGrenade(mockClassIdClientObject(clsid.wpn_grenade_f1_s))).toBe(true);
    expect(isGrenade(mockClassIdClientObject(clsid.wpn_grenade_rgd5_s))).toBe(true);
    expect(isGrenade(mockClassIdServerObject(clsid.wpn_grenade_f1_s))).toBe(true);
    expect(isGrenade(mockClassIdServerObject(clsid.wpn_grenade_rgd5_s))).toBe(true);

    expect(isGrenade(mockClassIdClientObject(clsid.script_stalker))).toBe(false);
    expect(isGrenade(mockClassIdServerObject(clsid.wpn_ak74_s))).toBe(false);
  });

  it("isMonster should correctly check if object is a monster", () => {
    expect(isMonster(mockClassIdClientObject(clsid.boar_s))).toBe(true);
    expect(isMonster(mockClassIdServerObject(clsid.boar_s))).toBe(true);
    expect(isMonster(mockClassIdClientObject(clsid.dog_s))).toBe(true);
    expect(isMonster(mockClassIdServerObject(clsid.dog_s))).toBe(true);

    expect(isMonster(mockClassIdClientObject(clsid.zone_mbald_s))).toBe(false);
    expect(isMonster(mockClassIdServerObject(clsid.wpn_ak74_s))).toBe(false);
    expect(isMonster(mockClassIdServerObject(clsid.script_actor))).toBe(false);
    expect(isMonster(mockClassIdServerObject(clsid.script_stalker))).toBe(false);
  });

  it("isActor should correctly check if object is an actor", () => {
    expect(isActor(mockClassIdServerObject(clsid.online_offline_group_s))).toBe(false);
    expect(isActor(mockClassIdServerObject(clsid.boar_s))).toBe(false);
    expect(isActor(mockClassIdServerObject(clsid.dog_s))).toBe(false);
    expect(isActor(mockClassIdServerObject(clsid.wpn_ak74_s))).toBe(false);
    expect(isActor(mockClassIdServerObject(clsid.script_actor))).toBe(true);
    expect(isActor(mockClassIdServerObject(clsid.script_stalker))).toBe(false);
  });

  it("isSquad should correctly check if object is a squad", () => {
    expect(isSquad(mockClassIdServerObject(clsid.online_offline_group_s))).toBe(true);
    expect(isSquad(mockClassIdServerObject(clsid.boar_s))).toBe(false);
    expect(isSquad(mockClassIdServerObject(clsid.dog_s))).toBe(false);
    expect(isSquad(mockClassIdServerObject(clsid.wpn_ak74_s))).toBe(false);
    expect(isSquad(mockClassIdServerObject(clsid.script_actor))).toBe(false);
    expect(isSquad(mockClassIdServerObject(clsid.script_stalker))).toBe(false);
  });

  it("isSquadId should correctly check if id is a squad object", () => {
    const squad: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const actor: ServerActorObject = mockServerAlifeCreatureActor();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    expect(isSquadId(squad.id)).toBe(true);
    expect(isSquadId(actor.id)).toBe(false);
    expect(isSquadId(stalker.id)).toBe(false);
  });

  it("isSmartTerrain should correctly check if object is a monster", () => {
    expect(isSmartTerrain(mockClassIdServerObject(clsid.smart_terrain))).toBe(true);
    expect(isSmartTerrain(mockClassIdServerObject(clsid.online_offline_group_s))).toBe(false);
    expect(isSmartTerrain(mockClassIdServerObject(clsid.boar_s))).toBe(false);
    expect(isSmartTerrain(mockClassIdServerObject(clsid.dog_s))).toBe(false);
    expect(isSmartTerrain(mockClassIdServerObject(clsid.wpn_ak74_s))).toBe(false);
    expect(isSmartTerrain(mockClassIdServerObject(clsid.script_actor))).toBe(false);
    expect(isSmartTerrain(mockClassIdServerObject(clsid.script_stalker))).toBe(false);
  });

  it("isStalker should correctly check if object is a stalker", () => {
    expect(isStalker(mockClassIdClientObject(clsid.script_actor))).toBe(true);
    expect(isStalker(mockClassIdClientObject(clsid.script_stalker))).toBe(true);
    expect(isStalker(mockClassIdServerObject(clsid.script_actor))).toBe(true);
    expect(isStalker(mockClassIdServerObject(clsid.script_stalker))).toBe(true);

    expect(isStalker(mockClassIdClientObject(clsid.zone_mbald_s))).toBe(false);
    expect(isStalker(mockClassIdServerObject(clsid.wpn_ak74_s))).toBe(false);
    expect(isStalker(mockClassIdServerObject(clsid.boar_s))).toBe(false);
  });

  it("isStrappableWeapon should correctly check if object can be strapped", () => {
    expect(isStrappableWeapon(mockSectionClientObject("wpn_ak74"))).toBe(true);
    expect(isStrappableWeapon(mockSectionClientObject("wpn_svu"))).toBe(true);
    expect(isStrappableWeapon(mockSectionClientObject("wpn_another"))).toBe(false);
    expect(isStrappableWeapon(mockSectionClientObject("grenade_f1"))).toBe(false);
    expect(isStrappableWeapon(null)).toBe(false);
  });

  it("isWeapon utils should correctly check object class ids", () => {
    expect(isWeapon(null)).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(1))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_ammo))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_ammo_s))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_ammo_vog25))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_binocular))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_binocular_s))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(clsid.zone_mbald_s))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(clsid.artefact_s))).toBeFalsy();
    expect(isWeapon(mockClassIdClientObject(clsid.script_stalker))).toBeFalsy();

    expect(isWeapon(mockClassIdClientObject(clsid.wpn_knife))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_knife_s))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_silencer))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_silencer_s))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_ak74))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_grenade_rgd5))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_shotgun_s))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_shotgun))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_walther))).toBeTruthy();
    expect(isWeapon(mockClassIdClientObject(clsid.wpn_walther))).toBeTruthy();
  });

  it.todo("isMonsterSquad should correctly check if squad object assigned with monsters");
});
