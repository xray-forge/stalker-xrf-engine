import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { registerObject } from "@/engine/core/database";
import { ISchemePhysicalOnDeathState } from "@/engine/core/schemes/physical/ph_on_death/ph_on_death_types";
import { PhysicalDeathController } from "@/engine/core/schemes/physical/ph_on_death/PhysicalDeathController";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(),
}));

describe("PhysicalDeathController", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
  });

  it("should not switch section on death without active scheme", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalOnDeathState = mockSchemeState<ISchemePhysicalOnDeathState>(EScheme.PH_ON_DEATH);
    const controller: PhysicalDeathController = new PhysicalDeathController(object, state);

    registerObject(object);

    controller.onDeath(object, null);

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();
  });

  it("should switch section on death with active scheme", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalOnDeathState = mockSchemeState<ISchemePhysicalOnDeathState>(EScheme.PH_ON_DEATH);
    const controller: PhysicalDeathController = new PhysicalDeathController(object, state);

    registerObject(object).activeScheme = EScheme.PH_ON_DEATH;

    controller.onDeath(object, null);

    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, state);
  });
});
