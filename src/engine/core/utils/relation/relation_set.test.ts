import { beforeEach, describe, expect, it } from "@jest/globals";
import { level, relation_registry } from "xray16";

import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import {
  increaseCommunityGoodwillToId,
  setClientObjectRelation,
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
import { ClientObject, ServerCreatureObject, ServerHumanObject, TIndex } from "@/engine/lib/types";
import { mockRegisteredActor, mockRelationsSquads } from "@/fixtures/engine";
import {
  CLIENT_SIDE_REGISTRY,
  mockClientGameObject,
  mockServerAlifeCreatureAbstract,
} from "@/fixtures/xray";

describe("relation/set utils", () => {
  beforeEach(() => registerSimulator());

  it("setClientObjectRelation should correctly set objects relation", () => {
    expect(() => setClientObjectRelation(null, null, ERelation.ENEMY)).toThrow();
    expect(() => setClientObjectRelation(mockClientGameObject(), null, ERelation.ENEMY)).toThrow();
    expect(() => setClientObjectRelation(null, mockClientGameObject(), ERelation.ENEMY)).toThrow();

    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();
    const third: ClientObject = mockClientGameObject();

    setClientObjectRelation(first, second, ERelation.ENEMY);
    expect(first.force_set_goodwill).toHaveBeenCalledWith(-1000, second);

    setClientObjectRelation(second, third, ERelation.FRIEND);
    expect(second.force_set_goodwill).toHaveBeenCalledWith(1000, third);

    setClientObjectRelation(third, first, ERelation.NEUTRAL);
    expect(third.force_set_goodwill).toHaveBeenCalledWith(0, first);
  });

  it("setServerObjectRelation should correctly set objects relation", () => {
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

  it("setGoodwillBetweenCommunities should correctly set community goodwill", () => {
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

  it("setRelationFromCommunityToCommunity should correctly check relation", () => {
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

  it("increaseNumberRelationBetweenCommunityAndId should correctly check relation", () => {
    increaseCommunityGoodwillToId(null, 400, 500);
    expect(relation_registry.change_community_goodwill).not.toHaveBeenCalled();

    increaseCommunityGoodwillToId(communities.none, 400, 500);
    expect(relation_registry.change_community_goodwill).not.toHaveBeenCalled();

    increaseCommunityGoodwillToId(communities.actor, null, 500);
    expect(relation_registry.change_community_goodwill).not.toHaveBeenCalled();

    increaseCommunityGoodwillToId(communities.monolith, 400, -500);
    expect(relation_registry.change_community_goodwill).toHaveBeenCalledWith(communities.monolith, 400, -500);
  });

  it("setObjectSympathy should correctly set sympathy", () => {
    const object: ClientObject = mockClientGameObject();

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

  it("setSquadRelationToCommunity should correctly set squad members relation", () => {
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

  it("setSquadRelationWithObject should correctly set relation", () => {
    const { neutralSquad, mixedSquad, enemy } = mockRelationsSquads();

    setSquadRelationWithObject(neutralSquad.id, level.object_by_id(enemy.id) as ClientObject, ERelation.FRIEND);

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

    const { actorClientObject, actorServerObject } = mockRegisteredActor();

    setSquadRelationWithObject("test-sid-mixed", actorClientObject, ERelation.ENEMY);

    index = 1;

    for (const it of mixedSquad.squad_members()) {
      expect(it.object.force_set_goodwill).toHaveBeenCalledWith(-1000, actorServerObject.id);
      expect(actorServerObject.force_set_goodwill).toHaveBeenNthCalledWith(index++, -1000, it.object.id);
    }
  });

  it("updateSquadIdRelationToActor should correctly update relation", () => {
    const { actorClientObject } = mockRegisteredActor();

    expect(() => updateSquadIdRelationToActor(55, ERelation.ENEMY)).toThrow();
    expect(() => updateSquadIdRelationToActor("test", ERelation.ENEMY)).toThrow();

    const { neutralSquad, mixedSquad, enemy } = mockRelationsSquads();

    updateSquadIdRelationToActor(neutralSquad.id, ERelation.FRIEND);

    for (const it of neutralSquad.squad_members()) {
      expect(level.object_by_id(it.id)?.force_set_goodwill).toHaveBeenCalledWith(1000, actorClientObject);
    }

    // Remove from level, force offline.
    for (const it of mixedSquad.squad_members()) {
      CLIENT_SIDE_REGISTRY.delete(it.id);
    }

    mixedSquad.relationship = ERelation.ENEMY;
    registerStoryLink(mixedSquad.id, "another-sid");
    updateSquadIdRelationToActor("another-sid");

    for (const it of mixedSquad.squad_members()) {
      expect(it.object.force_set_goodwill).toHaveBeenCalledWith(-1000, actorClientObject.id());
    }
  });

  it("setSquadRelationToActor should correctly update relation", () => {
    const { actorClientObject } = mockRegisteredActor();

    expect(() => updateSquadIdRelationToActor(55, ERelation.ENEMY)).toThrow();
    expect(() => updateSquadIdRelationToActor("test", ERelation.ENEMY)).toThrow();

    const { neutralSquad, mixedSquad, enemy } = mockRelationsSquads();

    setSquadRelationToActor(neutralSquad, ERelation.FRIEND);

    for (const it of neutralSquad.squad_members()) {
      expect(level.object_by_id(it.id)?.force_set_goodwill).toHaveBeenCalledWith(1000, actorClientObject);
    }

    // Remove from level, force offline.
    for (const it of mixedSquad.squad_members()) {
      CLIENT_SIDE_REGISTRY.delete(it.id);
    }

    setSquadRelationToActor(mixedSquad, ERelation.ENEMY);

    for (const it of mixedSquad.squad_members()) {
      expect(it.object.force_set_goodwill).toHaveBeenCalledWith(-1000, actorClientObject.id());
    }
  });
});
