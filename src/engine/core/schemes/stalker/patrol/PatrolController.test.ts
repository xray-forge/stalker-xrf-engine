import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { range, X_VECTOR, Y_VECTOR, Z_VECTOR, ZERO_VECTOR } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";

import { EPatrolFormation } from "@/engine/core/ai/patrol";
import { EStalkerState } from "@/engine/core/animation/types";
import { PatrolController } from "@/engine/core/schemes/stalker/patrol/PatrolController";
import { resetRegistry } from "@/fixtures/engine";

describe("PatrolController", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const controller: PatrolController = new PatrolController("test");

    expect(controller.name).toBe("test");
    expect(controller.state).toBe(EStalkerState.PATROL);
    expect(controller.formation).toBe(EPatrolFormation.BACK);
    expect(controller.commanderId).toBeNull();
    expect(controller.objects).toEqualLuaTables({});
  });

  it("should handle objects registration limits", () => {
    const controller: PatrolController = new PatrolController("test");

    range(7).forEach(() => controller.registerObject(MockGameObject.mock()));
    expect(controller.objects.length()).toBe(7);

    const extra: GameObject = MockGameObject.mock();

    expect(() => controller.registerObject(extra)).toThrow(
      `Attempt to add more than 7 objects in patrol controller, '${extra.name()}' in 'test'.`
    );
  });

  it("should register objects", () => {
    const controller: PatrolController = new PatrolController("test");
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const third: GameObject = MockGameObject.mock();

    jest.spyOn(controller, "resetFormationPositions").mockImplementation(jest.fn());
    jest.spyOn(third, "alive").mockImplementation(() => false);

    controller.registerObject(first);

    expect(controller.objects.length()).toBe(1);
    expect(controller.objects.get(first.id())).toEqual({ object: first, direction: X_VECTOR, distance: 0 });
    expect(controller.commanderId).toBe(first.id());
    expect(controller.resetFormationPositions).toHaveBeenCalledTimes(1);

    controller.registerObject(first);

    expect(controller.objects.length()).toBe(1);
    expect(controller.resetFormationPositions).toHaveBeenCalledTimes(1);

    controller.registerObject(second);

    expect(controller.objects.length()).toBe(2);
    expect(controller.commanderId).toBe(first.id());
    expect(controller.resetFormationPositions).toHaveBeenCalledTimes(2);

    controller.registerObject(second);

    expect(controller.objects.length()).toBe(2);
    expect(controller.resetFormationPositions).toHaveBeenCalledTimes(2);

    controller.registerObject(third);

    expect(controller.objects.length()).toBe(2);
    expect(controller.resetFormationPositions).toHaveBeenCalledTimes(2);
  });

  it("should unregister objects", () => {
    const controller: PatrolController = new PatrolController("test");
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    jest.spyOn(controller, "resetFormationPositions").mockImplementation(jest.fn());

    controller.registerObject(first);
    controller.registerObject(second);

    expect(controller.objects.length()).toBe(2);
    expect(controller.commanderId).toBe(first.id());
    expect(controller.resetFormationPositions).toHaveBeenCalledTimes(2);

    controller.unregisterObject(first);

    expect(controller.objects.length()).toBe(1);
    expect(controller.commanderId).toBeNull();
    expect(controller.resetFormationPositions).toHaveBeenCalledTimes(3);

    controller.unregisterObject(second);

    expect(controller.objects.length()).toBe(0);
    expect(controller.commanderId).toBeNull();
    expect(controller.resetFormationPositions).toHaveBeenCalledTimes(3);
  });

  it("should correctly set formations", () => {
    const controller: PatrolController = new PatrolController("test");

    jest.spyOn(controller, "resetFormationPositions").mockImplementation(jest.fn());

    expect(controller.formation).toBe(EPatrolFormation.BACK);

    controller.setFormation(EPatrolFormation.AROUND);

    expect(controller.formation).toBe(EPatrolFormation.AROUND);
    expect(controller.resetFormationPositions).toHaveBeenCalledTimes(1);
  });

  it("should correctly reset formation positions", () => {
    const controller: PatrolController = new PatrolController("test");
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const third: GameObject = MockGameObject.mock();

    controller.objects.set(first.id(), { direction: X_VECTOR, distance: 1, object: first });
    controller.objects.set(second.id(), { direction: Y_VECTOR, distance: 2, object: second });
    controller.objects.set(third.id(), { direction: Z_VECTOR, distance: 10, object: third });

    controller.resetFormationPositions();

    expect(controller.commanderId).toBe(first.id());
    expect(controller.objects.get(first.id())).toEqual({ object: first, distance: 0, direction: X_VECTOR });
    expect(controller.objects.get(second.id())).toEqual({
      object: second,
      distance: 1.2,
      direction: MockVector.mock(0.3, 0, -1),
    });
    expect(controller.objects.get(third.id())).toEqual({
      object: third,
      distance: 2.4,
      direction: MockVector.mock(-0.3, 0, -1),
    });
  });

  it("should correctly set commander state", () => {
    const controller: PatrolController = new PatrolController("test");
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    controller.registerObject(first);
    controller.registerObject(second);

    controller.setCommanderState(second, EStalkerState.SNEAK, EPatrolFormation.LINE);

    expect(controller.state).toBe(EStalkerState.PATROL);
    expect(controller.formation).toBe(EPatrolFormation.BACK);
    expect(controller.objects.length()).toBe(2);

    jest.spyOn(second, "alive").mockImplementation(() => false);

    controller.setCommanderState(second, EStalkerState.SNEAK, EPatrolFormation.LINE);

    expect(controller.state).toBe(EStalkerState.PATROL);
    expect(controller.formation).toBe(EPatrolFormation.BACK);
    expect(controller.objects.length()).toBe(1);

    controller.setCommanderState(first, EStalkerState.SNEAK, EPatrolFormation.LINE);

    expect(controller.state).toBe(EStalkerState.SNEAK);
    expect(controller.formation).toBe(EPatrolFormation.LINE);
    expect(controller.objects.length()).toBe(1);
  });

  it("should correctly handle invalid follower target calls", () => {
    const controller: PatrolController = new PatrolController("test");
    const object: GameObject = MockGameObject.mock();

    expect(() => controller.getFollowerTarget(object)).toThrow(
      "Patrol method 'getFollowerTarget' failed without commander, 'test'."
    );

    controller.registerObject(object);

    expect(() => controller.getFollowerTarget(object)).toThrow(
      "Patrol method 'getFollowerTarget' failed in 'test', tried to get commander target."
    );
  });

  it("should correctly get followers targets when far from commander", () => {
    const controller: PatrolController = new PatrolController("test");
    const commander: GameObject = MockGameObject.mock();
    const follower: GameObject = MockGameObject.mock();

    controller.registerObject(commander);
    controller.registerObject(follower);

    jest.spyOn(commander.position(), "distance_to").mockImplementation(() => 0);
    jest.spyOn(commander, "location_on_path").mockImplementation(() => 153);
    jest.spyOn(level, "vertex_in_direction").mockImplementation(() => 164);

    const [vertexId, direction, state] = controller.getFollowerTarget(follower);

    expect(commander.location_on_path).toHaveBeenCalledTimes(1);
    expect(commander.location_on_path).toHaveBeenCalledWith(5, ZERO_VECTOR);
    expect(level.vertex_in_direction).toHaveBeenCalledTimes(2);
    expect(level.vertex_in_direction).toHaveBeenCalledWith(
      255,
      MockVector.mock(-0.4740998230350173, 0, -0.8804710999221754),
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

  it("should correctly get followers targets when far from commander (further)", () => {
    const controller: PatrolController = new PatrolController("test");
    const commander: GameObject = MockGameObject.mock();
    const follower: GameObject = MockGameObject.mock();

    jest.spyOn(commander.position(), "distance_to").mockImplementation(() => 5);
    controller.registerObject(commander);
    controller.registerObject(follower);

    jest.spyOn(commander, "location_on_path").mockImplementation(() => 170);
    jest.spyOn(level, "vertex_in_direction").mockImplementation(() => 210);

    const [vertexId, direction, state] = controller.getFollowerTarget(follower);

    expect(commander.location_on_path).toHaveBeenCalledTimes(1);
    expect(commander.location_on_path).toHaveBeenCalledWith(5, ZERO_VECTOR);
    expect(level.vertex_in_direction).toHaveBeenCalledTimes(2);
    expect(level.vertex_in_direction).toHaveBeenCalledWith(
      255,
      MockVector.mock(-0.4740998230350173, 0, -0.8804710999221754),
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
    const controller: PatrolController = new PatrolController("test");
    const commander: GameObject = MockGameObject.mock();
    const follower: GameObject = MockGameObject.mock();

    jest.spyOn(commander.position(), "distance_to").mockImplementation(() => 0);
    controller.registerObject(commander);
    controller.registerObject(follower);

    jest.spyOn(commander, "location_on_path").mockImplementation(() => 170);
    jest.spyOn(level, "vertex_in_direction").mockImplementation(() => 210);

    controller.objects.get(follower.id()).direction = MockVector.mock(0, 0, 1);

    const [vertexId, direction, state] = controller.getFollowerTarget(follower);

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
