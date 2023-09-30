import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { PostProcessManager } from "@/engine/core/schemes/restrictor/sr_postprocess/PostProcessManager";
import { SchemePostProcess } from "@/engine/core/schemes/restrictor/sr_postprocess/SchemePostProcess";
import { ISchemePostProcessState } from "@/engine/core/schemes/restrictor/sr_postprocess/sr_postprocess_types";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemePostProcess", () => {
  it("should correctly initialize with defaults", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_postprocess@test": {
        intensity: 1500,
        intensity_speed: 4200,
        hit_intensity: 255,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemePostProcess);

    const state: ISchemePostProcessState = SchemePostProcess.activate(
      object,
      ini,
      EScheme.SR_POSTPROCESS,
      "sr_postprocess@test"
    );

    expect(state.logic).toEqualLuaTables({});
    expect(state.intensity).toBe(15);
    expect(state.intensitySpeed).toBe(42);
    expect(state.hitIntensity).toBe(255);

    assertSchemeSubscribedToManager(state, PostProcessManager);
  });
});
