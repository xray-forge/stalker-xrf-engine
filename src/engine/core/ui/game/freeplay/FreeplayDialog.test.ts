import { describe, expect, it, jest } from "@jest/globals";
import { CUIMessageBoxEx } from "xray16";

import { FreeplayDialog } from "@/engine/core/ui/game/freeplay/FreeplayDialog";
import { createScreenRectangle } from "@/engine/core/utils/rectangle";

describe("FreeplayDialog.test.ts class", () => {
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
});
