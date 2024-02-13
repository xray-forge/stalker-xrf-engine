import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerActorServer, registerSimulator, registerStoryLink } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import {
  areCommunitiesEnemies,
  areCommunitiesFriendly,
  areCommunitiesNeutral,
  isActorEnemyWithFaction,
  isActorFriendWithFaction,
  isActorNeutralWithFaction,
  isAnySquadMemberEnemyToActor,
  isAnySquadMemberFriendToActor,
  isSquadCommunityEnemyToActor,
  isSquadCommunityFriendToActor,
  isSquadCommunityNeutralToActor,
} from "@/engine/core/utils/relation/relation_check";
import { getSquadCommunityRelationToActor } from "@/engine/core/utils/relation/relation_get";
import { communities } from "@/engine/lib/constants/communities";
import { mockRegisteredActor, mockRelationsSquads, MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockAlifeCreatureActor } from "@/fixtures/xray";

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

    registerActorServer(MockAlifeCreatureActor.mock());

    const enemy: Squad = MockSquad.mock();

    enemy.faction = communities.monster;
    registerStoryLink(enemy.id, "existing-enemy");
    expect(isSquadCommunityEnemyToActor("existing-enemy")).toBe(true);

    enemy.faction = communities.stalker;
    expect(isSquadCommunityEnemyToActor("existing-enemy")).toBe(false);
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

    registerActorServer(MockAlifeCreatureActor.mock());

    const enemy: Squad = MockSquad.mock();

    enemy.faction = communities.monster;
    registerStoryLink(enemy.id, "existing-enemy");
    expect(isSquadCommunityFriendToActor("existing-enemy")).toBe(false);

    enemy.faction = communities.stalker;
    expect(isSquadCommunityFriendToActor("existing-enemy")).toBe(false);

    enemy.faction = communities.army;
    expect(isSquadCommunityFriendToActor("existing-enemy")).toBe(true);
  });
});

describe("isSquadCommunityNeutralToActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check relation", () => {
    expect(() => getSquadCommunityRelationToActor("not-existing")).toThrow(
      "Squad with story id 'not-existing' was not found."
    );

    registerActorServer(MockAlifeCreatureActor.mock());

    const enemy: Squad = MockSquad.mock();

    enemy.faction = communities.monster;
    registerStoryLink(enemy.id, "existing-enemy");
    expect(isSquadCommunityNeutralToActor("existing-enemy")).toBe(false);

    enemy.faction = communities.stalker;
    expect(isSquadCommunityNeutralToActor("existing-enemy")).toBe(true);
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
    expect(areCommunitiesFriendly(communities.stalker, communities.none)).toBe(false);
  });
});

describe("areCommunitiesNeutral util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check communities friendly state", () => {
    expect(areCommunitiesNeutral(communities.actor, communities.army)).toBe(false);
    expect(areCommunitiesNeutral(communities.army, communities.actor)).toBe(false);
    expect(areCommunitiesNeutral(communities.bandit, communities.bandit)).toBe(false);
    expect(areCommunitiesNeutral(communities.monster, communities.monster)).toBe(false);
    expect(areCommunitiesNeutral(communities.monster, communities.actor)).toBe(false);
    expect(areCommunitiesNeutral(communities.actor, communities.monster)).toBe(false);
    expect(areCommunitiesNeutral(communities.actor, communities.bandit)).toBe(true);
    expect(areCommunitiesNeutral(communities.actor, communities.dolg)).toBe(true);
    expect(areCommunitiesNeutral(communities.actor, communities.stalker)).toBe(true);
    expect(areCommunitiesNeutral(communities.stalker, communities.actor)).toBe(true);
    expect(areCommunitiesNeutral(communities.stalker, communities.none)).toBe(false);
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
    expect(areCommunitiesEnemies(communities.stalker, communities.none)).toBe(false);
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
