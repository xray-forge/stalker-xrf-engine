import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { ISchemePhysicalButtonState } from "@/engine/core/schemes/physical/ph_button/ph_button_types";
import { PhysicalButtonManager } from "@/engine/core/schemes/physical/ph_button/PhysicalButtonManager";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { isActiveSection, switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/utils/scheme";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockBaseSchemeLogic, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme");

describe("PhysicalButtonManager.test.ts class", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
    resetFunctionMock(switchObjectSchemeToSection);
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalButtonState = mockSchemeState<ISchemePhysicalButtonState>(EScheme.PH_BUTTON, {
      anim: "anim-test",
      blending: true,
    });

    const manager: PhysicalButtonManager = new PhysicalButtonManager(object, state);

    expect(object.play_cycle).not.toHaveBeenCalled();

    manager.activate();

    expect(object.play_cycle).toHaveBeenCalledTimes(1);
    expect(object.play_cycle).toHaveBeenCalledWith("anim-test", true);
  });

  it("should correctly update", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalButtonState = mockSchemeState<ISchemePhysicalButtonState>(EScheme.PH_BUTTON, {
      anim: "anim-test",
      blending: true,
    });

    const manager: PhysicalButtonManager = new PhysicalButtonManager(object, state);

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();

    manager.update();

    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, state);
  });

  it("should handle use callback", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalButtonState = mockSchemeState<ISchemePhysicalButtonState>(EScheme.PH_BUTTON, {
      section: "ph_button@current",
      anim: "anim-test",
      blending: true,
    });

    const manager: PhysicalButtonManager = new PhysicalButtonManager(object, state);

    expect(switchObjectSchemeToSection).not.toHaveBeenCalled();

    replaceFunctionMock(isActiveSection, () => false);

    manager.onUse(object);

    expect(switchObjectSchemeToSection).not.toHaveBeenCalled();

    state.onPress = mockBaseSchemeLogic({
      condlist: parseConditionsList("{+not_existing} invalid@test, next_scheme@test"),
    });

    manager.onUse(object);

    expect(switchObjectSchemeToSection).not.toHaveBeenCalled();

    replaceFunctionMock(isActiveSection, () => true);

    manager.onUse(object);

    expect(switchObjectSchemeToSection).toHaveBeenCalledTimes(1);
    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "next_scheme@test");
  });
});
