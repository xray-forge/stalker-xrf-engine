import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { sleepConfig } from "@/engine/core/managers/sleep/SleepConfig";
import { SleepManager } from "@/engine/core/managers/sleep/SleepManager";
import { SleepDialog } from "@/engine/core/ui/interaction/SleepDialog";
import { resetRegistry } from "@/fixtures/engine";
import { MockCUITrackBar } from "@/fixtures/xray";

jest.mock("@/engine/core/ui/interaction/SleepDialog", () => ({
  SleepDialog: class {
    public uiTimeTrack = MockCUITrackBar.mock();
    public show = jest.fn();
  },
}));

describe("SleepManager class", () => {
  beforeEach(() => {
    resetRegistry();
    sleepConfig.SLEEP_DIALOG = null;
  });

  it("should correctly show and initialize sleep dialog", () => {
    expect(sleepConfig.SLEEP_DIALOG).toBeNull();

    const sleepManager: SleepManager = SleepManager.getInstance();

    sleepManager.showSleepDialog();

    expect(sleepConfig.SLEEP_DIALOG).toBeInstanceOf(SleepDialog);
    expect(sleepConfig.SLEEP_DIALOG?.show).toHaveBeenCalled();
    expect(sleepConfig.SLEEP_DIALOG?.uiTimeTrack.SetCurrentValue).toHaveBeenCalled();
  });

  it("should correctly show and initialize sleep dialog if already dialog exists", () => {
    const sleepManager: SleepManager = SleepManager.getInstance();
    const sleepDialog: SleepDialog = new SleepDialog(sleepManager);

    sleepConfig.SLEEP_DIALOG = sleepDialog;

    sleepManager.showSleepDialog();

    expect(sleepConfig.SLEEP_DIALOG).toBe(sleepDialog);
    expect(sleepDialog.show).toHaveBeenCalled();
    expect(sleepDialog.uiTimeTrack.SetCurrentValue).toHaveBeenCalled();
  });

  it.todo("should correctly start sleeping");

  it.todo("should correctly handle sleeping callbacks start");

  it.todo("should correctly handle sleeping callbacks stop");
});
