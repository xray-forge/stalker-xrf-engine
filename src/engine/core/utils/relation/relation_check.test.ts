import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerActorServer, registerSimulator, registerStoryLink } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
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
import { ServerGroupObject } from "@/engine/lib/types";
import { mockRegisteredActor, mockRelationsSquads, resetRegistry } from "@/fixtures/engine";
import { mockServerAlifeCreatureActor, mockServerAlifeOnlineOfflineGroup } from "@/fixtures/xray";

describe("isActorEnemyWithFaction util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should check object faction relation", () => {
    mockRegisteredActor();

    expect(isActorEnemyWithFaction(communities.army)).toBe(false);
    expect(isActorEnemyWithFaction(communities.stalker)).toBe(false);
    expect(isActorEnemyWithFaction(communities.bandit)).toBe(false);
    expect(isActorEnemyWithFaction(communities.monolith)).toBe(true);
    expect(isActorEnemyWithFaction(communities.monster)).toBe(true);
  });
});

describe("isActorFriendWithFaction util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should check object faction relation", () => {
    mockRegisteredActor();

    expect(isActorFriendWithFaction(communities.actor)).toBe(true);
    expect(isActorFriendWithFaction(communities.army)).toBe(true);
    expect(isActorFriendWithFaction(communities.stalker)).toBe(false);
    expect(isActorFriendWithFaction(communities.bandit)).toBe(false);
    expect(isActorFriendWithFaction(communities.monolith)).toBe(false);
    expect(isActorFriendWithFaction(communities.monster)).toBe(false);
  });
});

describe("isActorNeutralWithFaction util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should check object faction relation", () => {
    mockRegisteredActor();

    expect(isActorNeutralWithFaction(communities.army)).toBe(false);
    expect(isActorNeutralWithFaction(communities.stalker)).toBe(true);
    expect(isActorNeutralWithFaction(communities.bandit)).toBe(true);
    expect(isActorNeutralWithFaction(communities.monolith)).toBe(false);
    expect(isActorNeutralWithFaction(communities.monster)).toBe(false);
  });
});

describe("isSquadCommunityEnemyToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check relation", () => {
    expect(() => getSquadCommunityRelationToActor("not-existing")).toThrow(
      "Squad with story id 'not-existing' was not found."
    );

    registerActorServer(mockServerAlifeCreatureActor({ community: <T>() => communities.actor as T }));

    const enemy: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();

    (enemy as Squad).faction = communities.monster;
    registerStoryLink(enemy.id, "existing-enemy");

    expect(getSquadCommunityRelationToActor("existing-enemy")).toBe(ERelation.ENEMY);
  });
});

describe("isSquadCommunityFriendToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check relation", () => {
    expect(() => getSquadCommunityRelationToActor("not-existing")).toThrow(
      "Squad with story id 'not-existing' was not found."
    );

    registerActorServer(mockServerAlifeCreatureActor({ community: <T>() => communities.actor as T }));

    const friend: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();

    (friend as Squad).faction = communities.army;
    registerStoryLink(friend.id, "existing-friend");

    expect(getSquadCommunityRelationToActor("existing-friend")).toBe(ERelation.FRIEND);
  });
});

describe("isSquadCommunityNeutralToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check neutral relation", () => {
    expect(() => getSquadCommunityRelationToActor("not-existing")).toThrow(
      "Squad with story id 'not-existing' was not found."
    );

    registerActorServer(mockServerAlifeCreatureActor({ community: <T>() => communities.actor as T }));

    const neutral: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();

    (neutral as Squad).faction = communities.bandit;
    registerStoryLink(neutral.id, "existing-neutral");

    expect(getSquadCommunityRelationToActor("existing-neutral")).toBe(ERelation.NEUTRAL);
  });
});

describe("areCommunitiesFriendly util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check communities friendly state", () => {
    expect(areCommunitiesFriendly(communities.actor, communities.army)).toBe(true);
    expect(areCommunitiesFriendly(communities.army, communities.actor)).toBe(true);
    expect(areCommunitiesFriendly(communities.bandit, communities.bandit)).toBe(true);
    expect(areCommunitiesFriendly(communities.monster, communities.monster)).toBe(true);
    expect(areCommunitiesFriendly(communities.monster, communities.actor)).toBe(false);
    expect(areCommunitiesFriendly(communities.actor, communities.monster)).toBe(false);
    expect(areCommunitiesFriendly(communities.actor, communities.stalker)).toBe(false);
    expect(areCommunitiesFriendly(communities.stalker, communities.actor)).toBe(false);
  });
});

describe("areCommunitiesEnemies util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check communities enemy state", () => {
    expect(areCommunitiesEnemies(communities.actor, communities.monolith)).toBe(true);
    expect(areCommunitiesEnemies(communities.monolith, communities.stalker)).toBe(true);
    expect(areCommunitiesEnemies(communities.monster, communities.actor)).toBe(true);
    expect(areCommunitiesEnemies(communities.actor, communities.monster)).toBe(true);
    expect(areCommunitiesEnemies(communities.bandit, communities.bandit)).toBe(false);
    expect(areCommunitiesEnemies(communities.monster, communities.monster)).toBe(false);
    expect(areCommunitiesEnemies(communities.actor, communities.stalker)).toBe(false);
    expect(areCommunitiesEnemies(communities.stalker, communities.actor)).toBe(false);
  });
});

describe("isAnySquadMemberEnemyToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check relation of squad members", () => {
    const { emptyMonolithSquad, neutralSquad, enemySquad, friendlySquad, mixedSquad } = mockRelationsSquads();

    expect(isAnySquadMemberEnemyToActor(emptyMonolithSquad)).toBeFalsy();
    expect(isAnySquadMemberEnemyToActor(neutralSquad)).toBeFalsy();
    expect(isAnySquadMemberEnemyToActor(friendlySquad)).toBeFalsy();
    expect(isAnySquadMemberEnemyToActor(enemySquad)).toBeTruthy();
    expect(isAnySquadMemberEnemyToActor(mixedSquad)).toBeTruthy();
  });
});

describe("isAnySquadMemberFriendToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check relation of squad members", () => {
    const { emptyMonolithSquad, neutralSquad, enemySquad, friendlySquad, mixedSquad } = mockRelationsSquads();

    expect(isAnySquadMemberFriendToActor(emptyMonolithSquad)).toBeFalsy();
    expect(isAnySquadMemberFriendToActor(neutralSquad)).toBeFalsy();
    expect(isAnySquadMemberFriendToActor(enemySquad)).toBeFalsy();
    expect(isAnySquadMemberFriendToActor(friendlySquad)).toBeTruthy();
    expect(isAnySquadMemberFriendToActor(mixedSquad)).toBeTruthy();
  });
});
