import { beforeEach, describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import { registerSimulator } from "@/engine/core/database";
import {
  isActor,
  isArtefact,
  isCreature,
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
import { ServerActorObject, ServerGroupObject, ServerHumanObject } from "@/engine/lib/types";
import {
  MockAlifeObject,
  MockGameObject,
  mockServerAlifeCreatureActor,
  mockServerAlifeHumanStalker,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray";

describe("isArtefact utils", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check if object is an artefact", () => {
    expect(isArtefact(MockGameObject.mockWithClassId(clsid.artefact))).toBe(true);
    expect(isArtefact(MockGameObject.mockWithClassId(clsid.artefact_s))).toBe(true);
    expect(isArtefact(MockGameObject.mockWithClassId(clsid.art_black_drops))).toBe(true);
    expect(isArtefact(MockAlifeObject.mockWithClassId(clsid.artefact))).toBe(true);
    expect(isArtefact(MockAlifeObject.mockWithClassId(clsid.artefact_s))).toBe(true);
    expect(isArtefact(MockAlifeObject.mockWithClassId(clsid.art_black_drops))).toBe(true);

    expect(isArtefact(MockGameObject.mockWithClassId(clsid.script_stalker))).toBe(false);
    expect(isArtefact(MockAlifeObject.mockWithClassId(clsid.zone_mbald_s))).toBe(false);
  });
});

describe("isGrenade utils", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check if object is a grenade", () => {
    expect(isGrenade(MockGameObject.mockWithClassId(clsid.wpn_grenade_f1_s))).toBe(true);
    expect(isGrenade(MockGameObject.mockWithClassId(clsid.wpn_grenade_rgd5_s))).toBe(true);
    expect(isGrenade(MockAlifeObject.mockWithClassId(clsid.wpn_grenade_f1_s))).toBe(true);
    expect(isGrenade(MockAlifeObject.mockWithClassId(clsid.wpn_grenade_rgd5_s))).toBe(true);

    expect(isGrenade(MockGameObject.mockWithClassId(clsid.script_stalker))).toBe(false);
    expect(isGrenade(MockAlifeObject.mockWithClassId(clsid.wpn_ak74_s))).toBe(false);
  });
});

describe("isActor utils", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check if object is an actor", () => {
    expect(isActor(MockAlifeObject.mockWithClassId(clsid.online_offline_group_s))).toBe(false);
    expect(isActor(MockAlifeObject.mockWithClassId(clsid.boar_s))).toBe(false);
    expect(isActor(MockAlifeObject.mockWithClassId(clsid.dog_s))).toBe(false);
    expect(isActor(MockAlifeObject.mockWithClassId(clsid.wpn_ak74_s))).toBe(false);
    expect(isActor(MockAlifeObject.mockWithClassId(clsid.script_actor))).toBe(true);
    expect(isActor(MockAlifeObject.mockWithClassId(clsid.script_stalker))).toBe(false);
  });
});

describe("isSquad utils", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check if object is a squad", () => {
    expect(isSquad(MockAlifeObject.mockWithClassId(clsid.online_offline_group_s))).toBe(true);
    expect(isSquad(MockAlifeObject.mockWithClassId(clsid.boar_s))).toBe(false);
    expect(isSquad(MockAlifeObject.mockWithClassId(clsid.dog_s))).toBe(false);
    expect(isSquad(MockAlifeObject.mockWithClassId(clsid.wpn_ak74_s))).toBe(false);
    expect(isSquad(MockAlifeObject.mockWithClassId(clsid.script_actor))).toBe(false);
    expect(isSquad(MockAlifeObject.mockWithClassId(clsid.script_stalker))).toBe(false);
  });
});

describe("isSquadId utils", () => {
  beforeEach(() => registerSimulator());

  it("correctly check if id is a squad object", () => {
    const squad: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const actor: ServerActorObject = mockServerAlifeCreatureActor();
    const stalker: ServerHumanObject = mockServerAlifeHumanStalker();

    expect(isSquadId(squad.id)).toBe(true);
    expect(isSquadId(actor.id)).toBe(false);
    expect(isSquadId(stalker.id)).toBe(false);
  });
});

describe("isSmartTerrain utils", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check if object is a monster", () => {
    expect(isSmartTerrain(MockAlifeObject.mockWithClassId(clsid.smart_terrain))).toBe(true);
    expect(isSmartTerrain(MockAlifeObject.mockWithClassId(clsid.online_offline_group_s))).toBe(false);
    expect(isSmartTerrain(MockAlifeObject.mockWithClassId(clsid.boar_s))).toBe(false);
    expect(isSmartTerrain(MockAlifeObject.mockWithClassId(clsid.dog_s))).toBe(false);
    expect(isSmartTerrain(MockAlifeObject.mockWithClassId(clsid.wpn_ak74_s))).toBe(false);
    expect(isSmartTerrain(MockAlifeObject.mockWithClassId(clsid.script_actor))).toBe(false);
    expect(isSmartTerrain(MockAlifeObject.mockWithClassId(clsid.script_stalker))).toBe(false);
  });
});

describe("isMonster utils", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check if object is a monster", () => {
    expect(isMonster(MockGameObject.mockWithClassId(clsid.boar_s))).toBe(true);
    expect(isMonster(MockAlifeObject.mockWithClassId(clsid.boar_s))).toBe(true);
    expect(isMonster(MockGameObject.mockWithClassId(clsid.dog_s))).toBe(true);
    expect(isMonster(MockAlifeObject.mockWithClassId(clsid.dog_s))).toBe(true);

    expect(isMonster(MockGameObject.mockWithClassId(clsid.zone_mbald_s))).toBe(false);
    expect(isMonster(MockAlifeObject.mockWithClassId(clsid.wpn_ak74_s))).toBe(false);
    expect(isMonster(MockAlifeObject.mockWithClassId(clsid.script_actor))).toBe(false);
    expect(isMonster(MockAlifeObject.mockWithClassId(clsid.script_stalker))).toBe(false);
  });
});

describe("isStalker utils", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check if object is a stalker", () => {
    expect(isStalker(MockGameObject.mockWithClassId(clsid.script_actor))).toBe(true);
    expect(isStalker(MockGameObject.mock(), clsid.script_actor)).toBe(true);
    expect(isStalker(MockGameObject.mockWithClassId(clsid.script_stalker))).toBe(true);
    expect(isStalker(MockGameObject.mock(), clsid.script_stalker)).toBe(true);
    expect(isStalker(MockAlifeObject.mockWithClassId(clsid.script_actor))).toBe(true);
    expect(isStalker(MockAlifeObject.mockWithClassId(clsid.script_stalker))).toBe(true);
    expect(isStalker(MockAlifeObject.mockWithClassId(clsid.trader))).toBe(false);
    expect(isStalker(MockGameObject.mock(), clsid.trader)).toBe(false);

    expect(isStalker(MockGameObject.mock(), clsid.zone_mbald_s)).toBe(false);
    expect(isStalker(MockGameObject.mockWithClassId(clsid.zone_mbald_s))).toBe(false);
    expect(isStalker(MockAlifeObject.mockWithClassId(clsid.wpn_ak74_s))).toBe(false);
    expect(isStalker(MockAlifeObject.mockWithClassId(clsid.boar_s))).toBe(false);
  });
});

describe("isCreature utils", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check if object is a stalker", () => {
    expect(isCreature(MockGameObject.mockWithClassId(clsid.script_actor))).toBe(true);
    expect(isCreature(MockGameObject.mock(), clsid.script_actor)).toBe(true);
    expect(isCreature(MockGameObject.mockWithClassId(clsid.script_stalker))).toBe(true);
    expect(isCreature(MockGameObject.mock(), clsid.script_stalker)).toBe(true);
    expect(isCreature(MockAlifeObject.mockWithClassId(clsid.script_actor))).toBe(true);
    expect(isCreature(MockAlifeObject.mockWithClassId(clsid.script_stalker))).toBe(true);
    expect(isCreature(MockAlifeObject.mockWithClassId(clsid.trader))).toBe(false);
    expect(isCreature(MockGameObject.mock(), clsid.trader)).toBe(false);
    expect(isCreature(MockGameObject.mockWithClassId(clsid.boar_s))).toBe(true);
    expect(isCreature(MockAlifeObject.mockWithClassId(clsid.boar_s))).toBe(true);
    expect(isCreature(MockGameObject.mockWithClassId(clsid.dog_s))).toBe(true);

    expect(isCreature(MockGameObject.mock(), clsid.zone_mbald_s)).toBe(false);
    expect(isCreature(MockGameObject.mockWithClassId(clsid.zone_mbald_s))).toBe(false);
    expect(isCreature(MockAlifeObject.mockWithClassId(clsid.wpn_ak74_s))).toBe(false);
  });
});

describe("isTrader utils", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check if object is a stalker", () => {
    expect(isTrader(MockAlifeObject.mockWithClassId(clsid.trader))).toBe(true);
    expect(isTrader(MockGameObject.mock(), clsid.trader)).toBe(true);

    expect(isTrader(MockGameObject.mockWithClassId(clsid.script_actor))).toBe(false);
    expect(isTrader(MockGameObject.mock(), clsid.script_actor)).toBe(false);
    expect(isTrader(MockGameObject.mockWithClassId(clsid.script_stalker))).toBe(false);
    expect(isTrader(MockGameObject.mock(), clsid.script_stalker)).toBe(false);
    expect(isTrader(MockAlifeObject.mockWithClassId(clsid.script_actor))).toBe(false);
    expect(isTrader(MockAlifeObject.mockWithClassId(clsid.script_stalker))).toBe(false);
    expect(isTrader(MockGameObject.mock(), clsid.zone_mbald_s)).toBe(false);
    expect(isTrader(MockGameObject.mockWithClassId(clsid.zone_mbald_s))).toBe(false);
    expect(isTrader(MockAlifeObject.mockWithClassId(clsid.wpn_ak74_s))).toBe(false);
    expect(isTrader(MockAlifeObject.mockWithClassId(clsid.boar_s))).toBe(false);
  });
});

describe("isStrappableWeapon utils", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check if object can be strapped", () => {
    expect(isStrappableWeapon(MockGameObject.mockWithSection("wpn_ak74"))).toBe(true);
    expect(isStrappableWeapon(MockGameObject.mockWithSection("wpn_svu"))).toBe(true);
    expect(isStrappableWeapon(MockGameObject.mockWithSection("wpn_another"))).toBe(false);
    expect(isStrappableWeapon(MockGameObject.mockWithSection("grenade_f1"))).toBe(false);
    expect(isStrappableWeapon(null)).toBe(false);
  });
});

describe("isWeapon utils", () => {
  beforeEach(() => registerSimulator());

  it("utils should correctly check object class ids", () => {
    expect(isWeapon(null)).toBeFalsy();
    expect(isWeapon(MockGameObject.mockWithClassId(1))).toBeFalsy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_ammo))).toBeFalsy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_ammo_s))).toBeFalsy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_ammo_vog25))).toBeFalsy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_binocular))).toBeFalsy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_binocular_s))).toBeFalsy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.zone_mbald_s))).toBeFalsy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.artefact_s))).toBeFalsy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.script_stalker))).toBeFalsy();

    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_knife))).toBeTruthy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_knife_s))).toBeTruthy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_silencer))).toBeTruthy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_silencer_s))).toBeTruthy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_ak74))).toBeTruthy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_grenade_rgd5))).toBeTruthy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_shotgun_s))).toBeTruthy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_shotgun))).toBeTruthy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_walther))).toBeTruthy();
    expect(isWeapon(MockGameObject.mockWithClassId(clsid.wpn_walther))).toBeTruthy();
  });
});

describe("isMonsterSquad util", () => {
  beforeEach(() => registerSimulator());

  it.todo("should correctly check if squad object assigned with monsters");
});
