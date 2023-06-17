import { describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { IBaseSchemeState } from "@/engine/core/schemes";
import { SchemeIdle } from "@/engine/core/schemes/sr_idle";
import { SchemeTimer } from "@/engine/core/schemes/sr_timer";
import { TimerManager } from "@/engine/core/schemes/sr_timer/TimerManager";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme/setup";
import { switchObjectSchemeToSection } from "@/engine/core/utils/scheme/switch";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { getSchemeAction, mockSchemeState } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("'switch logic' utils", () => {
  it("'trySwitchToAnotherSection' should correctly reset base schemes", () => {
    // todo;
  });

  it("'switchObjectSchemeToSection' should correctly reset base schemes", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: IBaseSchemeState = mockSchemeState(object, EScheme.SR_IDLE, {
      actions: new LuaTable(),
    });
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_idle@active": {},
      "sr_timer@next": {},
    });

    loadSchemeImplementation(SchemeIdle);
    loadSchemeImplementation(SchemeTimer);

    state.active_scheme = EScheme.SR_IDLE;
    state.active_section = "sr_idle@active";
    state[EScheme.SR_IDLE] = schemeState;

    const handler = {
      deactivate: jest.fn(),
    };

    schemeState.actions = new LuaTable();
    schemeState.actions.set(handler, true);

    expect(switchObjectSchemeToSection(object, ini, "")).toBe(false);
    expect(switchObjectSchemeToSection(object, ini, null)).toBe(false);
    expect(handler.deactivate).not.toHaveBeenCalled();

    jest.spyOn(TimerManager.prototype, "resetScheme").mockImplementation(jest.fn);

    expect(switchObjectSchemeToSection(object, ini, "sr_timer@next")).toBe(true);
    expect(handler.deactivate).toHaveBeenCalledTimes(1);
    expect(state.active_scheme).toBe(EScheme.SR_TIMER);
    expect(state.active_section).toBe("sr_timer@next");
    expect(state[EScheme.SR_TIMER]).toBeDefined();
    expect(getSchemeAction(state[EScheme.SR_TIMER] as IBaseSchemeState).resetScheme).toHaveBeenCalledTimes(1);
  });
});
