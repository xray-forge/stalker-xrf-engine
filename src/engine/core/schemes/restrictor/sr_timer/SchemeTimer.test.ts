import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { SchemeTimer } from "@/engine/core/schemes/restrictor/sr_timer/SchemeTimer";
import { ETimerType, ISchemeTimerState } from "@/engine/core/schemes/restrictor/sr_timer/sr_timer_types";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme/scheme_setup";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemeTimer functionality", () => {
  it("should be correctly defined", () => {
    expect(SchemeTimer.SCHEME_SECTION).toBe("sr_timer");
    expect(SchemeTimer.SCHEME_SECTION).toBe(EScheme.SR_TIMER);
    expect(SchemeTimer.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should correctly activate scheme", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_timer@test": {
        type: ETimerType.DECREMENT,
        start_value: 15_000,
        timer_id: "timerId123",
        string: "label",
        on_value:
          "0 | sr_idle@end {!squad_exist(zat_b38_bloodsuckers_sleepers)} " +
          "%+zat_b57_gas_running_stop +zat_b57_den_of_the_bloodsucker_tell_stalkers_about_destroy_lair_give%",
      },
      "sr_timer@missing_start": {
        type: ETimerType.DECREMENT,
        timer_id: "timerId123",
        string: "label",
        on_value:
          "0 | sr_idle@end {!squad_exist(zat_b38_bloodsuckers_sleepers)} " +
          "%+zat_b57_gas_running_stop +zat_b57_den_of_the_bloodsucker_tell_stalkers_about_destroy_lair_give%",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeTimer);

    // Missing start value.
    expect(() => {
      SchemeTimer.activate(object, ini, SchemeTimer.SCHEME_SECTION, `${SchemeTimer.SCHEME_SECTION}@missing_start`);
    }).toThrow();

    const state: ISchemeTimerState = SchemeTimer.activate(
      object,
      ini,
      SchemeTimer.SCHEME_SECTION,
      `${SchemeTimer.SCHEME_SECTION}@test`
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("sr_timer");
    expect(state.section).toBe("sr_timer@test");
    expect(state.logic?.length()).toBe(0);
    expect(state.actions?.length()).toBe(1);

    expect(state.type).toBe(ETimerType.DECREMENT);
    expect(state.startValue).toBe(15_000);
    expect(state.timerId).toBe("timerId123");
    expect(state.string).toBe("label");
    expect(state.onValue).toEqualLuaTables({
      condlist: parseConditionsList(
        "sr_idle@end {!squad_exist(zat_b38_bloodsuckers_sleepers)} " +
          "%+zat_b57_gas_running_stop +zat_b57_den_of_the_bloodsucker_tell_stalkers_about_destroy_lair_give%"
      ),
      name: "on_value",
      objectId: null,
      p1: 0,
      p2: null,
    });
  });
});
