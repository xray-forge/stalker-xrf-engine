import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { CodeManager } from "@/engine/core/schemes/physical/ph_code/CodeManager";
import { ISchemeCodeState } from "@/engine/core/schemes/physical/ph_code/ph_code_types";
import { SchemeCode } from "@/engine/core/schemes/physical/ph_code/SchemeCode";
import { getConfigSwitchConditions, parseConditionsList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { mockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeCode", () => {
  it("should correctly activate with defaults", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_code@test": {},
    });

    registerObject(object);
    loadSchemeImplementation(SchemeCode);

    const state: ISchemeCodeState = SchemeCode.activate(object, ini, EScheme.PH_CODE, "ph_code@test");

    expect(object.set_tip_text).toHaveBeenCalledWith("st_codelock");

    expect(state.logic).toEqualLuaTables({});
    expect(state.tips).toBe("st_codelock");
    expect(state.code).toBeNull();
    expect(state.onCheckCode).toEqualLuaTables({});

    assertSchemeSubscribedToManager(state, CodeManager);
  });

  it("should correctly activate with one code", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_code@test": {
        on_info: "{+test} first, second",
        tips: "test_tips",
        code: 5534,
        on_code: "{+test} a, b",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeCode);

    const state: ISchemeCodeState = SchemeCode.activate(object, ini, EScheme.PH_CODE, "ph_code@test");

    expect(object.set_tip_text).toHaveBeenCalledWith("test_tips");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "ph_code@test"));
    expect(state.tips).toBe("test_tips");
    expect(state.code).toBe(5534);
    expect(state.onCheckCode).toBeUndefined();
    expect(state.onCode).toEqualLuaTables({
      name: "on_code",
      condlist: parseConditionsList("{+test} a, b"),
      objectId: null,
      p1: null,
      p2: null,
    });

    assertSchemeSubscribedToManager(state, CodeManager);
  });

  it("should correctly activate with on_check_code", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_code@test": {
        on_info: "{+test} first, second",
        tips: "test_tips",
        on_check_code1: "123|{+test} a, b",
        on_check_code2: "456|{+test2} c, d",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeCode);

    const state: ISchemeCodeState = SchemeCode.activate(object, ini, EScheme.PH_CODE, "ph_code@test");

    expect(object.set_tip_text).toHaveBeenCalledWith("test_tips");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "ph_code@test"));
    expect(state.tips).toBe("test_tips");
    expect(state.code).toBeNull();
    expect(state.onCode).toBeUndefined();
    expect(state.onCheckCode).toEqualLuaTables({
      123: parseConditionsList("{+test} a, b"),
      456: parseConditionsList("{+test2} c, d"),
    });

    assertSchemeSubscribedToManager(state, CodeManager);
  });
});
