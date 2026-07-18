import { describe, expect, it } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { registerObject, registry } from "@/engine/core/database";
import { SchemeSilence } from "@/engine/core/schemes/restrictor/sr_silence/SchemeSilence";
import { SilenceManager } from "@/engine/core/schemes/restrictor/sr_silence/SilenceManager";
import { ISchemeSilenceState } from "@/engine/core/schemes/restrictor/sr_silence/sr_silence_types";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";

describe("SchemeSilence", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_silence@test": {
        on_info: "{+test} first, second",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeSilence);

    const state: ISchemeSilenceState = SchemeSilence.activate(object, ini, EScheme.SR_SILENCE, "sr_silence@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_silence@test"));
    expect(registry.silenceZones.get(object.id())).toBe(object.name());

    assertSchemeSubscribedToManager(state, SilenceManager);
  });
});
