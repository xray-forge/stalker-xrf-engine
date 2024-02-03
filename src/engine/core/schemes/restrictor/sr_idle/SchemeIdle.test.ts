import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { IdleManager } from "@/engine/core/schemes/restrictor/sr_idle/IdleManager";
import { SchemeIdle } from "@/engine/core/schemes/restrictor/sr_idle/SchemeIdle";
import { ISchemeIdleState } from "@/engine/core/schemes/restrictor/sr_idle/sr_idle_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemeIdle", () => {
  it("should be correctly defined", () => {
    expect(SchemeIdle.SCHEME_SECTION).toBe("sr_idle");
    expect(SchemeIdle.SCHEME_SECTION).toBe(EScheme.SR_IDLE);
    expect(SchemeIdle.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should correctly activate scheme", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} sr_monster@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} sr_monster@1",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeIdle);

    const state: ISchemeIdleState = SchemeIdle.activate(
      object,
      ini,
      SchemeIdle.SCHEME_SECTION,
      `${SchemeIdle.SCHEME_SECTION}@test`
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("sr_idle");
    expect(state.section).toBe("sr_idle@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_idle@test"));
    expect(state.actions?.length()).toBe(1);

    assertSchemeSubscribedToManager(state, IdleManager);
  });
});
