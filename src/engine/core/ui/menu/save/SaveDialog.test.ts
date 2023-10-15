import { describe, expect, it } from "@jest/globals";
import { CUIEditBox, CUIListBox, CUIMessageBoxEx, CUIScriptWnd, CUIStatic, vector2 } from "xray16";

import { SaveDialog } from "@/engine/core/ui/menu/save/SaveDialog";
import { MockCUIScriptWnd } from "@/fixtures/xray";

describe("SaveDialog component", () => {
  it("should correctly create", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: SaveDialog = new SaveDialog(owner);

    expect(dialog.newSave).toBe("");
    expect(dialog.modalBoxMode).toBe(0);

    expect(dialog.fileItemMainSize).toBeInstanceOf(vector2);
    expect(dialog.fileItemFnSize).toBeInstanceOf(vector2);
    expect(dialog.fileItemFdSize).toBeInstanceOf(vector2);

    expect(dialog.uiForm).toBeInstanceOf(CUIStatic);
    expect(dialog.uiEditBox).toBeInstanceOf(CUIEditBox);
    expect(dialog.uiListBox).toBeInstanceOf(CUIListBox);
    expect(dialog.uiMessageBox).toBeInstanceOf(CUIMessageBoxEx);
  });

  it.todo("should correctly initialize");

  it.todo("should correctly render list");

  it.todo("should correctly process saving");

  it.todo("should correctly handle keyboard events");
});
