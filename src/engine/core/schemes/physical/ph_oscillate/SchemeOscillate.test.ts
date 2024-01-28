import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { OscillateManager } from "@/engine/core/schemes/physical/ph_oscillate/OscillateManager";
import { ISchemeOscillateState } from "@/engine/core/schemes/physical/ph_oscillate/ph_oscillate_types";
import { SchemeOscillate } from "@/engine/core/schemes/physical/ph_oscillate/SchemeOscillate";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemeOscillate class", () => {
  it("should be correctly defined", () => {
    expect(SchemeOscillate.SCHEME_SECTION).toBe("ph_oscillate");
    expect(SchemeOscillate.SCHEME_SECTION).toBe(EScheme.PH_OSCILLATE);
    expect(SchemeOscillate.SCHEME_TYPE).toBe(ESchemeType.OBJECT);
  });

  it("should correctly activate scheme with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "ph_oscillate@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} ph_another@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} ph_another@2",
        joint: "test_joint",
        period: 10,
        force: 15,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeOscillate);

    const state: ISchemeOscillateState = SchemeOscillate.activate(
      object,
      ini,
      SchemeOscillate.SCHEME_SECTION,
      `${SchemeOscillate.SCHEME_SECTION}@test`,
      "test_smart"
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("ph_oscillate");
    expect(state.section).toBe("ph_oscillate@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "ph_oscillate@test"));
    expect(state.actions?.length()).toBe(1);
    expect(state.joint).toBe("test_smart_test_joint");
    expect(state.period).toBe(10);
    expect(state.force).toBe(15);
    expect(state.angle).toBe(0);

    assertSchemeSubscribedToManager(state, OscillateManager);
  });

  it("should require main parameters", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);
    loadSchemeImplementation(SchemeOscillate);

    expect(() => {
      SchemeOscillate.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "ph_oscillate@test": {},
        }),
        SchemeOscillate.SCHEME_SECTION,
        `${SchemeOscillate.SCHEME_SECTION}@test`,
        "test_smart"
      );
    }).toThrow("Attempt to read a non-existent string field 'joint' in section 'ph_oscillate@test'.");

    expect(() => {
      SchemeOscillate.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "ph_oscillate@test": {
            joint: "abc",
          },
        }),
        SchemeOscillate.SCHEME_SECTION,
        `${SchemeOscillate.SCHEME_SECTION}@test`,
        "test_smart"
      );
    }).toThrow("Attempt to read a non-existent number field 'period' in section 'ph_oscillate@test'.");

    expect(() => {
      SchemeOscillate.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "ph_oscillate@test": {
            joint: "abc",
            period: 1,
          },
        }),
        SchemeOscillate.SCHEME_SECTION,
        `${SchemeOscillate.SCHEME_SECTION}@test`,
        "test_smart"
      );
    }).toThrow("Attempt to read a non-existent number field 'force' in section 'ph_oscillate@test'.");

    expect(() => {
      SchemeOscillate.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "ph_oscillate@test": {
            joint: "abc",
            period: 1,
            force: 1,
          },
        }),
        SchemeOscillate.SCHEME_SECTION,
        `${SchemeOscillate.SCHEME_SECTION}@test`,
        "test_smart"
      );
    }).not.toThrow();
  });
});
