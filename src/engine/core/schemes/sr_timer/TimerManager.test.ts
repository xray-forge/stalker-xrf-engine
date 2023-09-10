import { describe, expect, it, jest } from "@jest/globals";
import { CUIGameCustom, get_hud } from "xray16";

import { IRegistryObjectState, registerActor, registerObject } from "@/engine/core/database";
import { ETimerType, ISchemeTimerState } from "@/engine/core/schemes/sr_timer/ISchemeTimerState";
import { SchemeTimer } from "@/engine/core/schemes/sr_timer/SchemeTimer";
import { TimerManager } from "@/engine/core/schemes/sr_timer/TimerManager";
import { activateSchemeBySection, loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { getSchemeAction, mockSchemeState } from "@/fixtures/engine/mocks";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("TimerManager class", () => {
  it("should correctly activate and deactivate with label and timer id", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeTimerState = mockSchemeState<ISchemeTimerState>(EScheme.SR_TIMER, {
      timerId: "timer-id",
      string: "timer-label",
    });
    const timerManager: TimerManager = new TimerManager(object, state);
    const hud: CUIGameCustom = get_hud();

    timerManager.activate();

    expect(hud.GetCustomStatic("timer-id")).toBeDefined();
    expect(hud.GetCustomStatic("hud_timer_text")!.wnd().TextControl().GetText()).toBe("timer-label");

    timerManager.deactivate();

    expect(hud.GetCustomStatic("timer-id")).toBeNull();
    expect(hud.GetCustomStatic("hud_timer_text")).toBeNull();
  });

  it("should correctly activate and deactivate without custom label", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeTimerState = mockSchemeState<ISchemeTimerState>(object, EScheme.SR_TIMER, {
      timerId: "timer-id",
    });
    const timerManager: TimerManager = new TimerManager(object, state);
    const hud: CUIGameCustom = get_hud();

    timerManager.activate();

    expect(hud.GetCustomStatic("timer-id")).toBeDefined();
    expect(hud.GetCustomStatic("hud_timer_text")).toBeNull();

    timerManager.deactivate();

    expect(hud.GetCustomStatic("timer-id")).toBeNull();
    expect(hud.GetCustomStatic("hud_timer_text")).toBeNull();
  });

  it("should correctly call updates", () => {
    registerActor(mockClientGameObject());

    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_timer@test": {
        type: ETimerType.DECREMENT,
        start_value: 60_000,
        timer_id: "timer-id",
        string: "timer-label",
        on_value: "0 | nil",
      },
    });

    jest.spyOn(Date, "now").mockImplementation(() => 10_000);

    registerObject(object);
    loadSchemeImplementation(SchemeTimer);
    activateSchemeBySection(object, ini, "sr_timer@test", null, false);

    const schemeState: ISchemeTimerState = state[EScheme.SR_TIMER] as ISchemeTimerState;
    const timerManager: TimerManager = getSchemeAction(schemeState);

    jest.spyOn(timerManager, "deactivate");

    jest.spyOn(Date, "now").mockImplementation(() => 20_000);
    timerManager.update();
    expect(schemeState.timer.TextControl().GetText()).toBe("0:00:50");
    expect(timerManager.deactivate).not.toHaveBeenCalled();

    jest.spyOn(Date, "now").mockImplementation(() => 65_000);
    timerManager.update();
    expect(schemeState.timer.TextControl().GetText()).toBe("0:00:05");
    expect(timerManager.deactivate).not.toHaveBeenCalled();

    jest.spyOn(Date, "now").mockImplementation(() => 95_000);
    timerManager.update();

    expect(schemeState.timer.TextControl().GetText()).toBe("0:00:00");
    expect(timerManager.deactivate).toHaveBeenCalled();
    expect(state.activeScheme).toBeNull();
    expect(state.activeSection).toBeNull();
    expect(state.activationTime).toBe(95_000);
  });
});
