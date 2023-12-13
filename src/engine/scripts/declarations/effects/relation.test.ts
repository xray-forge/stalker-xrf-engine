import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject, registerSimulator, registerStoryLink } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import {
  EGoodwill,
  ERelation,
  increaseCommunityGoodwillToId,
  setObjectSympathy,
  setSquadRelationToActor,
  setSquadRelationWithObject,
  updateSquadIdRelationToActor,
} from "@/engine/core/utils/relation";
import { EGameObjectRelation, GameObject, ServerHumanObject } from "@/engine/lib/types";
import { callXrEffect, checkXrEffect, MockSquad, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockAlifeHumanStalker, MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/relation");

describe("relation effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/relation");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("actor_friend");
    checkXrEffect("actor_neutral");
    checkXrEffect("actor_enemy");
    checkXrEffect("set_squad_neutral_to_actor");
    checkXrEffect("set_squad_friend_to_actor");
    checkXrEffect("set_squad_enemy_to_actor");
    checkXrEffect("set_npc_sympathy");
    checkXrEffect("set_squad_goodwill");
    checkXrEffect("set_squad_goodwill_to_npc");
    checkXrEffect("inc_faction_goodwill_to_actor");
    checkXrEffect("dec_faction_goodwill_to_actor");
    checkXrEffect("set_squads_enemies");
  });
});

describe("relation effects implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/relation");
  });

  beforeEach(() => {
    resetRegistry();

    resetFunctionMock(setSquadRelationToActor);
    resetFunctionMock(setSquadRelationWithObject);
    resetFunctionMock(setObjectSympathy);
    resetFunctionMock(updateSquadIdRelationToActor);
    resetFunctionMock(increaseCommunityGoodwillToId);

    registerSimulator();
  });

  it("actor_friend should set object goodwill", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    callXrEffect("actor_friend", actor, object);

    expect(object.force_set_goodwill).toHaveBeenCalledTimes(1);
    expect(object.force_set_goodwill).toHaveBeenCalledWith(EGoodwill.FRIENDS, actor);
  });

  it("actor_neutral should set object goodwill", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    callXrEffect("actor_neutral", actor, object);

    expect(object.force_set_goodwill).toHaveBeenCalledTimes(1);
    expect(object.force_set_goodwill).toHaveBeenCalledWith(EGoodwill.NEUTRALS, actor);
  });

  it("actor_enemy should set object goodwill", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    callXrEffect("actor_enemy", actor, object);

    expect(object.force_set_goodwill).toHaveBeenCalledTimes(1);
    expect(object.force_set_goodwill).toHaveBeenCalledWith(EGoodwill.ENEMIES, actor);
  });

  it("set_squad_neutral_to_actor should change relation", () => {
    const squad: Squad = MockSquad.mock();

    registerStoryLink(squad.id, "test-sid");

    expect(() => {
      callXrEffect(
        "set_squad_neutral_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-not-existing"
      );
    }).not.toThrow();

    callXrEffect("set_squad_neutral_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(setSquadRelationToActor).toHaveBeenCalledTimes(1);
    expect(setSquadRelationToActor).toHaveBeenCalledWith(squad, ERelation.NEUTRAL);
  });

  it("set_squad_friend_to_actor should change relation", () => {
    const squad: Squad = MockSquad.mock();

    registerStoryLink(squad.id, "test-sid");

    expect(() => {
      callXrEffect("set_squad_friend_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), "test-not-existing");
    }).not.toThrow();

    callXrEffect("set_squad_friend_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(setSquadRelationToActor).toHaveBeenCalledTimes(1);
    expect(setSquadRelationToActor).toHaveBeenCalledWith(squad, ERelation.FRIEND);
  });

  it("set_squad_enemy_to_actor should change relation", () => {
    const squad: Squad = MockSquad.mock();

    registerStoryLink(squad.id, "test-sid");

    expect(() => {
      callXrEffect("set_squad_enemy_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), "test-not-existing");
    }).not.toThrow();

    callXrEffect("set_squad_enemy_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(setSquadRelationToActor).toHaveBeenCalledTimes(1);
    expect(setSquadRelationToActor).toHaveBeenCalledWith(squad, ERelation.ENEMY);
  });

  it("set_npc_sympathy should change relation", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_npc_sympathy", MockGameObject.mockActor(), object, 550);

    expect(setObjectSympathy).toHaveBeenCalledTimes(1);
    expect(setObjectSympathy).toHaveBeenCalledWith(object, 550);
  });

  it("set_squad_goodwill should change squad relation to actor", () => {
    callXrEffect("set_squad_goodwill", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", ERelation.FRIEND);

    expect(updateSquadIdRelationToActor).toHaveBeenCalledTimes(1);
    expect(updateSquadIdRelationToActor).toHaveBeenCalledWith("test-sid", ERelation.FRIEND);
  });

  it("set_squad_goodwill_to_npc should change relation to an object", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_squad_goodwill_to_npc", MockGameObject.mockActor(), object, "test-sid", ERelation.FRIEND);

    expect(setSquadRelationWithObject).toHaveBeenCalledTimes(1);
    expect(setSquadRelationWithObject).toHaveBeenCalledWith("test-sid", object, ERelation.FRIEND);
  });

  it("inc_faction_goodwill_to_actor should increment faction goodwill", () => {
    expect(() => {
      callXrEffect("inc_faction_goodwill_to_actor", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow("Wrong parameters in effect 'inc_faction_goodwill_to_actor'.");

    callXrEffect(
      "inc_faction_goodwill_to_actor",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "community_test",
      400
    );

    expect(increaseCommunityGoodwillToId).toHaveBeenCalledTimes(1);
    expect(increaseCommunityGoodwillToId).toHaveBeenCalledWith("community_test", 0, 400);
  });

  it("dec_faction_goodwill_to_actor should decrement faction goodwill", () => {
    expect(() => {
      callXrEffect("dec_faction_goodwill_to_actor", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow("Wrong parameters in effect 'dec_faction_goodwill_to_actor'.");

    callXrEffect(
      "dec_faction_goodwill_to_actor",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "community_test",
      400
    );

    expect(increaseCommunityGoodwillToId).toHaveBeenCalledTimes(1);
    expect(increaseCommunityGoodwillToId).toHaveBeenCalledWith("community_test", 0, -400);
  });

  it("set_squads_enemies should set squad enemies", () => {
    const first: MockSquad = MockSquad.mock();
    const second: MockSquad = MockSquad.mock();

    const firstA: ServerHumanObject = MockAlifeHumanStalker.mock();
    const firstB: ServerHumanObject = MockAlifeHumanStalker.mock();
    const secondA: ServerHumanObject = MockAlifeHumanStalker.mock();
    const secondB: ServerHumanObject = MockAlifeHumanStalker.mock();

    first.mockAddMember(firstA);
    first.mockAddMember(firstB);
    second.mockAddMember(secondA);
    second.mockAddMember(secondB);

    const firstAState: IRegistryObjectState = registerObject(MockGameObject.mock({ idOverride: firstA.id }));
    const firstBState: IRegistryObjectState = registerObject(MockGameObject.mock({ idOverride: firstB.id }));
    const secondAState: IRegistryObjectState = registerObject(MockGameObject.mock({ idOverride: secondA.id }));
    const secondBState: IRegistryObjectState = registerObject(MockGameObject.mock({ idOverride: secondB.id }));

    expect(() => {
      callXrEffect("set_squads_enemies", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow("Wrong parameters in effect set_squad_enemies.");

    expect(() => {
      callXrEffect("set_squads_enemies", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-a", "test-sid-b");
    }).toThrow("There is no squad with story id 'test-sid-a'.");

    registerStoryLink(first.id, "test-sid-a");

    expect(() => {
      callXrEffect("set_squads_enemies", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-a", "test-sid-b");
    }).toThrow("There is no squad with story id 'test-sid-b'.");

    registerStoryLink(second.id, "test-sid-b");

    callXrEffect("set_squads_enemies", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-a", "test-sid-b");

    expect(firstAState.object.set_relation).toHaveBeenCalledTimes(2);
    expect(firstAState.object.set_relation).toHaveBeenCalledWith(EGameObjectRelation.ENEMY, secondAState.object);
    expect(firstAState.object.set_relation).toHaveBeenCalledWith(EGameObjectRelation.ENEMY, secondBState.object);
    expect(firstBState.object.set_relation).toHaveBeenCalledTimes(2);
    expect(firstBState.object.set_relation).toHaveBeenCalledWith(EGameObjectRelation.ENEMY, secondAState.object);
    expect(firstBState.object.set_relation).toHaveBeenCalledWith(EGameObjectRelation.ENEMY, secondBState.object);

    expect(secondAState.object.set_relation).toHaveBeenCalledTimes(2);
    expect(secondAState.object.set_relation).toHaveBeenCalledWith(EGameObjectRelation.ENEMY, firstAState.object);
    expect(secondAState.object.set_relation).toHaveBeenCalledWith(EGameObjectRelation.ENEMY, firstBState.object);
    expect(secondBState.object.set_relation).toHaveBeenCalledTimes(2);
    expect(secondBState.object.set_relation).toHaveBeenCalledWith(EGameObjectRelation.ENEMY, firstAState.object);
    expect(secondBState.object.set_relation).toHaveBeenCalledWith(EGameObjectRelation.ENEMY, firstBState.object);
  });
});
