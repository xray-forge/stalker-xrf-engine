import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { CutsceneManager } from "@/engine/core/schemes/restrictor/sr_cutscene/CutsceneManager";
import { SchemeCutscene } from "@/engine/core/schemes/restrictor/sr_cutscene/SchemeCutscene";
import { ISchemeCutsceneState } from "@/engine/core/schemes/restrictor/sr_cutscene/sr_cutscene_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { MockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeCutscene", () => {
  it("should be correctly defined", () => {
    expect(SchemeCutscene.SCHEME_SECTION).toBe("sr_cutscene");
    expect(SchemeCutscene.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should correctly add to logics with default values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_cutscene@test": {
        point: "test-point",
        look: "test-look",
        cam_effector: "a,b,c",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeCutscene);

    const state: ISchemeCutsceneState = SchemeCutscene.activate(object, ini, EScheme.SR_CUTSCENE, "sr_cutscene@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_cutscene@test"));
    expect(state.point).toBe("test-point");
    expect(state.look).toBe("test-look");
    expect(state.isGlobalCameraEffect).toBe(false);
    expect(state.ppEffector).toBe("nil.ppe");
    expect(state.cameraEffector).toEqualLuaArrays(["a", "b", "c"]);
    expect(state.fov).toBeNull();
    expect(state.shouldEnableUiOnEnd).toBe(true);
    expect(state.isOutdoor).toBe(false);

    assertSchemeSubscribedToManager(state, CutsceneManager);
  });

  it("should correctly add to logics with custom values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_cutscene@test": {
        point: "test-point-another",
        look: "test-look-another",
        global_cameffect: true,
        pp_effector: "custom",
        cam_effector: "c,d",
        fov: 30,
        enable_ui_on_end: false,
        outdoor: true,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeCutscene);

    const state: ISchemeCutsceneState = SchemeCutscene.activate(object, ini, EScheme.SR_CUTSCENE, "sr_cutscene@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_cutscene@test"));
    expect(state.point).toBe("test-point-another");
    expect(state.look).toBe("test-look-another");
    expect(state.isGlobalCameraEffect).toBe(true);
    expect(state.ppEffector).toBe("custom.ppe");
    expect(state.cameraEffector).toEqualLuaArrays(["c", "d"]);
    expect(state.fov).toBe(30);
    expect(state.shouldEnableUiOnEnd).toBe(false);
    expect(state.isOutdoor).toBe(true);

    assertSchemeSubscribedToManager(state, CutsceneManager);
  });
});
