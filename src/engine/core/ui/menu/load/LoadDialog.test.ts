import { describe, expect, it } from "@jest/globals";
import { CUIListBox, CUIMessageBoxEx, CUIScriptWnd, CUIStatic, CUITextWnd } from "xray16";

import { LoadDialog } from "@/engine/core/ui/menu/load/LoadDialog";
import { MockCUIScriptWnd } from "@/fixtures/xray";

describe("LoadDialog component", () => {
  it("should correctly create", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: LoadDialog = new LoadDialog(owner);

    expect(dialog.messageBoxMode).toBe(0);

    expect(dialog.uiForm).toBeInstanceOf(CUIStatic);
    expect(dialog.uiPicture).toBeInstanceOf(CUIStatic);
    expect(dialog.uiFileCaption).toBeInstanceOf(CUITextWnd);
    expect(dialog.uiFileData).toBeInstanceOf(CUITextWnd);
    expect(dialog.uiListBox).toBeInstanceOf(CUIListBox);
    expect(dialog.uiMessageBox).toBeInstanceOf(CUIMessageBoxEx);
  });

  it.todo("should correctly initialize");

  it.todo("should correctly render list");

  it.todo("should correctly process loading");

  it.todo("should correctly handle keyboard events");
});
