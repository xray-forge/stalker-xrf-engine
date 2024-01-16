import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { EPatrolFormation } from "@/engine/core/ai/patrol";
import { EStalkerState } from "@/engine/core/animation/types";
import { PatrolManager } from "@/engine/core/schemes/stalker/patrol/PatrolManager";
import { range } from "@/engine/core/utils/number";
import { X_VECTOR, Y_VECTOR, Z_VECTOR, ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockVector } from "@/fixtures/xray";

describe("PatrolManager class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const manager: PatrolManager = new PatrolManager("test");

    expect(manager.name).toBe("test");
    expect(manager.state).toBe(EStalkerState.PATROL);
    expect(manager.formation).toBe(EPatrolFormation.BACK);
    expect(manager.commanderId).toBeNull();
    expect(manager.objects).toEqualLuaTables({});
  });

  it("should handle objects registration limits", () => {
    const manager: PatrolManager = new PatrolManager("test");

    range(6).forEach(() => manager.registerObject(MockGameObject.mock()));

    expect(() => manager.registerObject(MockGameObject.mock())).toThrow(
      "Attempt to add more than 7 objects in patrol manager, 'section_1006' in 'test'."
    );
  });

  it("should register objects", () => {
    const manager: PatrolManager = new PatrolManager("test");
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const third: GameObject = MockGameObject.mock();

    jest.spyOn(manager, "resetFormationPositions").mockImplementation(jest.fn());
    jest.spyOn(third, "alive").mockImplementation(() => false);

    manager.registerObject(first);

    expect(manager.objects.length()).toBe(1);
    expect(manager.objects.get(first.id())).toEqual({ object: first, direction: X_VECTOR, distance: 0 });
    expect(manager.commanderId).toBe(first.id());
    expect(manager.resetFormationPositions).toHaveBeenCalledTimes(1);

    manager.registerObject(first);

    expect(manager.objects.length()).toBe(1);
    expect(manager.resetFormationPositions).toHaveBeenCalledTimes(1);

    manager.registerObject(second);

    expect(manager.objects.length()).toBe(2);
    expect(manager.commanderId).toBe(first.id());
    expect(manager.resetFormationPositions).toHaveBeenCalledTimes(2);

    manager.registerObject(second);

    expect(manager.objects.length()).toBe(2);
    expect(manager.resetFormationPositions).toHaveBeenCalledTimes(2);

    manager.registerObject(third);

    expect(manager.objects.length()).toBe(2);
    expect(manager.resetFormationPositions).toHaveBeenCalledTimes(2);
  });

  it("should unregister objects", () => {
    const manager: PatrolManager = new PatrolManager("test");
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    jest.spyOn(manager, "resetFormationPositions").mockImplementation(jest.fn());

    manager.registerObject(first);
    manager.registerObject(second);

    expect(manager.objects.length()).toBe(2);
    expect(manager.commanderId).toBe(first.id());
    expect(manager.resetFormationPositions).toHaveBeenCalledTimes(2);

    manager.unregisterObject(first);

    expect(manager.objects.length()).toBe(1);
    expect(manager.commanderId).toBeNull();
    expect(manager.resetFormationPositions).toHaveBeenCalledTimes(3);

    manager.unregisterObject(second);

    expect(manager.objects.length()).toBe(0);
    expect(manager.commanderId).toBeNull();
    expect(manager.resetFormationPositions).toHaveBeenCalledTimes(3);
  });

  it("should correctly set formations", () => {
    const manager: PatrolManager = new PatrolManager("test");

    jest.spyOn(manager, "resetFormationPositions").mockImplementation(jest.fn());

    expect(manager.formation).toBe(EPatrolFormation.BACK);

    manager.setFormation(EPatrolFormation.AROUND);

    expect(manager.formation).toBe(EPatrolFormation.AROUND);
    expect(manager.resetFormationPositions).toHaveBeenCalledTimes(1);
  });

  it("should correctly reset formation positions", () => {
    const manager: PatrolManager = new PatrolManager("test");
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const third: GameObject = MockGameObject.mock();

    manager.objects.set(first.id(), { direction: X_VECTOR, distance: 1, object: first });
    manager.objects.set(second.id(), { direction: Y_VECTOR, distance: 2, object: second });
    manager.objects.set(third.id(), { direction: Z_VECTOR, distance: 10, object: third });

    manager.resetFormationPositions();

    expect(manager.commanderId).toBe(first.id());
    expect(manager.objects.get(first.id())).toEqual({ object: first, distance: 0, direction: X_VECTOR });
    expect(manager.objects.get(second.id())).toEqual({
      object: second,
      distance: 1.2,
      direction: MockVector.mock(0.3, 0, -1),
    });
    expect(manager.objects.get(third.id())).toEqual({
      object: third,
      distance: 2.4,
      direction: MockVector.mock(-0.3, 0, -1),
    });
  });

  it("should correctly set commander state", () => {
    const manager: PatrolManager = new PatrolManager("test");
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    manager.registerObject(first);
    manager.registerObject(second);

    manager.setCommanderState(second, EStalkerState.SNEAK, EPatrolFormation.LINE);

    expect(manager.state).toBe(EStalkerState.PATROL);
    expect(manager.formation).toBe(EPatrolFormation.BACK);
    expect(manager.objects.length()).toBe(2);

    jest.spyOn(second, "alive").mockImplementation(() => false);

    manager.setCommanderState(second, EStalkerState.SNEAK, EPatrolFormation.LINE);

    expect(manager.state).toBe(EStalkerState.PATROL);
    expect(manager.formation).toBe(EPatrolFormation.BACK);
    expect(manager.objects.length()).toBe(1);

    manager.setCommanderState(first, EStalkerState.SNEAK, EPatrolFormation.LINE);

    expect(manager.state).toBe(EStalkerState.SNEAK);
    expect(manager.formation).toBe(EPatrolFormation.LINE);
    expect(manager.objects.length()).toBe(1);
  });

  it("should correctly handle invalid follower target calls", () => {
    const manager: PatrolManager = new PatrolManager("test");
    const object: GameObject = MockGameObject.mock();

    expect(() => manager.getFollowerTarget(object)).toThrow(
      "Patrol method 'getFollowerTarget' failed without commander, 'test'."
    );

    manager.registerObject(object);

    expect(() => manager.getFollowerTarget(object)).toThrow(
      "Patrol method 'getFollowerTarget' failed in 'test', tried to get commander target."
    );
  });

  it("should correctly get followers targets when far from commander", () => {
    const manager: PatrolManager = new PatrolManager("test");
    const commander: GameObject = MockGameObject.mock();
    const follower: GameObject = MockGameObject.mock();

    manager.registerObject(commander);
    manager.registerObject(follower);

    jest.spyOn(commander.position(), "distance_to").mockImplementation(() => 0);
    jest.spyOn(commander, "location_on_path").mockImplementation(() => 153);
    jest.spyOn(level, "vertex_in_direction").mockImplementation(() => 164);

    const [vertexId, direction, state] = manager.getFollowerTarget(follower);

    expect(commander.location_on_path).toHaveBeenCalledTimes(1);
    expect(commander.location_on_path).toHaveBeenCalledWith(5, ZERO_VECTOR);
    expect(level.vertex_in_direction).toHaveBeenCalledTimes(2);
    expect(level.vertex_in_direction).toHaveBeenCalledWith(
      255,
      MockVector.mock(-0.4740963404872094, 0, -0.8804729751313416),
      1.2
    );
    expect(level.vertex_in_direction).toHaveBeenCalledWith(
      164,
      MockVector.mock(0.7071067811865476, 0, 0.7071067811865476),
      2
    );

    expect(vertexId).toBe(164);
    expect(direction).toEqual(MockVector.mock(0.7071067811865476, 0, 0.7071067811865476));
    expect(state).toBe(EStalkerState.PATROL);
  });

  it("should correctly get followers targets when far from commander", () => {
    const manager: PatrolManager = new PatrolManager("test");
    const commander: GameObject = MockGameObject.mock();
    const follower: GameObject = MockGameObject.mock();

    jest.spyOn(commander.position(), "distance_to").mockImplementation(() => 5);
    manager.registerObject(commander);
    manager.registerObject(follower);

    jest.spyOn(commander, "location_on_path").mockImplementation(() => 170);
    jest.spyOn(level, "vertex_in_direction").mockImplementation(() => 210);

    const [vertexId, direction, state] = manager.getFollowerTarget(follower);

    expect(commander.location_on_path).toHaveBeenCalledTimes(1);
    expect(commander.location_on_path).toHaveBeenCalledWith(5, ZERO_VECTOR);
    expect(level.vertex_in_direction).toHaveBeenCalledTimes(2);
    expect(level.vertex_in_direction).toHaveBeenCalledWith(
      255,
      MockVector.mock(-0.4740963404872094, 0, -0.8804729751313416),
      1.2
    );
    expect(level.vertex_in_direction).toHaveBeenCalledWith(
      210,
      MockVector.mock(0.7071067811865476, 0, 0.7071067811865476),
      2
    );

    expect(vertexId).toBe(210);
    expect(direction).toEqual(MockVector.mock(0.7071067811865476, 0, 0.7071067811865476));
    expect(state).toBe(EStalkerState.RUSH);
  });

  it("should correctly get followers targets when on another side", () => {
    const manager: PatrolManager = new PatrolManager("test");
    const commander: GameObject = MockGameObject.mock();
    const follower: GameObject = MockGameObject.mock();

    jest.spyOn(commander.position(), "distance_to").mockImplementation(() => 0);
    manager.registerObject(commander);
    manager.registerObject(follower);

    jest.spyOn(commander, "location_on_path").mockImplementation(() => 170);
    jest.spyOn(level, "vertex_in_direction").mockImplementation(() => 210);

    manager.objects.get(follower.id()).direction = MockVector.mock(0, 0, 1);

    const [vertexId, direction, state] = manager.getFollowerTarget(follower);

    expect(commander.location_on_path).toHaveBeenCalledTimes(1);
    expect(commander.location_on_path).toHaveBeenCalledWith(5, ZERO_VECTOR);
    expect(level.vertex_in_direction).toHaveBeenCalledTimes(2);
    expect(level.vertex_in_direction).toHaveBeenCalledWith(
      255,
      MockVector.mock(0.7071067811865476, 0, 0.7071067811865476),
      1.2
    );
    expect(level.vertex_in_direction).toHaveBeenCalledWith(
      210,
      MockVector.mock(0.7071067811865476, 0, 0.7071067811865476),
      2
    );

    expect(vertexId).toBe(210);
    expect(direction).toEqual(MockVector.mock(0.7071067811865476, 0, 0.7071067811865476));
    expect(state).toBe(EStalkerState.PATROL);
  });
});
