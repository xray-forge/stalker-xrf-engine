import { describe, expect, it, jest } from "@jest/globals";
import { CUIMessageBoxEx, ui_events } from "xray16";
import { AnyCallable } from "xray16/lib";

import { FreeplayDialog } from "@/engine/core/ui/game/freeplay/FreeplayDialog";
import { createScreenRectangle } from "@/engine/core/utils/rectangle";

describe("FreeplayDialog", () => {
  it("should correctly initialize", () => {
    const dialog: FreeplayDialog = new FreeplayDialog();

    expect(dialog.SetWndRect).toHaveBeenCalledTimes(1);
    expect(dialog.SetWndRect).toHaveBeenCalledWith(createScreenRectangle());
    expect(dialog.uiMessageBox).toBeInstanceOf(CUIMessageBoxEx);
  });

  it("should correctly initialize", () => {
    const dialog: FreeplayDialog = new FreeplayDialog();

    jest.spyOn(dialog.uiMessageBox, "InitMessageBox").mockImplementation(jest.fn());
    jest.spyOn(dialog.uiMessageBox, "SetText").mockImplementation(jest.fn());
    jest.spyOn(dialog.uiMessageBox, "ShowDialog").mockImplementation(jest.fn());

    dialog.Show("test-selector", "test-text");

    expect(dialog.uiMessageBox.InitMessageBox).toHaveBeenCalledWith("test-selector");
    expect(dialog.uiMessageBox.SetText).toHaveBeenCalledWith("test-text");
    expect(dialog.uiMessageBox.ShowDialog).toHaveBeenCalledWith(true);
  });

  it("should route registered message box callbacks to handlers", () => {
    const dialog: FreeplayDialog = new FreeplayDialog();

    jest.spyOn(dialog, "onOkMessageClicked").mockImplementation(jest.fn());
    jest.spyOn(dialog, "onYesMessageClicked").mockImplementation(jest.fn());
    jest.spyOn(dialog, "onNoMessageClicked").mockImplementation(jest.fn());

    const callbacks: Map<number, AnyCallable> = new Map(
      jest.mocked(dialog.AddCallback).mock.calls.map(([, event, callback]) => [event as number, callback])
    );

    callbacks.get(ui_events.MESSAGE_BOX_OK_CLICKED)?.();
    callbacks.get(ui_events.MESSAGE_BOX_YES_CLICKED)?.();
    callbacks.get(ui_events.MESSAGE_BOX_NO_CLICKED)?.();

    expect(dialog.onOkMessageClicked).toHaveBeenCalledTimes(1);
    expect(dialog.onYesMessageClicked).toHaveBeenCalledTimes(1);
    expect(dialog.onNoMessageClicked).toHaveBeenCalledTimes(1);
  });
});
