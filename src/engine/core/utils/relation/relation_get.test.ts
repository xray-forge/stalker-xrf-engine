import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  registerActor,
  registerActorServer,
  registerSimulator,
  registerStoryLink,
  registry,
} from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import {
  getNumberRelationBetweenCommunities,
  getObjectsRelationSafe,
  getSquadCommunityRelationToActor,
  getSquadMembersRelationToActor,
  getSquadMembersRelationToActorSafe,
  getSquadRelationToActorById,
} from "@/engine/core/utils/relation/relation_get";
import { ERelation } from "@/engine/core/utils/relation/relation_types";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { GameObject, ServerGroupObject } from "@/engine/lib/types";
import { mockRelationsSquads, resetRegistry } from "@/fixtures/engine";
import {
  MockAlifeSimulator,
  MockGameObject,
  mockServerAlifeCreatureActor,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray";

describe("getObjectsRelationSafe util", () => {
  beforeEach(() => {
    resetRegistry();
    MockAlifeSimulator.removeFromRegistry(ACTOR_ID);
    registerSimulator();
  });

  it("should correctly check relation", () => {
    expect(getObjectsRelationSafe(MockGameObject.mock(), null)).toBeNull();
    expect(getObjectsRelationSafe(null, MockGameObject.mock())).toBeNull();
    expect(getObjectsRelationSafe(null, null)).toBeNull();

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const third: GameObject = MockGameObject.mock();
    const fourth: GameObject = MockGameObject.mock();

    jest.spyOn(first, "relation").mockImplementation(() => 0);
    jest.spyOn(second, "relation").mockImplementation(() => 1);
    jest.spyOn(third, "relation").mockImplementation(() => 2);
    jest.spyOn(fourth, "relation").mockImplementation(() => 3);

    expect(getObjectsRelationSafe(first, second)).toBe(0);
    expect(getObjectsRelationSafe(second, first)).toBe(1);
    expect(getObjectsRelationSafe(third, second)).toBe(2);
    expect(getObjectsRelationSafe(fourth, second)).toBe(3);
  });
});

describe("getSquadMembersRelationToActorSafe util", () => {
  beforeEach(() => {
    resetRegistry();
    MockAlifeSimulator.removeFromRegistry(ACTOR_ID);
    registerSimulator();
  });

  it("should correctly check relation", () => {
    const { emptyMonolithSquad, emptyArmySquad, neutralSquad, friendlySquad, mixedSquad, enemySquad } =
      mockRelationsSquads();

    // No actor.
    expect(registry.actor).toBeNull();
    expect(getSquadMembersRelationToActorSafe(emptyMonolithSquad)).toBe(ERelation.NEUTRAL);
    expect(getSquadMembersRelationToActorSafe(emptyArmySquad)).toBe(ERelation.NEUTRAL);

    registerActor(MockGameObject.mockActor());

    expect(getSquadMembersRelationToActorSafe(emptyMonolithSquad)).toBe(ERelation.ENEMY);
    expect(getSquadMembersRelationToActorSafe(emptyArmySquad)).toBe(ERelation.FRIEND);
    expect(getSquadMembersRelationToActorSafe(friendlySquad)).toBe(ERelation.FRIEND);
    expect(getSquadMembersRelationToActorSafe(mixedSquad)).toBe(ERelation.NEUTRAL);
    expect(getSquadMembersRelationToActorSafe(neutralSquad)).toBe(ERelation.NEUTRAL);
    expect(getSquadMembersRelationToActorSafe(enemySquad)).toBe(ERelation.ENEMY);
  });
});

describe("getSquadMembersRelationToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    MockAlifeSimulator.removeFromRegistry(ACTOR_ID);
    registerSimulator();
  });

  it("should correctly check relation", () => {
    const { emptyMonolithSquad, emptyArmySquad, neutralSquad, friendlySquad, mixedSquad, enemySquad } =
      mockRelationsSquads();

    // No actor.
    expect(registry.actor).toBeNull();
    expect(getSquadMembersRelationToActor(emptyMonolithSquad)).toBe(ERelation.NEUTRAL);
    expect(getSquadMembersRelationToActor(emptyArmySquad)).toBe(ERelation.NEUTRAL);

    registerActor(MockGameObject.mockActor());

    expect(getSquadMembersRelationToActor(emptyMonolithSquad)).toBeNull();
    expect(getSquadMembersRelationToActor(emptyArmySquad)).toBeNull();
    expect(getSquadMembersRelationToActor(friendlySquad)).toBe(ERelation.FRIEND);
    expect(getSquadMembersRelationToActor(mixedSquad)).toBe(ERelation.NEUTRAL);
    expect(getSquadMembersRelationToActor(neutralSquad)).toBe(ERelation.NEUTRAL);
    expect(getSquadMembersRelationToActor(enemySquad)).toBe(ERelation.ENEMY);
  });
});

describe("getNumberRelationBetweenCommunities utils", () => {
  beforeEach(() => {
    resetRegistry();
    MockAlifeSimulator.removeFromRegistry(ACTOR_ID);
    registerSimulator();
  });

  it("should correctly check relation", () => {
    expect(getNumberRelationBetweenCommunities(null, null)).toBeNull();
    expect(getNumberRelationBetweenCommunities(null, communities.stalker)).toBeNull();
    expect(getNumberRelationBetweenCommunities(communities.stalker, null)).toBeNull();
    expect(getNumberRelationBetweenCommunities(communities.none, communities.stalker)).toBeNull();
    expect(getNumberRelationBetweenCommunities(communities.stalker, communities.none)).toBeNull();

    expect(getNumberRelationBetweenCommunities(communities.actor, communities.actor)).toBe(1000);
    expect(getNumberRelationBetweenCommunities(communities.actor, communities.stalker)).toBe(250);
    expect(getNumberRelationBetweenCommunities(communities.stalker, communities.actor)).toBe(200);
    expect(getNumberRelationBetweenCommunities(communities.monolith, communities.monster)).toBe(-1000);
    expect(getNumberRelationBetweenCommunities(communities.monster, communities.bandit)).toBe(-5000);
  });
});

describe("getSquadCommunityRelationToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    MockAlifeSimulator.removeFromRegistry(ACTOR_ID);
    registerSimulator();
  });

  it("should correctly get relation of squad community", () => {
    expect(() => getSquadCommunityRelationToActor("not-existing")).toThrow(
      "Squad with story id 'not-existing' was not found."
    );

    registerActorServer(mockServerAlifeCreatureActor({ community: <T>() => communities.actor as T }));

    const enemy: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const friend: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const neutral: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const predefined: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();

    (enemy as Squad).faction = communities.monolith;
    (friend as Squad).faction = communities.army;
    (neutral as Squad).faction = communities.stalker;

    registerStoryLink(enemy.id, "existing-enemy");
    registerStoryLink(friend.id, "existing-friend");
    registerStoryLink(neutral.id, "existing-neutral");
    registerStoryLink(predefined.id, "existing-predefined");

    (predefined as Squad).relationship = ERelation.ENEMY;
    expect(getSquadCommunityRelationToActor("existing-predefined")).toBe(ERelation.ENEMY);
    (predefined as Squad).relationship = ERelation.FRIEND;
    expect(getSquadCommunityRelationToActor("existing-predefined")).toBe(ERelation.FRIEND);
    (predefined as Squad).relationship = ERelation.NEUTRAL;
    expect(getSquadCommunityRelationToActor("existing-predefined")).toBe(ERelation.NEUTRAL);

    expect(getSquadCommunityRelationToActor("existing-friend")).toBe(ERelation.FRIEND);
    expect(getSquadCommunityRelationToActor("existing-neutral")).toBe(ERelation.NEUTRAL);
    expect(getSquadCommunityRelationToActor("existing-enemy")).toBe(ERelation.ENEMY);
  });
});

describe("getSquadRelationToActorById util", () => {
  beforeEach(() => {
    resetRegistry();
    MockAlifeSimulator.removeFromRegistry(ACTOR_ID);
    registerSimulator();
  });

  it("should correctly check relation", () => {
    const { emptyMonolithSquad, emptyArmySquad, neutralSquad, friendlySquad, mixedSquad, enemySquad } =
      mockRelationsSquads();

    registerActorServer(mockServerAlifeCreatureActor());

    expect(() => getSquadRelationToActorById(10002000)).toThrow("Squad with id '10002000' is not found.");
    expect(getSquadRelationToActorById(emptyMonolithSquad.id)).toBe(ERelation.ENEMY);
    expect(getSquadRelationToActorById(emptyArmySquad.id)).toBe(ERelation.FRIEND);
    expect(getSquadRelationToActorById(friendlySquad.id)).toBe(ERelation.FRIEND);
    expect(getSquadRelationToActorById(neutralSquad.id)).toBe(ERelation.NEUTRAL);
    expect(getSquadRelationToActorById(enemySquad.id)).toBe(ERelation.ENEMY);

    mixedSquad.relationship = ERelation.FRIEND;
    expect(getSquadRelationToActorById(mixedSquad.id)).toBe(ERelation.FRIEND);
    mixedSquad.relationship = ERelation.NEUTRAL;
    expect(getSquadRelationToActorById(mixedSquad.id)).toBe(ERelation.NEUTRAL);
    mixedSquad.relationship = ERelation.ENEMY;
    expect(getSquadRelationToActorById(mixedSquad.id)).toBe(ERelation.ENEMY);
  });
});
