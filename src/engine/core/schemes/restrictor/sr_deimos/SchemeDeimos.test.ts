import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { DeimosManager } from "@/engine/core/schemes/restrictor/sr_deimos/DeimosManager";
import { SchemeDeimos } from "@/engine/core/schemes/restrictor/sr_deimos/SchemeDeimos";
import { ISchemeDeimosState } from "@/engine/core/schemes/restrictor/sr_deimos/sr_deimos_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemeDeimos", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should be correctly defined", () => {
    expect(SchemeDeimos.SCHEME_SECTION).toBe("sr_deimos");
    expect(SchemeDeimos.SCHEME_SECTION).toBe(EScheme.SR_DEIMOS);
    expect(SchemeDeimos.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should require activation fields", () => {
    const object: GameObject = MockGameObject.mock();

    loadSchemeImplementation(SchemeDeimos);
    registerObject(object);

    expect(() => {
      SchemeDeimos.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "sr_deimos@test": {},
        }),
        SchemeDeimos.SCHEME_SECTION,
        `${SchemeDeimos.SCHEME_SECTION}@test`
      );
    }).toThrow("Attempt to read a non-existent string field 'pp_effector' in section 'sr_deimos@test'.");

    expect(() => {
      SchemeDeimos.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "sr_deimos@test": {
            pp_effector: "test-pp-effector",
          },
        }),
        SchemeDeimos.SCHEME_SECTION,
        `${SchemeDeimos.SCHEME_SECTION}@test`
      );
    }).toThrow("Attempt to read a non-existent string field 'pp_effector2' in section 'sr_deimos@test'.");

    expect(() => {
      SchemeDeimos.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "sr_deimos@test": {
            pp_effector: "test-pp-effector",
            pp_effector2: "test-pp-effector-2",
          },
        }),
        SchemeDeimos.SCHEME_SECTION,
        `${SchemeDeimos.SCHEME_SECTION}@test`
      );
    }).toThrow("Attempt to read a non-existent string field 'cam_effector' in section 'sr_deimos@test'.");

    expect(() => {
      SchemeDeimos.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "sr_deimos@test": {
            pp_effector: "test-pp-effector",
            pp_effector2: "test-pp-effector-2",
            cam_effector: "test-cam-effector",
          },
        }),
        SchemeDeimos.SCHEME_SECTION,
        `${SchemeDeimos.SCHEME_SECTION}@test`
      );
    }).toThrow("Attempt to read a non-existent string field 'noise_sound' in section 'sr_deimos@test'.");

    expect(() => {
      SchemeDeimos.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "sr_deimos@test": {
            pp_effector: "test-pp-effector",
            pp_effector2: "test-pp-effector-2",
            cam_effector: "test-cam-effector",
            noise_sound: "test-noise",
          },
        }),
        SchemeDeimos.SCHEME_SECTION,
        `${SchemeDeimos.SCHEME_SECTION}@test`
      );
    }).toThrow("Attempt to read a non-existent string field 'heartbeat_sound' in section 'sr_deimos@test'.");
  });

  it("should correctly activate scheme with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_deimos@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} sr_another@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} sr_another@2",
        pp_effector: "test-pp-effector",
        pp_effector2: "test-pp-effector-2",
        cam_effector: "test-cam-effector",
        noise_sound: "test-noise",
        heartbeat_sound: "test-heartbeat",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeDeimos);

    const state: ISchemeDeimosState = SchemeDeimos.activate(
      object,
      ini,
      SchemeDeimos.SCHEME_SECTION,
      `${SchemeDeimos.SCHEME_SECTION}@test`
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("sr_deimos");
    expect(state.section).toBe("sr_deimos@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_deimos@test"));
    expect(state.actions?.length()).toBe(1);

    expect(state.movementSpeed).toBe(100);
    expect(state.growingRate).toBe(0.1);
    expect(state.loweringRate).toBe(0.1);
    expect(state.ppEffector).toBe("test-pp-effector");
    expect(state.ppEffector2).toBe("test-pp-effector-2");
    expect(state.camEffector).toBe("test-cam-effector");
    expect(state.camEffectorRepeatingTime).toBe(10_000);
    expect(state.noiseSound).toBe("test-noise");
    expect(state.heartbeatSound).toBe("test-heartbeat");
    expect(state.healthLost).toBe(0.01);
    expect(state.disableBound).toBe(0.1);
    expect(state.switchLowerBound).toBe(0.5);
    expect(state.switchUpperBound).toBe(0.75);
    expect(state.intensity).toBe(0);

    assertSchemeSubscribedToManager(state, DeimosManager);
  });

  it("should correctly activate scheme with custom values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_deimos@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} sr_another@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} sr_another@2",
        pp_effector: "test-pp-effector-custom",
        pp_effector2: "test-pp-effector-2-custom",
        cam_effector: "test-cam-effector-custom",
        noise_sound: "test-noise-custom",
        heartbeat_sound: "test-heartbeat-custom",
        movement_speed: 450,
        growing_rate: 5,
        lowering_rate: 15,
        cam_effector_repeating_time: 44,
        health_lost: 3,
        disable_bound: 4,
        switch_lower_bound: 1.5,
        switch_upper_bound: 2.5,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeDeimos);

    const state: ISchemeDeimosState = SchemeDeimos.activate(
      object,
      ini,
      SchemeDeimos.SCHEME_SECTION,
      `${SchemeDeimos.SCHEME_SECTION}@test`
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("sr_deimos");
    expect(state.section).toBe("sr_deimos@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_deimos@test"));
    expect(state.actions?.length()).toBe(1);

    expect(state.movementSpeed).toBe(450);
    expect(state.growingRate).toBe(5);
    expect(state.loweringRate).toBe(15);
    expect(state.ppEffector).toBe("test-pp-effector-custom");
    expect(state.ppEffector2).toBe("test-pp-effector-2-custom");
    expect(state.camEffector).toBe("test-cam-effector-custom");
    expect(state.noiseSound).toBe("test-noise-custom");
    expect(state.heartbeatSound).toBe("test-heartbeat-custom");
    expect(state.camEffectorRepeatingTime).toBe(44_000);
    expect(state.healthLost).toBe(3);
    expect(state.disableBound).toBe(4);
    expect(state.switchLowerBound).toBe(1.5);
    expect(state.switchUpperBound).toBe(2.5);
    expect(state.intensity).toBe(0);

    assertSchemeSubscribedToManager(state, DeimosManager);
  });
});
