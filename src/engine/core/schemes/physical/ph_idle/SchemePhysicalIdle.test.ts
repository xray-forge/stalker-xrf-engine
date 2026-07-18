import { describe, expect, it } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { registerObject } from "@/engine/core/database";
import { ISchemePhysicalIdleState } from "@/engine/core/schemes/physical/ph_idle/ph_idle_types";
import { PhysicalIdleManager } from "@/engine/core/schemes/physical/ph_idle/PhysicalIdleManager";
import { SchemePhysicalIdle } from "@/engine/core/schemes/physical/ph_idle/SchemePhysicalIdle";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { getConfigSwitchConditions, parseBoneStateDescriptors, readIniConditionList } from "@/engine/core/utils/ini";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";

describe("SchemePhysicalIdle", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "ph_idle@test": {},
    });

    loadSchemeImplementation(SchemePhysicalIdle);
    registerObject(object);

    const state: ISchemePhysicalIdleState = SchemePhysicalIdle.activate(object, ini, EScheme.PH_IDLE, "ph_idle@test");

    expect(object.set_tip_text).toHaveBeenCalled();

    expect(state).toEqualLuaTables({
      ini,
      onUse: null,
      tip: "",
      isNonscriptUsable: false,
      actions: {
        "[object Object]": true,
      },
      bonesHitCondlists: {},
      scheme: EScheme.PH_IDLE,
      section: "ph_idle@test",
      logic: {},
    });

    assertSchemeSubscribedToManager(state, PhysicalIdleManager);
  });

  it("should correctly initialize with custom values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "ph_idle@test": {
        on_info: "{+test} a, b",
        hit_on_bone: "1|ph_door@free|2|ph_door@free",
        nonscript_usable: true,
        on_use: "test-use",
        tips: "test-tips",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemePhysicalIdle);

    const state: ISchemePhysicalIdleState = SchemePhysicalIdle.activate(object, ini, EScheme.PH_IDLE, "ph_idle@test");

    expect(object.set_tip_text).toHaveBeenCalled();

    expect(state).toEqualLuaTables({
      ini,
      onUse: readIniConditionList(ini, "ph_idle@test", "on_use"),
      tip: "test-tips",
      isNonscriptUsable: true,
      actions: {
        "[object Object]": true,
      },
      bonesHitCondlists: parseBoneStateDescriptors("1|ph_door@free|2|ph_door@free"),
      scheme: EScheme.PH_IDLE,
      section: "ph_idle@test",
      logic: getConfigSwitchConditions(ini, "ph_idle@test"),
    });

    assertSchemeSubscribedToManager(state, PhysicalIdleManager);
  });
});
