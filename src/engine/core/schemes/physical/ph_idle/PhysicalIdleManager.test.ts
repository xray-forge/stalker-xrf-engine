import { describe, expect, it, jest } from "@jest/globals";

import { ISchemePhysicalIdleState } from "@/engine/core/schemes/physical/ph_idle/ISchemePhysicalIdleState";
import { PhysicalIdleManager } from "@/engine/core/schemes/physical/ph_idle/PhysicalIdleManager";
import { parseBoneStateDescriptors, parseConditionsList } from "@/engine/core/utils/ini";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, Vector } from "@/engine/lib/types";
import { mockBaseSchemeLogic, mockSchemeState } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { mockClientGameObject } from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

jest.mock("@/engine/core/utils/scheme/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(),
  switchObjectSchemeToSection: jest.fn(),
}));

describe("PhysicalIdleManager", () => {
  it("should correctly activate", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemePhysicalIdleState = mockSchemeState(EScheme.PH_IDLE, {});
    const manager: PhysicalIdleManager = new PhysicalIdleManager(object, state);

    state.isNonscriptUsable = false;
    manager.activate();
    expect(object.set_nonscript_usable).toHaveBeenCalledWith(false);

    state.isNonscriptUsable = true;
    manager.activate();
    expect(object.set_nonscript_usable).toHaveBeenCalledWith(true);
  });

  it("should correctly deactivate", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemePhysicalIdleState = mockSchemeState(EScheme.PH_IDLE, {});
    const manager: PhysicalIdleManager = new PhysicalIdleManager(object, state);

    manager.deactivate();
    expect(object.set_tip_text).toHaveBeenCalledWith("");
  });

  it("should correctly update", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemePhysicalIdleState = mockSchemeState(EScheme.PH_IDLE, {});
    const manager: PhysicalIdleManager = new PhysicalIdleManager(object, state);

    manager.update();
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, state);
  });

  it("should correctly handle usage", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemePhysicalIdleState = mockSchemeState(EScheme.PH_IDLE, {});
    const manager: PhysicalIdleManager = new PhysicalIdleManager(object, state);
    const direction: Vector = MockVector.mock(1, 2, 3);

    resetFunctionMock(switchObjectSchemeToSection);

    state.bonesHitCondlists = new LuaTable();

    manager.onHit(object, 1, direction, null, 50);
    expect(switchObjectSchemeToSection).toHaveBeenCalledTimes(0);

    state.bonesHitCondlists = parseBoneStateDescriptors("1|ph_door@free1|2|ph_door@free2");

    manager.onHit(object, 1, direction, null, 2);
    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "ph_door@free2");
  });

  it("should correctly handle hit", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemePhysicalIdleState = mockSchemeState(EScheme.PH_IDLE, {});
    const manager: PhysicalIdleManager = new PhysicalIdleManager(object, state);

    resetFunctionMock(switchObjectSchemeToSection);

    manager.onUse();
    expect(switchObjectSchemeToSection).toHaveBeenCalledTimes(0);

    state.onUse = mockBaseSchemeLogic({
      condlist: parseConditionsList("test_section"),
    });

    manager.onUse();
    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "test_section");
  });
});
