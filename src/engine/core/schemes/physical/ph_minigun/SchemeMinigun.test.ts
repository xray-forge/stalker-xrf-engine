import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { MinigunManager } from "@/engine/core/schemes/physical/ph_minigun/MinigunManager";
import { ISchemeMinigunState } from "@/engine/core/schemes/physical/ph_minigun/ph_minigun_types";
import { SchemeMinigun } from "@/engine/core/schemes/physical/ph_minigun/SchemeMinigun";
import { getConfigSwitchConditions, parseConditionsList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, mockBaseSchemeLogic } from "@/fixtures/engine";
import { MockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeMinigun class", () => {
  it("should correctly activate scheme with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_minigun@test": {},
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMinigun);

    const state: ISchemeMinigunState = SchemeMinigun.activate(
      object,
      ini,
      SchemeMinigun.SCHEME_SECTION,
      "ph_minigun@test",
      "test_smart"
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("ph_minigun");
    expect(state.section).toBe("ph_minigun@test");
    expect(state.logic?.length()).toBe(0);

    expect(state.pathFire).toBeNull();
    expect(state.autoFire).toBe(false);
    expect(state.fireTime).toBe(1);
    expect(state.fireRep).toBe(0.5);
    expect(state.fireRange).toBe(50);
    expect(state.fireTarget).toBe("points");
    expect(state.fireTrackTarget).toBe(false);
    expect(state.fireAngle).toBe(120);
    expect(state.shootOnlyOnVisible).toBe(true);
    expect(state.onTargetVis).toBeNull();
    expect(state.onTargetNvis).toBeNull();

    assertSchemeSubscribedToManager(state, MinigunManager);
  });

  it("should correctly activate scheme with custom values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_minigun@test": {
        on_info: "{+test} first, second",
        path_fire: "test_path",
        auto_fire: true,
        fire_time: 4,
        fire_repeat: 5,
        fire_range: 6,
        target: "another",
        track_target: true,
        fire_angle: 7,
        shoot_only_on_visible: false,
        on_target_vis: "a|true",
        on_target_nvis: "b|false",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMinigun);

    const state: ISchemeMinigunState = SchemeMinigun.activate(
      object,
      ini,
      SchemeMinigun.SCHEME_SECTION,
      "ph_minigun@test",
      "test_smart"
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("ph_minigun");
    expect(state.section).toBe("ph_minigun@test");
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "ph_minigun@test"));

    expect(state.pathFire).toBe("test_smart_test_path");
    expect(state.autoFire).toBe(true);
    expect(state.fireTime).toBe(4);
    expect(state.fireRep).toBe(5);
    expect(state.fireRange).toBe(6);
    expect(state.fireTarget).toBe("test_smart_another");
    expect(state.fireTrackTarget).toBe(true);
    expect(state.fireAngle).toBe(7);
    expect(state.shootOnlyOnVisible).toBe(false);
    expect(state.onTargetVis).toEqualLuaTables(
      mockBaseSchemeLogic({ condlist: parseConditionsList("true"), name: "on_target_vis", p1: "a" })
    );

    expect(state.onTargetNvis).toEqualLuaTables(
      mockBaseSchemeLogic({ condlist: parseConditionsList("false"), name: "on_target_nvis", p1: "b" })
    );

    assertSchemeSubscribedToManager(state, MinigunManager);
  });
});
