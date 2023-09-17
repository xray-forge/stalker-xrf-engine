import { describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { registerActor, registerStoryLink, registry } from "@/engine/core/database";
import { EActionId } from "@/engine/core/objects/ai/types";
import { Squad } from "@/engine/core/objects/server/squad";
import { LoopedSound } from "@/engine/core/objects/sounds/playable_sounds";
import {
  isActorSeenByObject,
  isImmuneToSurgeObject,
  isObjectHelpingWounded,
  isObjectInCombat,
  isObjectInjured,
  isObjectOnline,
  isObjectSearchingCorpse,
  isObjectSeenByActor,
  isObjectStrappingWeapon,
  isObjectWithValuableLoot,
  isPlayingSound,
  isStalkerAlive,
  isSurgeEnabledOnLevel,
  isUndergroundLevel,
} from "@/engine/core/utils/object/object_check";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { ClientObject, ServerHumanObject, TClassId } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/utils";
import {
  CLIENT_SIDE_REGISTRY,
  MockActionPlanner,
  mockClientGameObject,
  mockIniFile,
  mockServerAlifeHumanStalker,
  mockServerAlifeMonsterBase,
} from "@/fixtures/xray";

describe("'object_check' utils", () => {
  it("'isObjectInCombat' should correctly check object combat state", () => {
    const object: ClientObject = mockClientGameObject();
    const planner: MockActionPlanner = object.motivation_action_manager() as unknown as MockActionPlanner;

    expect(isObjectInCombat(object)).toBe(false);

    planner.isInitialized = true;
    expect(isObjectInCombat(object)).toBe(false);

    planner.currentActionId = EActionId.MEET_WAITING_ACTIVITY;
    expect(isObjectInCombat(object)).toBe(false);

    planner.currentActionId = EActionId.COMBAT;
    expect(isObjectInCombat(object)).toBe(true);

    planner.currentActionId = EActionId.POST_COMBAT_WAIT;
    expect(isObjectInCombat(object)).toBe(true);

    planner.currentActionId = EActionId.CRITICALLY_WOUNDED;
    expect(isObjectInCombat(object)).toBe(false);
  });

  it("'isObjectSearchingCorpse' should correctly check object searching corpse state", () => {
    const object: ClientObject = mockClientGameObject();
    const planner: MockActionPlanner = object.motivation_action_manager() as unknown as MockActionPlanner;

    expect(isObjectSearchingCorpse(object)).toBe(false);

    planner.isInitialized = true;
    expect(isObjectSearchingCorpse(object)).toBe(false);

    planner.currentActionId = EActionId.MEET_WAITING_ACTIVITY;
    expect(isObjectSearchingCorpse(object)).toBe(false);

    planner.currentActionId = EActionId.SEARCH_CORPSE;
    expect(isObjectSearchingCorpse(object)).toBe(true);

    planner.currentActionId = EActionId.POST_COMBAT_WAIT;
    expect(isObjectSearchingCorpse(object)).toBe(false);

    planner.currentActionId = EActionId.CRITICALLY_WOUNDED;
    expect(isObjectSearchingCorpse(object)).toBe(false);
  });

  it("'isObjectHelpingWounded' should correctly check object helping wounded state", () => {
    const object: ClientObject = mockClientGameObject();
    const planner: MockActionPlanner = object.motivation_action_manager() as unknown as MockActionPlanner;

    expect(isObjectHelpingWounded(object)).toBe(false);

    planner.isInitialized = true;
    expect(isObjectHelpingWounded(object)).toBe(false);

    planner.currentActionId = EActionId.MEET_WAITING_ACTIVITY;
    expect(isObjectHelpingWounded(object)).toBe(false);

    planner.currentActionId = EActionId.HELP_WOUNDED;
    expect(isObjectHelpingWounded(object)).toBe(true);

    planner.currentActionId = EActionId.POST_COMBAT_WAIT;
    expect(isObjectHelpingWounded(object)).toBe(false);

    planner.currentActionId = EActionId.CRITICALLY_WOUNDED;
    expect(isObjectHelpingWounded(object)).toBe(false);
  });

  it("'isObjectWithValuableLoot' should correctly check object valuable loot", () => {
    expect(isObjectWithValuableLoot(mockClientGameObject())).toBe(false);
    expect(
      isObjectWithValuableLoot(
        mockClientGameObject({
          inventory: [
            ["grenade_f2", mockClientGameObject({ sectionOverride: "grenade_f2" })],
            ["grenade_f3", mockClientGameObject({ sectionOverride: "grenade_f3" })],
          ],
        })
      )
    ).toBe(false);
    expect(
      isObjectWithValuableLoot(
        mockClientGameObject({
          inventory: [
            ["grenade_f2", mockClientGameObject({ sectionOverride: "grenade_f2" })],
            [weapons.wpn_ak74u, mockClientGameObject({ sectionOverride: weapons.wpn_ak74u })],
          ],
        })
      )
    ).toBe(true);
    expect(
      isObjectWithValuableLoot(
        mockClientGameObject({
          inventory: [
            [weapons.wpn_ak74u, mockClientGameObject({ sectionOverride: weapons.wpn_ak74u })],
            [ammo["ammo_5.45x39_fmj"], mockClientGameObject({ sectionOverride: ammo["ammo_5.45x39_fmj"] })],
          ],
        })
      )
    ).toBe(true);
  });

  it("'isObjectStrappingWeapon' should correctly check weapon strap state", () => {
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

  it("'isStalkerAlive' should correctly check stalker alive state", () => {
    const aliveStalkerServerObject: ServerHumanObject = mockServerAlifeHumanStalker({
      alive: () => true,
      clsid: () => clsid.script_stalker as TClassId,
    });
    const aliveStalkerClientObject: ClientObject = mockClientGameObject({
      idOverride: aliveStalkerServerObject.id,
      alive: () => true,
      clsid: () => clsid.script_stalker as TClassId,
    });

    registerStoryLink(aliveStalkerServerObject.id, "alive-stalker-sid");

    expect(isStalkerAlive(aliveStalkerServerObject)).toBe(true);
    expect(isStalkerAlive(aliveStalkerClientObject)).toBe(true);
    expect(isStalkerAlive("alive-stalker-sid")).toBe(true);
    expect(isStalkerAlive("not-existing-stalker-sid")).toBe(false);
    expect(isStalkerAlive(mockClientGameObject())).toBe(false);
    expect(
      isStalkerAlive(
        mockServerAlifeHumanStalker({
          alive: () => false,
          clsid: () => clsid.script_stalker as TClassId,
        })
      )
    ).toBe(false);
    expect(
      isStalkerAlive(
        mockServerAlifeHumanStalker({
          alive: () => false,
          clsid: () => clsid.boar_s as TClassId,
        })
      )
    ).toBe(false);
    expect(
      isStalkerAlive(
        mockServerAlifeMonsterBase({
          alive: () => true,
          clsid: () => clsid.boar_s as TClassId,
        })
      )
    ).toBe(false);
  });

  it("'isObjectInjured' should correctly check objects", () => {
    expect(isObjectInjured(mockClientGameObject())).toBe(false);
    expect(isObjectInjured(mockClientGameObject({ radiation: -1, health: 100, bleeding: -1 }))).toBe(false);
    expect(isObjectInjured(mockClientGameObject({ radiation: 0.01 }))).toBe(true);
    expect(isObjectInjured(mockClientGameObject({ radiation: 0.5 }))).toBe(true);
    expect(isObjectInjured(mockClientGameObject({ bleeding: 0.01 }))).toBe(true);
    expect(isObjectInjured(mockClientGameObject({ bleeding: 0.5 }))).toBe(true);
    expect(isObjectInjured(mockClientGameObject({ health: 0.999 }))).toBe(true);
    expect(isObjectInjured(mockClientGameObject({ health: 0.5 }))).toBe(true);
  });

  it("'isObjectSeenByActor' should correctly check objects visibility", () => {
    expect(() => isObjectSeenByActor(mockClientGameObject())).toThrow();

    const actor: ClientObject = mockClientGameObject();

    registerActor(actor);

    jest.spyOn(actor, "alive").mockImplementation(() => true);
    jest.spyOn(actor, "see").mockImplementation(() => true);
    expect(isObjectSeenByActor(mockClientGameObject())).toBe(true);

    jest.spyOn(actor, "alive").mockImplementation(() => false);
    jest.spyOn(actor, "see").mockImplementation(() => true);
    expect(isObjectSeenByActor(mockClientGameObject())).toBe(false);

    jest.spyOn(actor, "alive").mockImplementation(() => true);
    jest.spyOn(actor, "see").mockImplementation(() => false);
    expect(isObjectSeenByActor(mockClientGameObject())).toBe(false);

    jest.spyOn(actor, "alive").mockImplementation(() => false);
    jest.spyOn(actor, "see").mockImplementation(() => false);
    expect(isObjectSeenByActor(mockClientGameObject())).toBe(false);
  });

  it("'isActorSeenByObject' should correctly check actor visibility", () => {
    const object: ClientObject = mockClientGameObject();

    registerActor(mockClientGameObject());

    jest.spyOn(object, "alive").mockImplementation(() => true);
    jest.spyOn(object, "see").mockImplementation(() => true);
    expect(isActorSeenByObject(object)).toBe(true);

    jest.spyOn(object, "alive").mockImplementation(() => false);
    jest.spyOn(object, "see").mockImplementation(() => true);
    expect(isActorSeenByObject(object)).toBe(false);

    jest.spyOn(object, "alive").mockImplementation(() => true);
    jest.spyOn(object, "see").mockImplementation(() => false);
    expect(isActorSeenByObject(object)).toBe(false);

    jest.spyOn(object, "alive").mockImplementation(() => false);
    jest.spyOn(object, "see").mockImplementation(() => false);
    expect(isActorSeenByObject(object)).toBe(false);
  });

  it("'isObjectOnline' should correctly check object online", () => {
    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();

    expect(isObjectOnline(first.id())).toBe(true);
    expect(isObjectOnline(second.id())).toBe(true);
    expect(isObjectOnline(1_000_001)).toBe(false);
    expect(isObjectOnline(1_000_002)).toBe(false);

    CLIENT_SIDE_REGISTRY.reset();

    expect(isObjectOnline(first.id())).toBe(false);
    expect(isObjectOnline(second.id())).toBe(false);
  });

  it("'isImmuneToSurgeObject' should correctly check that objects are immune to surge", () => {
    expect(isImmuneToSurgeObject({ faction: "monster_predatory_day" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeObject({ faction: "monster_vegetarian" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeObject({ faction: "monster_special" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeObject({ faction: "monster" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeObject({ faction: "zombied" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeObject({ faction: "monster_zombied_day" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeObject({ faction: "stalker" } as unknown as Squad)).toBe(false);
    expect(isImmuneToSurgeObject({ faction: "bandit" } as unknown as Squad)).toBe(false);
    expect(isImmuneToSurgeObject({ faction: "monolith" } as unknown as Squad)).toBe(false);
    expect(isImmuneToSurgeObject({ faction: "army" } as unknown as Squad)).toBe(false);
  });

  it("'isSurgeEnabledOnLevel' should correctly check if surge is enabled for level", () => {
    expect(isSurgeEnabledOnLevel("zaton")).toBe(true);
    expect(isSurgeEnabledOnLevel("jupiter")).toBe(true);
    expect(isSurgeEnabledOnLevel("labx8")).toBe(false);
    expect(isSurgeEnabledOnLevel("jupiter_underground")).toBe(false);
  });

  it("'isUndergroundLevel' should correctly check if level is undeground", () => {
    expect(isUndergroundLevel("zaton")).toBe(false);
    expect(isUndergroundLevel("jupiter")).toBe(false);
    expect(isUndergroundLevel("labx8")).toBe(true);
    expect(isUndergroundLevel("jupiter_underground")).toBe(true);
  });

  it("'isPlayingSound' should correctly check sound play state", () => {
    const object: ClientObject = mockClientGameObject();

    expect(isPlayingSound(object)).toBe(false);

    registry.sounds.generic.set(
      object.id(),
      new LoopedSound(
        mockIniFile("test.ltx", {
          test: {
            path: "test_sound.ogg",
          },
        }),
        "test"
      )
    );
    expect(isPlayingSound(object)).toBe(true);
  });
});
