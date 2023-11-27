import { describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemePhysicalOnHitState } from "@/engine/core/schemes/physical/ph_on_hit/ph_on_hit_types";
import { PhysicalOnHitManager } from "@/engine/core/schemes/physical/ph_on_hit/PhysicalOnHitManager";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

jest.mock("@/engine/core/utils/scheme/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(),
}));

describe("PhysicalOnHitManager", () => {
  it("should correctly handle hit callback switch", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemePhysicalOnHitState = mockSchemeState(EScheme.PH_IDLE, {});
    const manager: PhysicalOnHitManager = new PhysicalOnHitManager(object, schemeState);

    resetFunctionMock(trySwitchToAnotherSection);

    manager.onHit(object, 10, MockVector.mock(1, 2, 3), null, 2);
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(0);

    state.activeScheme = EScheme.PH_ON_HIT;
    state.activeSection = "ph_on_hit@test_section";

    manager.onHit(object, 10, MockVector.mock(1, 2, 3), null, 2);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, schemeState);
  });
});
