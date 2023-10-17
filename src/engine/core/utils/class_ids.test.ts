import { beforeEach, describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import { registerSimulator } from "@/engine/core/database";
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
  isTrader,
  isWeapon,
} from "@/engine/core/utils/class_ids";
import { ServerActorObject, ServerGroupObject, ServerHumanObject, TClassId, TSection } from "@/engine/lib/types";
import {
  mockGameObject,
  mockServerAlifeCreatureActor,
  mockServerAlifeHumanStalker,
  mockServerAlifeObject,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray";

describe("class_ids utils", () => {
  const mockSectionGameObject = (section: TSection) => {
    return mockGameObject({ section: <T>() => section as T });
  };
  const mockClassIdGameObject = (classId: number) => {
    return mockGameObject({ clsid: () => classId as TClassId });
  };
  const mockClassIdServerObject = (classId: number) => {
    return mockServerAlifeObject({ clsid: () => classId as TClassId });
  };

  beforeEach(() => registerSimulator());

  it("isArtefact should correctly check if object is an artefact", () => {
    expect(isArtefact(mockClassIdGameObject(clsid.artefact))).toBe(true);
    expect(isArtefact(mockClassIdGameObject(clsid.artefact_s))).toBe(true);
    expect(isArtefact(mockClassIdGameObject(clsid.art_black_drops))).toBe(true);
    expect(isArtefact(mockClassIdServerObject(clsid.artefact))).toBe(true);
    expect(isArtefact(mockClassIdServerObject(clsid.artefact_s))).toBe(true);
    expect(isArtefact(mockClassIdServerObject(clsid.art_black_drops))).toBe(true);

    expect(isArtefact(mockClassIdGameObject(clsid.script_stalker))).toBe(false);
    expect(isArtefact(mockClassIdServerObject(clsid.zone_mbald_s))).toBe(false);
  });

  it("isGrenade should correctly check if object is a grenade", () => {
    expect(isGrenade(mockClassIdGameObject(clsid.wpn_grenade_f1_s))).toBe(true);
    expect(isGrenade(mockClassIdGameObject(clsid.wpn_grenade_rgd5_s))).toBe(true);
    expect(isGrenade(mockClassIdServerObject(clsid.wpn_grenade_f1_s))).toBe(true);
    expect(isGrenade(mockClassIdServerObject(clsid.wpn_grenade_rgd5_s))).toBe(true);

    expect(isGrenade(mockClassIdGameObject(clsid.script_stalker))).toBe(false);
    expect(isGrenade(mockClassIdServerObject(clsid.wpn_ak74_s))).toBe(false);
  });

  it("isMonster should correctly check if object is a monster", () => {
    expect(isMonster(mockClassIdGameObject(clsid.boar_s))).toBe(true);
    expect(isMonster(mockClassIdServerObject(clsid.boar_s))).toBe(true);
    expect(isMonster(mockClassIdGameObject(clsid.dog_s))).toBe(true);
    expect(isMonster(mockClassIdServerObject(clsid.dog_s))).toBe(true);

    expect(isMonster(mockClassIdGameObject(clsid.zone_mbald_s))).toBe(false);
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
    expect(isStalker(mockClassIdGameObject(clsid.script_actor))).toBe(true);
    expect(isStalker(mockGameObject(), clsid.script_actor)).toBe(true);
    expect(isStalker(mockClassIdGameObject(clsid.script_stalker))).toBe(true);
    expect(isStalker(mockGameObject(), clsid.script_stalker)).toBe(true);
    expect(isStalker(mockClassIdServerObject(clsid.script_actor))).toBe(true);
    expect(isStalker(mockClassIdServerObject(clsid.script_stalker))).toBe(true);
    expect(isStalker(mockClassIdServerObject(clsid.trader))).toBe(false);
    expect(isStalker(mockGameObject(), clsid.trader)).toBe(false);

    expect(isStalker(mockGameObject(), clsid.zone_mbald_s)).toBe(false);
    expect(isStalker(mockClassIdGameObject(clsid.zone_mbald_s))).toBe(false);
    expect(isStalker(mockClassIdServerObject(clsid.wpn_ak74_s))).toBe(false);
    expect(isStalker(mockClassIdServerObject(clsid.boar_s))).toBe(false);
  });

  it("isTrader should correctly check if object is a stalker", () => {
    expect(isTrader(mockClassIdServerObject(clsid.trader))).toBe(true);
    expect(isTrader(mockGameObject(), clsid.trader)).toBe(true);

    expect(isTrader(mockClassIdGameObject(clsid.script_actor))).toBe(false);
    expect(isTrader(mockGameObject(), clsid.script_actor)).toBe(false);
    expect(isTrader(mockClassIdGameObject(clsid.script_stalker))).toBe(false);
    expect(isTrader(mockGameObject(), clsid.script_stalker)).toBe(false);
    expect(isTrader(mockClassIdServerObject(clsid.script_actor))).toBe(false);
    expect(isTrader(mockClassIdServerObject(clsid.script_stalker))).toBe(false);
    expect(isTrader(mockGameObject(), clsid.zone_mbald_s)).toBe(false);
    expect(isTrader(mockClassIdGameObject(clsid.zone_mbald_s))).toBe(false);
    expect(isTrader(mockClassIdServerObject(clsid.wpn_ak74_s))).toBe(false);
    expect(isTrader(mockClassIdServerObject(clsid.boar_s))).toBe(false);
  });

  it("isStrappableWeapon should correctly check if object can be strapped", () => {
    expect(isStrappableWeapon(mockSectionGameObject("wpn_ak74"))).toBe(true);
    expect(isStrappableWeapon(mockSectionGameObject("wpn_svu"))).toBe(true);
    expect(isStrappableWeapon(mockSectionGameObject("wpn_another"))).toBe(false);
    expect(isStrappableWeapon(mockSectionGameObject("grenade_f1"))).toBe(false);
    expect(isStrappableWeapon(null)).toBe(false);
  });

  it("isWeapon utils should correctly check object class ids", () => {
    expect(isWeapon(null)).toBeFalsy();
    expect(isWeapon(mockClassIdGameObject(1))).toBeFalsy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_ammo))).toBeFalsy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_ammo_s))).toBeFalsy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_ammo_vog25))).toBeFalsy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_binocular))).toBeFalsy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_binocular_s))).toBeFalsy();
    expect(isWeapon(mockClassIdGameObject(clsid.zone_mbald_s))).toBeFalsy();
    expect(isWeapon(mockClassIdGameObject(clsid.artefact_s))).toBeFalsy();
    expect(isWeapon(mockClassIdGameObject(clsid.script_stalker))).toBeFalsy();

    expect(isWeapon(mockClassIdGameObject(clsid.wpn_knife))).toBeTruthy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_knife_s))).toBeTruthy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_silencer))).toBeTruthy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_silencer_s))).toBeTruthy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_ak74))).toBeTruthy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_grenade_rgd5))).toBeTruthy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_shotgun_s))).toBeTruthy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_shotgun))).toBeTruthy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_walther))).toBeTruthy();
    expect(isWeapon(mockClassIdGameObject(clsid.wpn_walther))).toBeTruthy();
  });

  it.todo("isMonsterSquad should correctly check if squad object assigned with monsters");
});
