import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockVector } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeDeimosState, isDeimosPhaseActive } from "@/engine/core/schemes/restrictor/sr_deimos";
import { getSchemeStateOptimistic, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("isDeimosPhase util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should check inactive scheme state", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(isDeimosPhaseActive(object, "disable_bound", true)).toBe(false);
  });

  it("should check growing phase cases", () => {
    const { actorGameObject } = mockRegisteredActor();

    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.activeScheme = EScheme.SR_DEIMOS;
    setSchemeState(state, EScheme.SR_DEIMOS, mockSchemeState(EScheme.SR_DEIMOS));

    const deimosState: ISchemeDeimosState = getSchemeStateOptimistic(state, EScheme.SR_DEIMOS);

    deimosState.growingRate = 1;

    // Check delta.
    deimosState.movementSpeed = 100;
    jest.spyOn(actorGameObject, "get_movement_speed").mockImplementation(() => MockVector.mock(0, 300, 0));

    expect(isDeimosPhaseActive(object, "disable_bound", true)).toBe(false);

    deimosState.movementSpeed = 400;
    jest.spyOn(actorGameObject, "get_movement_speed").mockImplementation(() => MockVector.mock(0, 300, 0));

    deimosState.disableBound = 1.5;
    deimosState.intensity = 2;

    expect(isDeimosPhaseActive(object, "disable_bound", true)).toBe(true);

    deimosState.disableBound = 1.5;
    deimosState.intensity = 1;

    expect(isDeimosPhaseActive(object, "disable_bound", true)).toBe(false);

    deimosState.switchLowerBound = 3;
    deimosState.intensity = 3.1;

    expect(isDeimosPhaseActive(object, "lower_bound", true)).toBe(true);

    deimosState.switchLowerBound = 3;
    deimosState.intensity = 2.9;

    expect(isDeimosPhaseActive(object, "lower_bound", true)).toBe(false);

    deimosState.switchUpperBound = 5;
    deimosState.intensity = 5.2;

    expect(isDeimosPhaseActive(object, "upper_bound", true)).toBe(true);

    deimosState.switchLowerBound = 5;
    deimosState.intensity = 4.8;

    expect(isDeimosPhaseActive(object, "upper_bound", true)).toBe(false);
  });

  it("should check decreasing phase cases", () => {
    const { actorGameObject } = mockRegisteredActor();

    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.activeScheme = EScheme.SR_DEIMOS;
    setSchemeState(state, EScheme.SR_DEIMOS, mockSchemeState(EScheme.SR_DEIMOS));

    const deimosState: ISchemeDeimosState = getSchemeStateOptimistic(state, EScheme.SR_DEIMOS);

    deimosState.growingRate = 1;

    // Check delta.
    deimosState.movementSpeed = 400;
    jest.spyOn(actorGameObject, "get_movement_speed").mockImplementation(() => MockVector.mock(0, 300, 0));

    expect(isDeimosPhaseActive(object, "disable_bound", false)).toBe(false);

    deimosState.movementSpeed = 100;
    jest.spyOn(actorGameObject, "get_movement_speed").mockImplementation(() => MockVector.mock(0, 300, 0));

    deimosState.disableBound = 1.5;
    deimosState.intensity = 2;

    expect(isDeimosPhaseActive(object, "disable_bound", false)).toBe(false);

    deimosState.disableBound = 1.5;
    deimosState.intensity = 1;

    expect(isDeimosPhaseActive(object, "disable_bound", false)).toBe(true);

    deimosState.switchLowerBound = 3;
    deimosState.intensity = 3.1;

    expect(isDeimosPhaseActive(object, "lower_bound", false)).toBe(false);

    deimosState.switchLowerBound = 3;
    deimosState.intensity = 2.9;

    expect(isDeimosPhaseActive(object, "lower_bound", false)).toBe(true);

    deimosState.switchUpperBound = 5;
    deimosState.intensity = 5.2;

    expect(isDeimosPhaseActive(object, "upper_bound", false)).toBe(false);

    deimosState.switchLowerBound = 5;
    deimosState.intensity = 4.8;

    expect(isDeimosPhaseActive(object, "upper_bound", false)).toBe(true);
  });
});
