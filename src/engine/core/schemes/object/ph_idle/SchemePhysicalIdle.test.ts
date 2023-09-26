import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { ISchemePhysicalIdleState } from "@/engine/core/schemes/object/ph_idle/ISchemePhysicalIdleState";
import { SchemePhysicalIdle } from "@/engine/core/schemes/object/ph_idle/SchemePhysicalIdle";
import { PhysicalOnHitManager } from "@/engine/core/schemes/object/ph_on_hit/PhysicalOnHitManager";
import { getConfigSwitchConditions, parseBoneStateDescriptors, readIniConditionList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemePhysicalIdle", () => {
  it("should correctly initialize", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
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

    assertSchemeSubscribedToManager(state, PhysicalOnHitManager);
  });

  it("should correctly initialize with custom values", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
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

    assertSchemeSubscribedToManager(state, PhysicalOnHitManager);
  });
});
