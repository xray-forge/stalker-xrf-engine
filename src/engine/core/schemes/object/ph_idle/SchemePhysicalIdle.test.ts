import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemePhysicalIdleState } from "@/engine/core/schemes/object/ph_idle/ISchemePhysicalIdleState";
import { PhysicalIdleManager } from "@/engine/core/schemes/object/ph_idle/PhysicalIdleManager";
import { SchemePhysicalIdle } from "@/engine/core/schemes/object/ph_idle/SchemePhysicalIdle";
import { getConfigSwitchConditions, parseBoneStateDescriptors, readIniConditionList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemePhysicalIdle", () => {
  it("should correctly initialize", () => {
    loadSchemeImplementation(SchemePhysicalIdle);

    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_idle@test": {},
    });

    SchemePhysicalIdle.activate(object, ini, EScheme.PH_IDLE, "ph_idle@test");

    const schemeState: ISchemePhysicalIdleState = state[EScheme.PH_IDLE] as ISchemePhysicalIdleState;

    expect(schemeState).toEqualLuaTables({
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
    expect((schemeState.actions as unknown as MockLuaTable<any, any>).getKeysArray()[0]).toBeInstanceOf(
      PhysicalIdleManager
    );
    expect(object.set_tip_text).toHaveBeenCalled();
  });

  it("should correctly initialize with custom values", () => {
    loadSchemeImplementation(SchemePhysicalIdle);

    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_idle@test": {
        on_info: "{+test} a, b",
        hit_on_bone: "1|ph_door@free|2|ph_door@free",
        nonscript_usable: true,
        on_use: "test-use",
        tips: "test-tips",
      },
    });

    SchemePhysicalIdle.activate(object, ini, EScheme.PH_IDLE, "ph_idle@test");

    const schemeState: ISchemePhysicalIdleState = state[EScheme.PH_IDLE] as ISchemePhysicalIdleState;

    expect(schemeState).toEqualLuaTables({
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
    expect(object.set_tip_text).toHaveBeenCalled();
  });
});
