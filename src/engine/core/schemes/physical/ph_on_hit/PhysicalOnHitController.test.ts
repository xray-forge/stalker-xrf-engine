import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockVector } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemePhysicalOnHitState } from "@/engine/core/schemes/physical/ph_on_hit/ph_on_hit_types";
import { PhysicalOnHitController } from "@/engine/core/schemes/physical/ph_on_hit/PhysicalOnHitController";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(),
}));

describe("PhysicalOnHitController", () => {
  it("should correctly handle hit callback switch", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemePhysicalOnHitState = mockSchemeState(EScheme.PH_IDLE, {});
    const controller: PhysicalOnHitController = new PhysicalOnHitController(object, schemeState);

    resetFunctionMock(trySwitchToAnotherSection);

    controller.onHit(object, 10, MockVector.mock(1, 2, 3), null, 2);
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(0);

    state.activeScheme = EScheme.PH_ON_HIT;
    state.activeSection = "ph_on_hit@test_section";

    controller.onHit(object, 10, MockVector.mock(1, 2, 3), null, 2);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, schemeState);
  });
});
