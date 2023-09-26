import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { ISchemePsyAntennaState } from "@/engine/core/schemes/restrictor/sr_psy_antenna/ISchemePsyAntennaState";
import { PsyAntennaSchemaManager } from "@/engine/core/schemes/restrictor/sr_psy_antenna/PsyAntennaSchemaManager";
import { SchemePsyAntenna } from "@/engine/core/schemes/restrictor/sr_psy_antenna/SchemePsyAntenna";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemePsyAntenna", () => {
  it("should correctly initialize with defaults", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_psy_antenna@test": {
        eff_intensity: 100,
        hit_intensity: 1000,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemePsyAntenna);

    const state: ISchemePsyAntennaState = SchemePsyAntenna.activate(
      object,
      ini,
      EScheme.SR_PSY_ANTENNA,
      "sr_psy_antenna@test"
    );

    expect(state.logic).toEqualLuaTables({});
    expect(state.intensity).toBe(1);
    expect(state.postprocess).toBe("psy_antenna.ppe");
    expect(state.hit_intensity).toBe(10);
    expect(state.phantom_prob).toBe(0);
    expect(state.mute_sound_threshold).toBe(0);
    expect(state.no_static).toBe(false);
    expect(state.no_mumble).toBe(false);
    expect(state.hit_type).toBe("wound");
    expect(state.hit_freq).toBe(5000);

    assertSchemeSubscribedToManager(state, PsyAntennaSchemaManager);
  });

  it("should correctly initialize with custom data", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_psy_antenna@test": {
        on_hit: "{+test} first, second",
        eff_intensity: 500,
        hit_intensity: 4000,
        postprocess: "test.ppe",
        phantom_prob: 430,
        mute_sound_threshold: 5,
        no_static: true,
        no_mumble: true,
        hit_type: "fire",
        hit_freq: 2000,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemePsyAntenna);

    const state: ISchemePsyAntennaState = SchemePsyAntenna.activate(
      object,
      ini,
      EScheme.SR_PSY_ANTENNA,
      "sr_psy_antenna@test"
    );

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_psy_antenna@test"));
    expect(state.intensity).toBe(5);
    expect(state.postprocess).toBe("test.ppe");
    expect(state.hit_intensity).toBe(40);
    expect(state.phantom_prob).toBe(4.3);
    expect(state.mute_sound_threshold).toBe(5);
    expect(state.no_static).toBe(true);
    expect(state.no_mumble).toBe(true);
    expect(state.hit_type).toBe("fire");
    expect(state.hit_freq).toBe(2000);

    assertSchemeSubscribedToManager(state, PsyAntennaSchemaManager);
  });
});
