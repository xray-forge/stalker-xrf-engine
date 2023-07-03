import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerActor, registerStoryLink, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects";
import {
  areCommunitiesEnemies,
  areCommunitiesFriendly,
  isActorEnemyWithFaction,
  isActorFriendWithFaction,
  isActorNeutralWithFaction,
  isAnySquadMemberEnemyToActor,
  isAnySquadMemberFriendToActor,
} from "@/engine/core/utils/relation/relation_check";
import { getSquadCommunityRelationToActor } from "@/engine/core/utils/relation/relation_get";
import { ERelation } from "@/engine/core/utils/relation/relation_types";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ServerGroupObject } from "@/engine/lib/types";
import { mockRegisteredActor, mockRelationsSquads } from "@/fixtures/engine";
import { MockAlifeSimulator, mockServerAlifeCreatureActor, mockServerAlifeOnlineOfflineGroup } from "@/fixtures/xray";

describe("'relation/check' utils", () => {
  beforeEach(() => {
    registry.actor = null as any;
    registry.storyLink.sidById = new LuaTable();
    registry.storyLink.idBySid = new LuaTable();
    MockAlifeSimulator.removeFromRegistry(ACTOR_ID);
  });

  it("'isActorEnemyWithFaction' should check object faction relation", () => {
    mockRegisteredActor();

    expect(isActorEnemyWithFaction(communities.army)).toBe(false);
    expect(isActorEnemyWithFaction(communities.stalker)).toBe(false);
    expect(isActorEnemyWithFaction(communities.bandit)).toBe(false);
    expect(isActorEnemyWithFaction(communities.monolith)).toBe(true);
    expect(isActorEnemyWithFaction(communities.monster)).toBe(true);
  });

  it("'isActorFriendWithFaction' should check object faction relation", () => {
    mockRegisteredActor();

    expect(isActorFriendWithFaction(communities.actor)).toBe(true);
    expect(isActorFriendWithFaction(communities.army)).toBe(true);
    expect(isActorFriendWithFaction(communities.stalker)).toBe(false);
    expect(isActorFriendWithFaction(communities.bandit)).toBe(false);
    expect(isActorFriendWithFaction(communities.monolith)).toBe(false);
    expect(isActorFriendWithFaction(communities.monster)).toBe(false);
  });

  it("'isActorNeutralWithFaction' should check object faction relation", () => {
    mockRegisteredActor();

    expect(isActorNeutralWithFaction(communities.army)).toBe(false);
    expect(isActorNeutralWithFaction(communities.stalker)).toBe(true);
    expect(isActorNeutralWithFaction(communities.bandit)).toBe(true);
    expect(isActorNeutralWithFaction(communities.monolith)).toBe(false);
    expect(isActorNeutralWithFaction(communities.monster)).toBe(false);
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
    const { emptyMonolithSquad, neutralSquad, enemySquad, friendlySquad, mixedSquad } = mockRelationsSquads();

    expect(isAnySquadMemberEnemyToActor(emptyMonolithSquad)).toBeFalsy();
    expect(isAnySquadMemberEnemyToActor(neutralSquad)).toBeFalsy();
    expect(isAnySquadMemberEnemyToActor(friendlySquad)).toBeFalsy();
    expect(isAnySquadMemberEnemyToActor(enemySquad)).toBeTruthy();
    expect(isAnySquadMemberEnemyToActor(mixedSquad)).toBeTruthy();
  });

  it("'isAnySquadMemberFriendToActor' should correctly check relation of squad members", () => {
    const { emptyMonolithSquad, neutralSquad, enemySquad, friendlySquad, mixedSquad } = mockRelationsSquads();

    expect(isAnySquadMemberFriendToActor(emptyMonolithSquad)).toBeFalsy();
    expect(isAnySquadMemberFriendToActor(neutralSquad)).toBeFalsy();
    expect(isAnySquadMemberFriendToActor(enemySquad)).toBeFalsy();
    expect(isAnySquadMemberFriendToActor(friendlySquad)).toBeTruthy();
    expect(isAnySquadMemberFriendToActor(mixedSquad)).toBeTruthy();
  });
});
