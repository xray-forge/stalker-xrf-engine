import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { PsyAntennaSchemaManager } from "@/engine/core/schemes/restrictor/sr_psy_antenna/PsyAntennaSchemaManager";
import { SchemePsyAntenna } from "@/engine/core/schemes/restrictor/sr_psy_antenna/SchemePsyAntenna";
import { ISchemePsyAntennaState } from "@/engine/core/schemes/restrictor/sr_psy_antenna/sr_psy_antenna_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { MockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemePsyAntenna", () => {
  it("should correctly initialize with defaults", () => {
    const object: GameObject = MockGameObject.mock();
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
    expect(state.hitIntensity).toBe(10);
    expect(state.phantomProb).toBe(0);
    expect(state.muteSoundThreshold).toBe(0);
    expect(state.noStatic).toBe(false);
    expect(state.noMumble).toBe(false);
    expect(state.hitType).toBe("wound");
    expect(state.hitFreq).toBe(5000);

    assertSchemeSubscribedToManager(state, PsyAntennaSchemaManager);
  });

  it("should correctly initialize with custom data", () => {
    const object: GameObject = MockGameObject.mock();
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
    expect(state.hitIntensity).toBe(40);
    expect(state.phantomProb).toBe(4.3);
    expect(state.muteSoundThreshold).toBe(5);
    expect(state.noStatic).toBe(true);
    expect(state.noMumble).toBe(true);
    expect(state.hitType).toBe("fire");
    expect(state.hitFreq).toBe(2000);

    assertSchemeSubscribedToManager(state, PsyAntennaSchemaManager);
  });
});
