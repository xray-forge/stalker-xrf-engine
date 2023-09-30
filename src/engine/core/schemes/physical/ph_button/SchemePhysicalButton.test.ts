import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { ISchemePhysicalButtonState } from "@/engine/core/schemes/physical/ph_button/ph_button_types";
import { PhysicalButtonManager } from "@/engine/core/schemes/physical/ph_button/PhysicalButtonManager";
import { SchemePhysicalButton } from "@/engine/core/schemes/physical/ph_button/SchemePhysicalButton";
import { getConfigSwitchConditions, parseConditionsList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemePhysicalButton", () => {
  it("should correctly activate with defaults", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_button@test": {
        anim: "anim_test",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemePhysicalButton);

    const state: ISchemePhysicalButtonState = SchemePhysicalButton.activate(
      object,
      ini,
      EScheme.PH_BUTTON,
      "ph_button@test"
    );

    expect(object.set_tip_text).toHaveBeenCalledWith("");
    expect(state.logic).toEqualLuaTables({});
    expect(state.onPress).toBeNull();
    expect(state.tooltip).toBeNull();
    expect(state.anim).toBe("anim_test");
    expect(state.blending).toBe(true);

    assertSchemeSubscribedToManager(state, PhysicalButtonManager);
  });

  it("should correctly activate with data", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_button@test": {
        on_info: "{+test} first, second",
        on_press: "{+test} a, b",
        anim: "anim_test2",
        anim_blend: false,
        tooltip: "test_tip",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemePhysicalButton);

    const state: ISchemePhysicalButtonState = SchemePhysicalButton.activate(
      object,
      ini,
      EScheme.PH_BUTTON,
      "ph_button@test"
    );

    expect(object.set_tip_text).toHaveBeenCalledWith("test_tip");
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "ph_button@test"));
    expect(state.onPress).toEqualLuaTables({
      name: "on_press",
      condlist: parseConditionsList("{+test} a, b"),
      objectId: null,
      p1: null,
      p2: null,
    });
    expect(state.tooltip).toBe("test_tip");
    expect(state.anim).toBe("anim_test2");
    expect(state.blending).toBe(false);

    assertSchemeSubscribedToManager(state, PhysicalButtonManager);
  });
});
