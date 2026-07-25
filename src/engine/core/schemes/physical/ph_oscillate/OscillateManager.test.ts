import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";
import { GameObject, PhysicsJoint, PhysicsShell } from "xray16/alias";
import { TTimestamp } from "xray16/lib";
import { MockGameObject, MockPhysicsJoint, MockPhysicsShell } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { OscillateManager } from "@/engine/core/schemes/physical/ph_oscillate/OscillateManager";
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

describe("OscillateManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(time_global);
    replaceFunctionMock(time_global, () => NOW);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: OscillateManager = new OscillateManager(object, createOscillateState());

    expect(manager.time).toBe(0);
    expect(manager.coefficient).toBe(0);
    expect(manager.joint).toBeNull();
    expect(manager.pause).toBe(false);
    expect(manager.dir).not.toBeNull();
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: OscillateManager = new OscillateManager(object, createOscillateState());
    const joint: PhysicsJoint = attachJoint(object);

    manager.pause = true;
    manager.activate();

    expect(manager.time).toBe(NOW);
    expect(manager.coefficient).toBe(0.2);
    expect(manager.joint).toBe(joint);
    expect(manager.pause).toBe(false);
  });

  it("should apply growing force while period is not reached", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: OscillateManager = new OscillateManager(object, createOscillateState());

    attachJoint(object);
    manager.activate();

    manager.time = NOW - 500;
    manager.update();

    expect(object.set_const_force).toHaveBeenCalledTimes(1);
    expect(jest.mocked(object.set_const_force).mock.calls[0][1]).toBe(100);
    expect(jest.mocked(object.set_const_force).mock.calls[0][2]).toBe(2);
    expect(manager.pause).toBe(false);
  });

  it("should invert direction and pause once period is reached", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: OscillateManager = new OscillateManager(object, createOscillateState());

    attachJoint(object);
    manager.activate();

    const previous: number = manager.dir.x;

    manager.time = NOW - 1000;
    manager.update();

    expect(object.set_const_force).not.toHaveBeenCalled();
    expect(manager.pause).toBe(true);
    expect(manager.time).toBe(NOW);
    expect(manager.dir.x).not.toBe(previous);
  });

  it("should wait half of period while paused", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: OscillateManager = new OscillateManager(object, createOscillateState());

    attachJoint(object);
    manager.activate();

    manager.pause = true;
    manager.time = NOW - 100;
    manager.update();

    expect(object.set_const_force).not.toHaveBeenCalled();
    expect(manager.pause).toBe(true);

    manager.time = NOW - 600;
    manager.update();

    expect(manager.pause).toBe(false);
    expect(object.set_const_force).toHaveBeenCalledTimes(1);
    expect(jest.mocked(object.set_const_force).mock.calls[0][1]).toBe(0);
  });
});
