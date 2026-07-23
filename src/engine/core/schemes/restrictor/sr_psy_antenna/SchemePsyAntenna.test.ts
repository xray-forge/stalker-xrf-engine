import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameObject, IniFile } from "xray16/alias";
import { AnyObject } from "xray16/lib";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { getManager, registerObject } from "@/engine/core/database";
import { getConfigSwitchConditions } from "@/engine/core/ini";
import { PsyAntennaManager } from "@/engine/core/managers/psy/PsyAntennaManager";
import { PsyAntennaSchemaManager } from "@/engine/core/schemes/restrictor/sr_psy_antenna/PsyAntennaSchemaManager";
import { SchemePsyAntenna } from "@/engine/core/schemes/restrictor/sr_psy_antenna/SchemePsyAntenna";
import { ISchemePsyAntennaState } from "@/engine/core/schemes/restrictor/sr_psy_antenna/sr_psy_antenna_types";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { assertSchemeSubscribedToManager, resetRegistry } from "@/fixtures/engine";

describe("SchemePsyAntenna", () => {
  it("should correctly initialize with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
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
    const ini: IniFile = MockIniFile.mock("test.ltx", {
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

describe("PsyAntennaSchemaManager post-process allocation", () => {
  beforeEach(() => {
    resetRegistry();
    (level as unknown as AnyObject).set_pp_effector_factor = jest.fn();
    (level as unknown as AnyObject).remove_pp_effector = jest.fn();
  });

  function createState(postprocess: string): ISchemePsyAntennaState {
    return {
      intensity: 1,
      postprocess: postprocess,
      hitIntensity: 0,
      phantomProb: 0,
      muteSoundThreshold: 0,
      noStatic: false,
      noMumble: false,
      hitType: "wound",
      hitFreq: 5000,
    } as ISchemePsyAntennaState;
  }

  it("should not reuse an active effector ID after another effect expires", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: PsyAntennaManager = getManager(PsyAntennaManager);

    const first: PsyAntennaSchemaManager = new PsyAntennaSchemaManager(object, createState("first.ppe"));
    const second: PsyAntennaSchemaManager = new PsyAntennaSchemaManager(object, createState("second.ppe"));

    first.onZoneEnter();
    second.onZoneEnter();

    const firstEffect = manager.postprocess.get("first.ppe");
    const secondEffect = manager.postprocess.get("second.ppe");

    expect(firstEffect.idx).toBe(1501);
    expect(secondEffect.idx).toBe(1502);

    firstEffect.intensity = 0;
    expect(manager.updatePostprocess(firstEffect)).toBe(false);
    manager.postprocess.delete("first.ppe");

    const third: PsyAntennaSchemaManager = new PsyAntennaSchemaManager(object, createState("third.ppe"));

    third.onZoneEnter();

    expect(manager.postprocess.get("third.ppe").idx).toBe(1503);
    expect(manager.postprocess.get("third.ppe").idx).not.toBe(secondEffect.idx);
  });
});
