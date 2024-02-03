import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerObject, registry } from "@/engine/core/database";
import { LightManager } from "@/engine/core/schemes/restrictor/sr_light/LightManager";
import { SchemeLight } from "@/engine/core/schemes/restrictor/sr_light/SchemeLight";
import { ISchemeLightState } from "@/engine/core/schemes/restrictor/sr_light/sr_light_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemeLight", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should be correctly defined", () => {
    expect(SchemeLight.SCHEME_SECTION).toBe("sr_light");
    expect(SchemeLight.SCHEME_SECTION).toBe(EScheme.SR_LIGHT);
    expect(SchemeLight.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should correctly activate scheme with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_light@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} sr_another@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} sr_another@2",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeLight);

    const state: ISchemeLightState = SchemeLight.activate(
      object,
      ini,
      SchemeLight.SCHEME_SECTION,
      `${SchemeLight.SCHEME_SECTION}@test`
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("sr_light");
    expect(state.section).toBe("sr_light@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_light@test"));
    expect(state.actions?.length()).toBe(1);
    expect(state.light).toBe(false);

    assertSchemeSubscribedToManager(state, LightManager);
  });

  it("should correctly activate scheme with custom values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_light@test": {
        light_on: true,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeLight);

    const state: ISchemeLightState = SchemeLight.activate(
      object,
      ini,
      SchemeLight.SCHEME_SECTION,
      `${SchemeLight.SCHEME_SECTION}@test`
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("sr_light");
    expect(state.section).toBe("sr_light@test");
    expect(state.light).toBe(true);
  });

  it("should correctly reset scheme", () => {
    const first: LightManager = new LightManager(MockGameObject.mock(), mockSchemeState(EScheme.SR_LIGHT));
    const second: LightManager = new LightManager(MockGameObject.mock(), mockSchemeState(EScheme.SR_LIGHT));

    expect(registry.lightZones.length()).toBe(0);

    first.activate();
    second.activate();

    expect(registry.lightZones.length()).toBe(2);

    SchemeLight.reset();

    expect(registry.lightZones.length()).toBe(0);
  });
});
