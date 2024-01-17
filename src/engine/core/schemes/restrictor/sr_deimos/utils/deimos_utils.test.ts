import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeDeimosState, isDeimosPhaseActive } from "@/engine/core/schemes/restrictor/sr_deimos";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockVector } from "@/fixtures/xray";

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
    state[EScheme.SR_DEIMOS] = mockSchemeState(EScheme.SR_DEIMOS);

    const deimosState: ISchemeDeimosState = state[EScheme.SR_DEIMOS] as ISchemeDeimosState;

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
    state[EScheme.SR_DEIMOS] = mockSchemeState(EScheme.SR_DEIMOS);

    const deimosState: ISchemeDeimosState = state[EScheme.SR_DEIMOS] as ISchemeDeimosState;

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
