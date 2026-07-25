import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { ISchemePhysicalForceState } from "@/engine/core/schemes/physical/ph_force/ph_force_types";
import { PhysicalForceManager } from "@/engine/core/schemes/physical/ph_force/PhysicalForceManager";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(() => false),
}));

function createForceState(base: Partial<ISchemePhysicalForceState> = {}): ISchemePhysicalForceState {
  return mockSchemeState<ISchemePhysicalForceState>(EScheme.PH_FORCE, {
    delay: 0,
    force: 100,
    point: MockVector.create(10, 0, 0),
    time: 2000,
    ...base,
  });
}

describe("PhysicalForceManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
    replaceFunctionMock(trySwitchToAnotherSection, () => false);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: PhysicalForceManager = new PhysicalForceManager(object, createForceState());

    expect(manager.time).toBe(0);
    expect(manager.process).toBe(false);
  });

  it("should correctly activate without delay", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: PhysicalForceManager = new PhysicalForceManager(object, createForceState());

    manager.process = true;
    manager.activate();

    expect(manager.time).toBe(0);
    expect(manager.process).toBe(false);
  });

  it("should correctly activate with delay", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: PhysicalForceManager = new PhysicalForceManager(object, createForceState({ delay: 500 }));

    manager.activate();

    expect(manager.time).toBe(time_global() + 500);
    expect(manager.process).toBe(false);
  });

  it("should not apply force when switching to another section", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: PhysicalForceManager = new PhysicalForceManager(object, createForceState());

    replaceFunctionMock(trySwitchToAnotherSection, () => true);

    manager.update();

    expect(object.set_const_force).not.toHaveBeenCalled();
    expect(manager.process).toBe(false);
  });

  it("should apply force only once", () => {
    const object: GameObject = MockGameObject.mock({ position: MockVector.create(1, 0, 0) });
    const manager: PhysicalForceManager = new PhysicalForceManager(object, createForceState());

    manager.activate();
    manager.update();

    expect(manager.process).toBe(true);
    expect(object.set_const_force).toHaveBeenCalledTimes(1);

    const [direction, force, duration] = jest.mocked(object.set_const_force).mock.calls[0];

    expect(direction).toEqual(MockVector.create(1, 0, 0));
    expect(force).toBe(100);
    expect(duration).toBe(2000);

    manager.update();

    expect(object.set_const_force).toHaveBeenCalledTimes(1);
  });

  it("should wait for delay before applying force", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: PhysicalForceManager = new PhysicalForceManager(object, createForceState({ delay: 500 }));

    manager.activate();
    manager.update();

    expect(object.set_const_force).not.toHaveBeenCalled();
    expect(manager.process).toBe(false);

    manager.time = time_global() - 1;
    manager.update();

    expect(object.set_const_force).toHaveBeenCalledTimes(1);
    expect(manager.process).toBe(true);
  });
});
