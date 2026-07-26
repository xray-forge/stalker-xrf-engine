import { describe, expect, it, jest } from "@jest/globals";
import { GameObject, Vector } from "xray16/alias";
import { MockGameObject, MockVector } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { parseBoneStateDescriptors, parseConditionsList } from "@/engine/core/ini";
import { ISchemePhysicalIdleState } from "@/engine/core/schemes/physical/ph_idle/ph_idle_types";
import { PhysicalIdleController } from "@/engine/core/schemes/physical/ph_idle/PhysicalIdleController";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockBaseSchemeLogic, mockSchemeState } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(),
  switchObjectSchemeToSection: jest.fn(),
}));

describe("PhysicalIdleController", () => {
  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalIdleState = mockSchemeState(EScheme.PH_IDLE, {});
    const controller: PhysicalIdleController = new PhysicalIdleController(object, state);

    state.isNonscriptUsable = false;
    controller.activate();
    expect(object.set_nonscript_usable).toHaveBeenCalledWith(false);

    state.isNonscriptUsable = true;
    controller.activate();
    expect(object.set_nonscript_usable).toHaveBeenCalledWith(true);
  });

  it("should correctly deactivate", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalIdleState = mockSchemeState(EScheme.PH_IDLE, {});
    const controller: PhysicalIdleController = new PhysicalIdleController(object, state);

    controller.deactivate();
    expect(object.set_tip_text).toHaveBeenCalledWith("");
  });

  it("should correctly update", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalIdleState = mockSchemeState(EScheme.PH_IDLE, {});
    const controller: PhysicalIdleController = new PhysicalIdleController(object, state);

    controller.update();
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, state);
  });

  it("should correctly handle usage", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalIdleState = mockSchemeState(EScheme.PH_IDLE, {});
    const controller: PhysicalIdleController = new PhysicalIdleController(object, state);
    const direction: Vector = MockVector.mock(1, 2, 3);

    resetFunctionMock(switchObjectSchemeToSection);

    state.bonesHitCondlists = new LuaTable();

    controller.onHit(object, 1, direction, null, 50);
    expect(switchObjectSchemeToSection).toHaveBeenCalledTimes(0);

    state.bonesHitCondlists = parseBoneStateDescriptors("1|ph_door@free1|2|ph_door@free2");

    controller.onHit(object, 1, direction, null, 2);
    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "ph_door@free2");
  });

  it("should correctly handle hit", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalIdleState = mockSchemeState(EScheme.PH_IDLE, {});
    const controller: PhysicalIdleController = new PhysicalIdleController(object, state);

    resetFunctionMock(switchObjectSchemeToSection);

    controller.onUse();
    expect(switchObjectSchemeToSection).toHaveBeenCalledTimes(0);

    state.onUse = mockBaseSchemeLogic({
      condlist: parseConditionsList("test_section"),
    });

    controller.onUse();
    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "test_section");
  });
});
