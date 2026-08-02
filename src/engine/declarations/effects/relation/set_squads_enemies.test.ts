import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { EGameObjectRelation, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject, registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/relation/set_squads_enemies");
});

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

describe("set_squads_enemies", () => {
  it("should set squad enemies", () => {
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

    const firstAState: IRegistryObjectState = registerObject(MockGameObject.mock({ id: firstA.id }));
    const firstBState: IRegistryObjectState = registerObject(MockGameObject.mock({ id: firstB.id }));
    const secondAState: IRegistryObjectState = registerObject(MockGameObject.mock({ id: secondA.id }));
    const secondBState: IRegistryObjectState = registerObject(MockGameObject.mock({ id: secondB.id }));

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
