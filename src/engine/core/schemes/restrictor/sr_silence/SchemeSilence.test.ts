import { describe, expect, it } from "@jest/globals";

import { registerObject, registry } from "@/engine/core/database";
import { SchemeSilence } from "@/engine/core/schemes/restrictor/sr_silence/SchemeSilence";
import { SilenceManager } from "@/engine/core/schemes/restrictor/sr_silence/SilenceManager";
import { ISchemeSilenceState } from "@/engine/core/schemes/restrictor/sr_silence/sr_silence_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeSilence", () => {
  it("should correctly initialize", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
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
