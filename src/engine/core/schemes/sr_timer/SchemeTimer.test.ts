import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { ETimerType, ISchemeTimerState } from "@/engine/core/schemes/sr_timer/ISchemeTimerState";
import { SchemeTimer } from "@/engine/core/schemes/sr_timer/SchemeTimer";
import { ClientObject, EScheme, ESchemeType, IniFile } from "@/engine/lib/types";
import { loadSchemeImplementation } from "@/engine/scripts/register/schemes_registrator";
import { luaTableToObject } from "@/fixtures/lua/mocks/utils";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeTimer functionality", () => {
  it("should be correctly defined", () => {
    expect(SchemeTimer.SCHEME_SECTION).toBe("sr_timer");
    expect(SchemeTimer.SCHEME_SECTION).toBe(EScheme.SR_TIMER);
    expect(SchemeTimer.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should correctly activate scheme", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
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

    SchemeTimer.activate(object, ini, SchemeTimer.SCHEME_SECTION, `${SchemeTimer.SCHEME_SECTION}@test`);

    const state: IRegistryObjectState = registry.objects.get(object.id());
    const schemeState: ISchemeTimerState = state[EScheme.SR_TIMER] as ISchemeTimerState;

    expect(schemeState.ini).toBe(ini);
    expect(schemeState.scheme).toBe("sr_timer");
    expect(schemeState.section).toBe("sr_timer@test");
    expect(schemeState.logic?.length()).toBe(0);
    expect(schemeState.actions?.length()).toBe(1);

    expect(schemeState.type).toBe(ETimerType.DECREMENT);
    expect(schemeState.startValue).toBe(15_000);
    expect(schemeState.timerId).toBe("timerId123");
    expect(schemeState.string).toBe("label");
    expect(luaTableToObject(schemeState.onValue)).toEqual({
      condlist: {
        "1": {
          infop_check: {
            "1": {
              expected: false,
              func: "squad_exist",
              params: {
                "1": "zat_b38_bloodsuckers_sleepers",
              },
            },
          },
          infop_set: {
            "1": {
              name: "zat_b57_gas_running_stop",
              required: true,
            },
            "2": {
              name: "zat_b57_den_of_the_bloodsucker_tell_stalkers_about_destroy_lair_give",
              required: true,
            },
          },
          section: "sr_idle@end  ",
        },
      },
      name: "on_value",
      npc_id: null,
      v1: 0,
      v2: null,
    });
  });
});
