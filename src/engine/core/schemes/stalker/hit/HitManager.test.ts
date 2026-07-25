import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ZERO_VECTOR } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit/hit_types";
import { HitManager } from "@/engine/core/schemes/stalker/hit/HitManager";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(() => false),
}));

function createManager(): {
  manager: HitManager;
  object: GameObject;
  registryState: IRegistryObjectState;
  state: ISchemeHitState;
} {
  const object: GameObject = MockGameObject.mock();
  const registryState: IRegistryObjectState = registerObject(object);
  const state: ISchemeHitState = mockSchemeState(EScheme.HIT);

  setSchemeState(registryState, EScheme.HIT, state);

  return { manager: new HitManager(object, state), object, registryState, state };
}

describe("HitManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
    replaceFunctionMock(trySwitchToAnotherSection, () => false);
  });

  it("should ignore zero damage hits on vulnerable objects", () => {
    const { manager, object, state } = createManager();

    manager.onHit(object, 0, ZERO_VECTOR, MockGameObject.mock(), 3);

    expect(state.boneIndex).toBe(3);
    expect(state.who).toBeUndefined();
    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();
  });

  it("should process zero damage hits on invulnerable objects", () => {
    const { manager, object, state } = createManager();
    const who: GameObject = MockGameObject.mock();

    jest.spyOn(object, "invulnerable").mockImplementation(() => true);

    manager.onHit(object, 0, ZERO_VECTOR, who, 3);

    expect(state.who).toBe(who.id());
  });

  it("should record unknown hit source", () => {
    const { manager, object, state } = createManager();

    manager.onHit(object, 10, ZERO_VECTOR, null, 1);

    expect(state.who).toBe(-1);
  });

  it("should not switch section without active scheme", () => {
    const { manager, object } = createManager();

    manager.onHit(object, 10, ZERO_VECTOR, MockGameObject.mock(), 1);

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();
  });

  it("should try switching section for non deadly hit", () => {
    const { manager, object, registryState, state } = createManager();

    registryState.activeScheme = EScheme.HIT;
    jest.spyOn(manager.object, "health", "get").mockImplementation(() => 1);

    manager.onHit(object, 10, ZERO_VECTOR, MockGameObject.mock(), 1);

    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, state);
    expect(state.isDeadlyHit).toBe(false);
  });

  it("should reset deadly hit flag after switching section", () => {
    const { manager, object, registryState, state } = createManager();

    registryState.activeScheme = EScheme.HIT;
    replaceFunctionMock(trySwitchToAnotherSection, () => true);

    manager.onHit(object, 1000, ZERO_VECTOR, MockGameObject.mock(), 1);

    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
    expect(state.isDeadlyHit).toBe(false);
  });
});
