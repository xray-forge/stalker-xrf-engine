import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hit } from "xray16";
import { GameObject, Hit } from "xray16/alias";
import { MockGameObject, MockVector } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { ISchemePhysicalHitState } from "@/engine/core/schemes/physical/ph_hit/ph_hit_types";
import { PhysicalHitController } from "@/engine/core/schemes/physical/ph_hit/PhysicalHitController";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, patrols, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(),
}));

function createHitState(base: Partial<ISchemePhysicalHitState> = {}): ISchemePhysicalHitState {
  return mockSchemeState<ISchemePhysicalHitState>(EScheme.PH_HIT, {
    bone: "bone_test",
    dirPath: "test-wp",
    impulse: 20,
    power: 5,
    ...base,
  });
}

describe("PhysicalHitController", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
  });

  it("should correctly hit object towards first patrol point on activation", () => {
    const object: GameObject = MockGameObject.mock({ position: MockVector.create(1, 1, 1) });
    const controller: PhysicalHitController = new PhysicalHitController(object, createHitState());

    controller.activate();

    expect(object.hit).toHaveBeenCalledTimes(1);

    const objectHit: Hit = jest.mocked(object.hit).mock.calls[0][0];

    expect(objectHit.power).toBe(5);
    expect(objectHit.impulse).toBe(20);
    expect(objectHit.type).toBe(hit.strike);
    expect(objectHit.draftsman).toBe(object);
    expect(objectHit.bone).toHaveBeenCalledWith("bone_test");
    expect(objectHit.direction).toEqual(
      MockVector.create(0, 0, 0).set(patrols["test-wp"].points[0].position).sub(object.position())
    );
  });

  it("should correctly try switching section on update", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalHitState = createHitState();
    const controller: PhysicalHitController = new PhysicalHitController(object, state);

    controller.update();

    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, state);
  });
});
