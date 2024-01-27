import { beforeEach, describe, expect, it } from "@jest/globals";
import { level, relation_registry } from "xray16";

import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import {
  increaseCommunityGoodwillToId,
  setGameObjectRelation,
  setGoodwillFromCommunityToCommunity,
  setObjectSympathy,
  setRelationFromCommunityToCommunity,
  setServerObjectRelation,
  setSquadRelationToActor,
  setSquadRelationToCommunity,
  setSquadRelationWithObject,
  updateSquadIdRelationToActor,
} from "@/engine/core/utils/relation/relation_set";
import { ERelation } from "@/engine/core/utils/relation/relation_types";
import { communities } from "@/engine/lib/constants/communities";
import { GameObject, ServerCreatureObject, ServerHumanObject, TIndex } from "@/engine/lib/types";
import { mockRegisteredActor, mockRelationsSquads } from "@/fixtures/engine";
import { MockGameObject, mockServerAlifeCreatureAbstract } from "@/fixtures/xray";

describe("setGameObjectRelation util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly set objects relation", () => {
    expect(() => setGameObjectRelation(null, null, ERelation.ENEMY)).toThrow();
    expect(() => setGameObjectRelation(MockGameObject.mock(), null, ERelation.ENEMY)).toThrow();
    expect(() => setGameObjectRelation(null, MockGameObject.mock(), ERelation.ENEMY)).toThrow();

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const third: GameObject = MockGameObject.mock();

    setGameObjectRelation(first, second, ERelation.ENEMY);
    expect(first.force_set_goodwill).toHaveBeenCalledWith(-1000, second);

    setGameObjectRelation(second, third, ERelation.FRIEND);
    expect(second.force_set_goodwill).toHaveBeenCalledWith(1000, third);

    setGameObjectRelation(third, first, ERelation.NEUTRAL);
    expect(third.force_set_goodwill).toHaveBeenCalledWith(0, first);
  });
});

describe("setServerObjectRelation util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly set objects relation", () => {
    expect(() => setServerObjectRelation(null, null, ERelation.ENEMY)).toThrow();
    expect(() => setServerObjectRelation(mockServerAlifeCreatureAbstract(), null, ERelation.ENEMY)).toThrow();
    expect(() => setServerObjectRelation(null, mockServerAlifeCreatureAbstract(), ERelation.ENEMY)).toThrow();

    const first: ServerCreatureObject = mockServerAlifeCreatureAbstract();
    const second: ServerCreatureObject = mockServerAlifeCreatureAbstract();
    const third: ServerCreatureObject = mockServerAlifeCreatureAbstract();

    setServerObjectRelation(first, second, ERelation.ENEMY);
    expect(first.force_set_goodwill).toHaveBeenCalledWith(-1000, second.id);

    setServerObjectRelation(second, third, ERelation.FRIEND);
    expect(second.force_set_goodwill).toHaveBeenCalledWith(1000, third.id);

    setServerObjectRelation(third, first, ERelation.NEUTRAL);
    expect(third.force_set_goodwill).toHaveBeenCalledWith(0, first.id);
  });
});

describe("setGoodwillBetweenCommunities util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly set community goodwill", () => {
    setGoodwillFromCommunityToCommunity(null, communities.actor, 500);
    expect(relation_registry.set_community_relation).not.toHaveBeenCalled();

    setGoodwillFromCommunityToCommunity(communities.none, communities.actor, 500);
    expect(relation_registry.set_community_relation).not.toHaveBeenCalled();

    setGoodwillFromCommunityToCommunity(communities.actor, communities.none, 500);
    expect(relation_registry.set_community_relation).not.toHaveBeenCalled();

    setGoodwillFromCommunityToCommunity(communities.monolith, communities.actor, -500);
    expect(relation_registry.set_community_relation).toHaveBeenCalledWith(
      communities.monolith,
      communities.actor,
      -500
    );
  });
});

describe("setRelationFromCommunityToCommunity util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check relation", () => {
    setRelationFromCommunityToCommunity(null, communities.actor, ERelation.FRIEND);
    expect(relation_registry.set_community_relation).not.toHaveBeenCalled();

    setRelationFromCommunityToCommunity(communities.none, communities.actor, ERelation.FRIEND);
    expect(relation_registry.set_community_relation).not.toHaveBeenCalled();

    setRelationFromCommunityToCommunity(communities.actor, communities.none, ERelation.FRIEND);
    expect(relation_registry.set_community_relation).not.toHaveBeenCalled();

    setRelationFromCommunityToCommunity(communities.monolith, communities.actor, ERelation.FRIEND);
    expect(relation_registry.set_community_relation).toHaveBeenCalledWith(
      communities.monolith,
      communities.actor,
      1000
    );
  });
});

describe("increaseNumberRelationBetweenCommunityAndId util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly check relation", () => {
    increaseCommunityGoodwillToId(null, 400, 500);
    expect(relation_registry.change_community_goodwill).not.toHaveBeenCalled();

    increaseCommunityGoodwillToId(communities.none, 400, 500);
    expect(relation_registry.change_community_goodwill).not.toHaveBeenCalled();

    increaseCommunityGoodwillToId(communities.actor, null, 500);
    expect(relation_registry.change_community_goodwill).not.toHaveBeenCalled();

    increaseCommunityGoodwillToId(communities.monolith, 400, -500);
    expect(relation_registry.change_community_goodwill).toHaveBeenCalledWith(communities.monolith, 400, -500);
  });
});

describe("setObjectSympathy util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly set sympathy", () => {
    const object: GameObject = MockGameObject.mock();

    setObjectSympathy(object, -10);
    setObjectSympathy(object, -0.5);
    setObjectSympathy(object, 0);
    setObjectSympathy(object, 0.1);
    setObjectSympathy(object, 0.5);
    setObjectSympathy(object, 0.9);
    setObjectSympathy(object, 1);
    setObjectSympathy(object, 5);
    setObjectSympathy(object, 10);

    expect(object.set_sympathy).toHaveBeenNthCalledWith(1, 0);
    expect(object.set_sympathy).toHaveBeenNthCalledWith(2, 0);
    expect(object.set_sympathy).toHaveBeenNthCalledWith(3, 0);
    expect(object.set_sympathy).toHaveBeenNthCalledWith(4, 0.1);
    expect(object.set_sympathy).toHaveBeenNthCalledWith(5, 0.5);
    expect(object.set_sympathy).toHaveBeenNthCalledWith(6, 0.9);
    expect(object.set_sympathy).toHaveBeenNthCalledWith(7, 1);
    expect(object.set_sympathy).toHaveBeenNthCalledWith(8, 1);
    expect(object.set_sympathy).toHaveBeenNthCalledWith(9, 1);
  });
});

describe("setSquadRelationToCommunity util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly set squad members relation", () => {
    const { neutralSquad, mixedSquad } = mockRelationsSquads();

    expect(() => setSquadRelationToCommunity(55, communities.bandit, ERelation.ENEMY)).toThrow();
    expect(() => setSquadRelationToCommunity("test", communities.bandit, ERelation.ENEMY)).toThrow();

    setSquadRelationToCommunity(neutralSquad.id, communities.bandit, ERelation.ENEMY);

    for (const member of neutralSquad.squad_members()) {
      expect(level.object_by_id(member.id)?.set_community_goodwill).toHaveBeenCalledWith(communities.bandit, -1000);
    }

    registerStoryLink(mixedSquad.id, "test-sid");
    setSquadRelationToCommunity("test-sid", communities.army, ERelation.FRIEND);

    for (const member of mixedSquad.squad_members()) {
      expect(level.object_by_id(member.id)?.set_community_goodwill).toHaveBeenCalledWith(communities.army, 1000);
    }
  });
});

describe("setSquadRelationWithObject util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly set relation", () => {
    const { neutralSquad, mixedSquad, enemy } = mockRelationsSquads();

    setSquadRelationWithObject(neutralSquad.id, level.object_by_id(enemy.id) as GameObject, ERelation.FRIEND);

    let index: TIndex = 1;

    for (const it of neutralSquad.squad_members()) {
      expect(it.object.force_set_goodwill).toHaveBeenCalledWith(1000, enemy.id);
      expect(registry.simulator.object<ServerHumanObject>(enemy.id)?.force_set_goodwill).toHaveBeenNthCalledWith(
        index++,
        1000,
        it.object.id
      );
    }

    registerStoryLink(mixedSquad.id, "test-sid-mixed");

    const { actorGameObject, actorServerObject } = mockRegisteredActor();

    setSquadRelationWithObject("test-sid-mixed", actorGameObject, ERelation.ENEMY);

    index = 1;

    for (const it of mixedSquad.squad_members()) {
      expect(it.object.force_set_goodwill).toHaveBeenCalledWith(-1000, actorServerObject.id);
      expect(actorServerObject.force_set_goodwill).toHaveBeenNthCalledWith(index++, -1000, it.object.id);
    }
  });
});

describe("updateSquadIdRelationToActor util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly update relation", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => updateSquadIdRelationToActor(55, ERelation.ENEMY)).toThrow();
    expect(() => updateSquadIdRelationToActor("test", ERelation.ENEMY)).toThrow();

    const { neutralSquad, mixedSquad, enemy } = mockRelationsSquads();

    updateSquadIdRelationToActor(neutralSquad.id, ERelation.FRIEND);

    for (const it of neutralSquad.squad_members()) {
      expect(level.object_by_id(it.id)?.force_set_goodwill).toHaveBeenCalledWith(1000, actorGameObject);
    }

    // Remove from level, force offline.
    for (const it of mixedSquad.squad_members()) {
      MockGameObject.REGISTRY.delete(it.id);
    }

    mixedSquad.relationship = ERelation.ENEMY;
    registerStoryLink(mixedSquad.id, "another-sid");
    updateSquadIdRelationToActor("another-sid");

    for (const it of mixedSquad.squad_members()) {
      expect(it.object.force_set_goodwill).toHaveBeenCalledWith(-1000, actorGameObject.id());
    }
  });
});

describe("setSquadRelationToActor util", () => {
  beforeEach(() => registerSimulator());

  it("should correctly update relation", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => updateSquadIdRelationToActor(55, ERelation.ENEMY)).toThrow();
    expect(() => updateSquadIdRelationToActor("test", ERelation.ENEMY)).toThrow();

    const { neutralSquad, mixedSquad, enemy } = mockRelationsSquads();

    setSquadRelationToActor(neutralSquad, ERelation.FRIEND);

    for (const it of neutralSquad.squad_members()) {
      expect(level.object_by_id(it.id)?.force_set_goodwill).toHaveBeenCalledWith(1000, actorGameObject);
    }

    // Remove from level, force offline.
    for (const it of mixedSquad.squad_members()) {
      MockGameObject.REGISTRY.delete(it.id);
    }

    setSquadRelationToActor(mixedSquad, ERelation.ENEMY);

    for (const it of mixedSquad.squad_members()) {
      expect(it.object.force_set_goodwill).toHaveBeenCalledWith(-1000, actorGameObject.id());
    }
  });
});
