import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { IRegistryObjectState, registerObject, registerSimulator, registerStoryLink } from "@/engine/core/database";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { EGameObjectRelation, EScheme, GameObject, ServerHumanObject, TRelationType } from "@/engine/lib/types";
import {
  callXrCondition,
  checkXrCondition,
  mockRegisteredActor,
  mockSchemeState,
  MockSquad,
  resetRegistry,
} from "@/fixtures/engine";
import { MockAlifeHumanStalker, mockCharactersGoodwill, MockGameObject } from "@/fixtures/xray";

describe("relation conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/relation");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("is_factions_enemies");
    checkXrCondition("is_factions_neutrals");
    checkXrCondition("is_factions_friends");
    checkXrCondition("is_faction_enemy_to_actor");
    checkXrCondition("is_faction_friend_to_actor");
    checkXrCondition("is_faction_neutral_to_actor");
    checkXrCondition("is_squad_friend_to_actor");
    checkXrCondition("is_squad_enemy_to_actor");
    checkXrCondition("fighting_actor");
    checkXrCondition("actor_enemy");
    checkXrCondition("actor_friend");
    checkXrCondition("actor_neutral");
    checkXrCondition("npc_community");
  });
});

describe("relation conditions implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/relation");
  });

  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();
  });

  it("is_factions_enemies should check actor and faction state", () => {
    expect(
      callXrCondition("is_factions_enemies", MockGameObject.mockActor(), MockGameObject.mock(), communities.bandit)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_enemies", MockGameObject.mockActor(), MockGameObject.mock(), communities.stalker)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_enemies", MockGameObject.mockActor(), MockGameObject.mock(), communities.army)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_enemies", MockGameObject.mockActor(), MockGameObject.mock(), communities.monolith)
    ).toBe(true);

    expect(
      callXrCondition("is_factions_enemies", MockGameObject.mockActor(), MockGameObject.mock(), communities.monster)
    ).toBe(true);
  });

  it("is_factions_neutrals should check actor and faction state", () => {
    expect(callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);
    expect(callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), null)).toBe(true);

    expect(
      callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), communities.bandit)
    ).toBe(true);

    expect(
      callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), communities.stalker)
    ).toBe(true);

    expect(
      callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), communities.army)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), communities.monolith)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), communities.monster)
    ).toBe(false);
  });

  it("is_factions_friends should check actor and faction state", () => {
    expect(
      callXrCondition("is_factions_friends", MockGameObject.mockActor(), MockGameObject.mock(), communities.actor)
    ).toBe(true);

    expect(
      callXrCondition("is_factions_friends", MockGameObject.mockActor(), MockGameObject.mock(), communities.army)
    ).toBe(true);

    expect(
      callXrCondition("is_factions_friends", MockGameObject.mockActor(), MockGameObject.mock(), communities.bandit)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_friends", MockGameObject.mockActor(), MockGameObject.mock(), communities.stalker)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_friends", MockGameObject.mockActor(), MockGameObject.mock(), communities.monolith)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_friends", MockGameObject.mockActor(), MockGameObject.mock(), communities.monster)
    ).toBe(false);
  });

  it("is_faction_enemy_to_actor should check actor and faction state", () => {
    expect(
      callXrCondition("is_faction_enemy_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), communities.army)
    ).toBe(false);

    expect(
      callXrCondition(
        "is_faction_enemy_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.bandit
      )
    ).toBe(false);

    expect(
      callXrCondition(
        "is_faction_enemy_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.monster
      )
    ).toBe(true);

    expect(
      callXrCondition(
        "is_faction_enemy_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.monolith
      )
    ).toBe(true);
  });

  it("is_faction_friend_to_actor should check actor and faction state", () => {
    expect(
      callXrCondition(
        "is_faction_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.actor
      )
    ).toBe(true);

    expect(
      callXrCondition("is_faction_friend_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), communities.army)
    ).toBe(true);

    expect(
      callXrCondition(
        "is_faction_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.bandit
      )
    ).toBe(false);

    expect(
      callXrCondition(
        "is_faction_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.stalker
      )
    ).toBe(false);

    expect(
      callXrCondition(
        "is_faction_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.monster
      )
    ).toBe(false);
  });

  it("is_faction_neutral_to_actor should check actor and faction state", () => {
    expect(
      callXrCondition(
        "is_faction_neutral_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.bandit
      )
    ).toBe(true);

    expect(
      callXrCondition(
        "is_faction_neutral_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.stalker
      )
    ).toBe(true);

    expect(
      callXrCondition(
        "is_faction_neutral_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.army
      )
    ).toBe(false);

    expect(
      callXrCondition(
        "is_faction_neutral_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        communities.monster
      )
    ).toBe(false);
  });

  it("is_squad_friend_to_actor should check relations", () => {
    expect(callXrCondition("is_squad_friend_to_actor", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
    expect(
      callXrCondition("is_squad_friend_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")
    ).toBe(false);

    expect(
      callXrCondition(
        "is_squad_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid-1",
        "test-sid-2"
      )
    ).toBe(false);

    const firstSquad: MockSquad = MockSquad.mock();
    const secondSquad: MockSquad = MockSquad.mock();

    registerStoryLink(firstSquad.id, "test-sid-1");
    registerStoryLink(secondSquad.id, "test-sid-2");

    const firstStalker: ServerHumanObject = MockAlifeHumanStalker.mock();
    const secondStalker: ServerHumanObject = MockAlifeHumanStalker.mock();

    secondSquad.mockAddMember(firstStalker);
    secondSquad.mockAddMember(secondStalker);

    mockCharactersGoodwill(firstStalker.id, ACTOR_ID, -1000);
    mockCharactersGoodwill(secondStalker.id, ACTOR_ID, 999);

    expect(
      callXrCondition(
        "is_squad_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid-1",
        "test-sid-2"
      )
    ).toBe(false);

    mockCharactersGoodwill(firstStalker.id, ACTOR_ID, 1000);
    mockCharactersGoodwill(secondStalker.id, ACTOR_ID, -500);

    expect(
      callXrCondition(
        "is_squad_friend_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid-1",
        "test-sid-2"
      )
    ).toBe(true);
  });

  it("is_squad_enemy_to_actor should check relations", () => {
    expect(callXrCondition("is_squad_enemy_to_actor", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
    expect(
      callXrCondition("is_squad_enemy_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")
    ).toBe(false);

    expect(
      callXrCondition(
        "is_squad_enemy_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid-1",
        "test-sid-2"
      )
    ).toBe(false);

    const firstSquad: MockSquad = MockSquad.mock();
    const secondSquad: MockSquad = MockSquad.mock();

    registerStoryLink(firstSquad.id, "test-sid-1");
    registerStoryLink(secondSquad.id, "test-sid-2");

    const firstStalker: ServerHumanObject = MockAlifeHumanStalker.mock();
    const secondStalker: ServerHumanObject = MockAlifeHumanStalker.mock();

    secondSquad.mockAddMember(firstStalker);
    secondSquad.mockAddMember(secondStalker);

    mockCharactersGoodwill(firstStalker.id, ACTOR_ID, 1000);
    mockCharactersGoodwill(secondStalker.id, ACTOR_ID, -999);

    expect(
      callXrCondition(
        "is_squad_enemy_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid-1",
        "test-sid-2"
      )
    ).toBe(false);

    mockCharactersGoodwill(firstStalker.id, ACTOR_ID, 1000);
    mockCharactersGoodwill(secondStalker.id, ACTOR_ID, -1000);

    expect(
      callXrCondition(
        "is_squad_enemy_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid-1",
        "test-sid-2"
      )
    ).toBe(true);
  });

  it("fighting_actor should check combat state of object", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.enemyId = ACTOR_ID;
    expect(callXrCondition("fighting_actor", MockGameObject.mockActor(), object)).toBe(true);

    state.enemyId = null;
    expect(callXrCondition("fighting_actor", MockGameObject.mockActor(), object)).toBe(false);
  });

  it("actor_enemy should check if actor is enemy", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.ENEMY as TRelationType);
    expect(callXrCondition("actor_enemy", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.FRIEND as TRelationType);
    expect(callXrCondition("actor_enemy", MockGameObject.mockActor(), object)).toBe(false);

    state[EScheme.DEATH] = mockSchemeState<ISchemeDeathState>(EScheme.DEATH, { killerId: ACTOR_ID });
    expect(callXrCondition("actor_enemy", MockGameObject.mockActor(), object)).toBe(true);
  });

  it("actor_friend should check if actor is friendly", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.FRIEND as TRelationType);
    expect(callXrCondition("actor_friend", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.ENEMY as TRelationType);
    expect(callXrCondition("actor_friend", MockGameObject.mockActor(), object)).toBe(false);
  });

  it("actor_neutral should check if actor is neutral", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.NEUTRAL as TRelationType);
    expect(callXrCondition("actor_neutral", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.ENEMY as TRelationType);
    expect(callXrCondition("actor_neutral", MockGameObject.mockActor(), object)).toBe(false);
  });

  it("npc_community should check object community", () => {
    const stalker: GameObject = MockGameObject.mockStalker({ community: "zombied" });

    expect(() => callXrCondition("npc_community", MockGameObject.mockActor(), stalker)).toThrow(
      "Condition 'npc_community' requires community name as parameter."
    );

    expect(callXrCondition("npc_community", MockGameObject.mockActor(), stalker, "zombied")).toBe(true);
    expect(callXrCondition("npc_community", MockGameObject.mockActor(), stalker, "stalker")).toBe(false);

    const monster: GameObject = MockGameObject.mock({ clsid: clsid.boar_s });

    expect(callXrCondition("npc_community", MockGameObject.mockActor(), monster, "monster")).toBe(true);
    expect(callXrCondition("npc_community", MockGameObject.mockActor(), monster, "stalker")).toBe(false);
  });
});
