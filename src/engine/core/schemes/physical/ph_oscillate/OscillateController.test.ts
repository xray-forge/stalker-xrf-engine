import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";
import { GameObject, PhysicsJoint, PhysicsShell } from "xray16/alias";
import { TTimestamp } from "xray16/lib";
import { MockGameObject, MockPhysicsJoint, MockPhysicsShell } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { OscillateController } from "@/engine/core/schemes/physical/ph_oscillate/OscillateController";
import { ISchemeOscillateState } from "@/engine/core/schemes/physical/ph_oscillate/ph_oscillate_types";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

const NOW: TTimestamp = 10_000;

function createOscillateState(base: Partial<ISchemeOscillateState> = {}): ISchemeOscillateState {
  return mockSchemeState<ISchemeOscillateState>(EScheme.PH_OSCILLATE, {
    angle: 90,
    force: 200,
    joint: "test_joint",
    period: 1000,
    ...base,
  });
}

/**
 * Attach a physics shell exposing the oscillation joint to the object.
 */
function attachJoint(object: GameObject): PhysicsJoint {
  const shell: PhysicsShell = MockPhysicsShell.mock();
  const joint: PhysicsJoint = MockPhysicsJoint.mock("test_joint");

  jest.spyOn(shell, "get_joint_by_bone_name").mockImplementation(() => joint);
  jest.spyOn(object, "get_physics_shell").mockImplementation(() => shell);

  return joint;
}

describe("OscillateController", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(time_global);
    replaceFunctionMock(time_global, () => NOW);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: OscillateController = new OscillateController(object, createOscillateState());

    expect(controller.time).toBe(0);
    expect(controller.coefficient).toBe(0);
    expect(controller.joint).toBeNull();
    expect(controller.pause).toBe(false);
    expect(controller.dir).not.toBeNull();
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: OscillateController = new OscillateController(object, createOscillateState());
    const joint: PhysicsJoint = attachJoint(object);

    controller.pause = true;
    controller.activate();

    expect(controller.time).toBe(NOW);
    expect(controller.coefficient).toBe(0.2);
    expect(controller.joint).toBe(joint);
    expect(controller.pause).toBe(false);
  });

  it("should apply growing force while period is not reached", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: OscillateController = new OscillateController(object, createOscillateState());

    attachJoint(object);
    controller.activate();

    controller.time = NOW - 500;
    controller.update();

    expect(object.set_const_force).toHaveBeenCalledTimes(1);
    expect(jest.mocked(object.set_const_force).mock.calls[0][1]).toBe(100);
    expect(jest.mocked(object.set_const_force).mock.calls[0][2]).toBe(2);
    expect(controller.pause).toBe(false);
  });

  it("should invert direction and pause once period is reached", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: OscillateController = new OscillateController(object, createOscillateState());

    attachJoint(object);
    controller.activate();

    const previous: number = controller.dir.x;

    controller.time = NOW - 1000;
    controller.update();

    expect(object.set_const_force).not.toHaveBeenCalled();
    expect(controller.pause).toBe(true);
    expect(controller.time).toBe(NOW);
    expect(controller.dir.x).not.toBe(previous);
  });

  it("should wait half of period while paused", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: OscillateController = new OscillateController(object, createOscillateState());

    attachJoint(object);
    controller.activate();

    controller.pause = true;
    controller.time = NOW - 100;
    controller.update();

    expect(object.set_const_force).not.toHaveBeenCalled();
    expect(controller.pause).toBe(true);

    controller.time = NOW - 600;
    controller.update();

    expect(controller.pause).toBe(false);
    expect(object.set_const_force).toHaveBeenCalledTimes(1);
    expect(jest.mocked(object.set_const_force).mock.calls[0][1]).toBe(0);
  });
});
