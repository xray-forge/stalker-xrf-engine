import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerStoryLink, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects";
import {
  areCommunitiesEnemies,
  areCommunitiesFriendly,
  isAnySquadMemberEnemyToActor,
  isAnySquadMemberFriendToActor,
} from "@/engine/core/utils/relation/check";
import { getSquadCommunityRelationToActor } from "@/engine/core/utils/relation/get";
import { ERelation } from "@/engine/core/utils/relation/types";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ServerGroupObject, ServerHumanObject } from "@/engine/lib/types";
import {
  MockAlifeOnlineOfflineGroup,
  MockAlifeSimulator,
  mockServerAlifeCreatureActor,
  mockServerAlifeHumanStalker,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray";
import { mockCharactersGoodwill } from "@/fixtures/xray/mocks/relations";

describe("'relation/check' utils", () => {
  beforeEach(() => {
    registry.actor = null as any;
    registry.storyLink.sidById = new LuaTable();
    registry.storyLink.idBySid = new LuaTable();
    MockAlifeSimulator.removeFromRegistry(ACTOR_ID);
  });

  it("'isSquadCommunityEnemyToActor' should correctly check relation", () => {
    expect(() => getSquadCommunityRelationToActor("not-existing")).toThrow(
      "Squad with story id 'not-existing' was not found."
    );

    mockServerAlifeCreatureActor({ community: () => communities.actor });

    const enemy: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();

    (enemy as Squad).getCommunity = () => communities.monster;
    registerStoryLink(enemy.id, "existing-enemy");

    expect(getSquadCommunityRelationToActor("existing-enemy")).toBe(ERelation.ENEMY);
  });

  it("'isSquadCommunityFriendToActor' should correctly check relation", () => {
    expect(() => getSquadCommunityRelationToActor("not-existing")).toThrow(
      "Squad with story id 'not-existing' was not found."
    );

    mockServerAlifeCreatureActor({ community: () => communities.actor });

    const friend: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();

    (friend as Squad).getCommunity = () => communities.army;
    registerStoryLink(friend.id, "existing-friend");

    expect(getSquadCommunityRelationToActor("existing-friend")).toBe(ERelation.FRIEND);
  });

  it("'isSquadCommunityNeutralToActor' should correctly check neutral relation", () => {
    expect(() => getSquadCommunityRelationToActor("not-existing")).toThrow(
      "Squad with story id 'not-existing' was not found."
    );

    mockServerAlifeCreatureActor({ community: () => communities.actor });

    const neutral: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();

    (neutral as Squad).getCommunity = () => communities.bandit;
    registerStoryLink(neutral.id, "existing-neutral");

    expect(getSquadCommunityRelationToActor("existing-neutral")).toBe(ERelation.NEUTRAL);
  });

  it("'areCommunitiesFriendly' should correctly check communities friendly state", () => {
    expect(areCommunitiesFriendly(communities.actor, communities.army)).toBe(true);
    expect(areCommunitiesFriendly(communities.army, communities.actor)).toBe(true);
    expect(areCommunitiesFriendly(communities.bandit, communities.bandit)).toBe(true);
    expect(areCommunitiesFriendly(communities.monster, communities.monster)).toBe(true);
    expect(areCommunitiesFriendly(communities.monster, communities.actor)).toBe(false);
    expect(areCommunitiesFriendly(communities.actor, communities.monster)).toBe(false);
    expect(areCommunitiesFriendly(communities.actor, communities.stalker)).toBe(false);
    expect(areCommunitiesFriendly(communities.stalker, communities.actor)).toBe(false);
  });

  it("'areCommunitiesEnemies' should correctly check communities enemy state", () => {
    expect(areCommunitiesEnemies(communities.actor, communities.monolith)).toBe(true);
    expect(areCommunitiesEnemies(communities.monolith, communities.stalker)).toBe(true);
    expect(areCommunitiesEnemies(communities.monster, communities.actor)).toBe(true);
    expect(areCommunitiesEnemies(communities.actor, communities.monster)).toBe(true);
    expect(areCommunitiesEnemies(communities.bandit, communities.bandit)).toBe(false);
    expect(areCommunitiesEnemies(communities.monster, communities.monster)).toBe(false);
    expect(areCommunitiesEnemies(communities.actor, communities.stalker)).toBe(false);
    expect(areCommunitiesEnemies(communities.stalker, communities.actor)).toBe(false);
  });

  it("'isAnySquadMemberEnemyToActor' should correctly check relation of squad members", () => {
    const emptyGroup: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
    const friendlyGroup: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
    const neutralGroup: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
    const mixedGroup: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
    const enemyGroup: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");

    const friend: ServerHumanObject = mockServerAlifeHumanStalker();
    const enemy: ServerHumanObject = mockServerAlifeHumanStalker();
    const neutral: ServerHumanObject = mockServerAlifeHumanStalker();
    const almostEnemy: ServerHumanObject = mockServerAlifeHumanStalker();
    const almostFriend: ServerHumanObject = mockServerAlifeHumanStalker();

    mockCharactersGoodwill(friend.id, ACTOR_ID, 1000);
    mockCharactersGoodwill(enemy.id, ACTOR_ID, -1000);
    mockCharactersGoodwill(neutral.id, ACTOR_ID, 0);
    mockCharactersGoodwill(almostEnemy.id, ACTOR_ID, -999);
    mockCharactersGoodwill(almostFriend.id, ACTOR_ID, 999);

    friendlyGroup.addSquadMember(friend);
    friendlyGroup.addSquadMember(friend);
    friendlyGroup.addSquadMember(friend);

    neutralGroup.addSquadMember(neutral);
    neutralGroup.addSquadMember(almostEnemy);
    neutralGroup.addSquadMember(almostFriend);

    enemyGroup.addSquadMember(enemy);
    enemyGroup.addSquadMember(enemy);

    mixedGroup.addSquadMember(friend);
    mixedGroup.addSquadMember(neutral);
    mixedGroup.addSquadMember(enemy);

    expect(isAnySquadMemberEnemyToActor(emptyGroup.asSquad())).toBeFalsy();
    expect(isAnySquadMemberEnemyToActor(neutralGroup.asSquad())).toBeFalsy();
    expect(isAnySquadMemberEnemyToActor(friendlyGroup.asSquad())).toBeFalsy();
    expect(isAnySquadMemberEnemyToActor(enemyGroup.asSquad())).toBeTruthy();
    expect(isAnySquadMemberEnemyToActor(mixedGroup.asSquad())).toBeTruthy();
  });

  it("'isAnySquadMemberFriendToActor' should correctly check relation of squad members", () => {
    const emptyGroup: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
    const friendlyGroup: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
    const neutralGroup: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
    const mixedGroup: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");
    const enemyGroup: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test");

    const friend: ServerHumanObject = mockServerAlifeHumanStalker();
    const enemy: ServerHumanObject = mockServerAlifeHumanStalker();
    const neutral: ServerHumanObject = mockServerAlifeHumanStalker();
    const almostEnemy: ServerHumanObject = mockServerAlifeHumanStalker();
    const almostFriend: ServerHumanObject = mockServerAlifeHumanStalker();

    mockCharactersGoodwill(friend.id, ACTOR_ID, 1000);
    mockCharactersGoodwill(enemy.id, ACTOR_ID, -1000);
    mockCharactersGoodwill(neutral.id, ACTOR_ID, 0);
    mockCharactersGoodwill(almostEnemy.id, ACTOR_ID, -999);
    mockCharactersGoodwill(almostFriend.id, ACTOR_ID, 999);

    friendlyGroup.addSquadMember(friend);
    friendlyGroup.addSquadMember(friend);
    friendlyGroup.addSquadMember(friend);

    neutralGroup.addSquadMember(neutral);
    neutralGroup.addSquadMember(almostEnemy);
    neutralGroup.addSquadMember(almostFriend);

    enemyGroup.addSquadMember(enemy);
    enemyGroup.addSquadMember(enemy);

    mixedGroup.addSquadMember(friend);
    mixedGroup.addSquadMember(neutral);
    mixedGroup.addSquadMember(enemy);

    expect(isAnySquadMemberFriendToActor(emptyGroup.asSquad())).toBeFalsy();
    expect(isAnySquadMemberFriendToActor(neutralGroup.asSquad())).toBeFalsy();
    expect(isAnySquadMemberFriendToActor(enemyGroup.asSquad())).toBeFalsy();
    expect(isAnySquadMemberFriendToActor(friendlyGroup.asSquad())).toBeTruthy();
    expect(isAnySquadMemberFriendToActor(mixedGroup.asSquad())).toBeTruthy();
  });
});
