import { describe, expect, it, jest } from "@jest/globals";
import { CUIGameCustom, get_hud } from "xray16";
import { GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { IRegistryObjectState, registerActor, registerObject } from "@/engine/core/database";
import { SchemeTimer } from "@/engine/core/schemes/restrictor/sr_timer/SchemeTimer";
import { ETimerType, ISchemeTimerState } from "@/engine/core/schemes/restrictor/sr_timer/sr_timer_types";
import { TimerController } from "@/engine/core/schemes/restrictor/sr_timer/TimerController";
import { activateSchemeBySection, loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { getSchemeStateOptimistic } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { getSchemeAction, mockSchemeState } from "@/fixtures/engine/mocks";

describe("TimerController", () => {
  it("should correctly activate and deactivate with label and timer id", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeTimerState = mockSchemeState<ISchemeTimerState>(EScheme.SR_TIMER, {
      timerId: "timer-id",
      string: "timer-label",
    });
    const timerController: TimerController = new TimerController(object, state);
    const hud: CUIGameCustom = get_hud();

    timerController.activate();

    expect(hud.GetCustomStatic("timer-id")).toBeDefined();
    expect(hud.GetCustomStatic("hud_timer_text")!.wnd().TextControl().GetText()).toBe("timer-label");

    timerController.deactivate();

    expect(hud.GetCustomStatic("timer-id")).toBeNull();
    expect(hud.GetCustomStatic("hud_timer_text")).toBeNull();
  });

  it("should correctly activate and deactivate without custom label", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeTimerState = mockSchemeState<ISchemeTimerState>(EScheme.SR_TIMER, {
      timerId: "timer-id",
    });
    const timerController: TimerController = new TimerController(object, state);
    const hud: CUIGameCustom = get_hud();

    timerController.activate();

    expect(hud.GetCustomStatic("timer-id")).toBeDefined();
    expect(hud.GetCustomStatic("hud_timer_text")).toBeNull();

    timerController.deactivate();

    expect(hud.GetCustomStatic("timer-id")).toBeNull();
    expect(hud.GetCustomStatic("hud_timer_text")).toBeNull();
  });

  it("should correctly call updates", () => {
    registerActor(MockGameObject.mock());

    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
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

    const schemeState: ISchemeTimerState = getSchemeStateOptimistic(state, EScheme.SR_TIMER);
    const timerController: TimerController = getSchemeAction(schemeState);

    jest.spyOn(timerController, "deactivate");

    jest.spyOn(Date, "now").mockImplementation(() => 20_000);
    timerController.update();
    expect(schemeState.timer.TextControl().GetText()).toBe("0:00:50");
    expect(timerController.deactivate).not.toHaveBeenCalled();

    jest.spyOn(Date, "now").mockImplementation(() => 65_000);
    timerController.update();
    expect(schemeState.timer.TextControl().GetText()).toBe("0:00:05");
    expect(timerController.deactivate).not.toHaveBeenCalled();

    jest.spyOn(Date, "now").mockImplementation(() => 95_000);
    timerController.update();

    expect(schemeState.timer.TextControl().GetText()).toBe("0:00:00");
    expect(timerController.deactivate).toHaveBeenCalled();
    expect(state.activeScheme).toBeNull();
    expect(state.activeSection).toBeNull();
    expect(state.activationTime).toBe(95_000);
  });
});
