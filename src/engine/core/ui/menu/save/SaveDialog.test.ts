import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CUIEditBox, CUIListBox, CUIMessageBoxEx, CUIScriptWnd, CUIStatic, DIK_keys, ui_events, vector2 } from "xray16";
import { FSItem } from "xray16/alias";
import { $fromArray } from "xray16/macros";
import { MockCUIScriptWnd, MockFileSystem, MockFileSystemList } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { SaveDialog } from "@/engine/core/ui/menu/save/SaveDialog";
import { createGameSave, deleteGameSave, getGameSaves } from "@/engine/core/utils/game_save";

jest.mock("@/engine/core/utils/game_save");

function mockSave(name: string): FSItem {
  return {
    Modif: () => "",
    ModifDigitOnly: () => "12:00",
    NameFull: () => name,
    NameShort: () => name,
    Size: () => 0,
  };
}

describe("SaveDialog component", () => {
  beforeEach(() => {
    resetFunctionMock(createGameSave);
    resetFunctionMock(deleteGameSave);
    replaceFunctionMock(getGameSaves, () => new LuaTable());

    const fileSystem: MockFileSystem = MockFileSystem.getInstance();

    fileSystem.exist.mockReset();
    fileSystem.file_list_open.mockReset();
    fileSystem.file_list_open.mockImplementation(() => new MockFileSystemList());
  });

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

  it("should correctly initialize controls", () => {
    const dialog: SaveDialog = new SaveDialog(MockCUIScriptWnd.mock());

    expect(dialog.uiListBox.ShowSelectedItem).toHaveBeenCalledWith(true);
    expect(dialog.SetWndRect).toHaveBeenCalledTimes(1);
    expect(dialog.fileItemMainSize.x).toBeGreaterThanOrEqual(0);
    expect(dialog.fileItemFnSize.y).toBeGreaterThanOrEqual(0);
    expect(dialog.fileItemFdSize.y).toBeGreaterThanOrEqual(0);
  });

  it("should correctly render available saves and select their name", () => {
    replaceFunctionMock(getGameSaves, () => $fromArray([mockSave("first.scop"), mockSave("second.scop")]));

    const dialog: SaveDialog = new SaveDialog(MockCUIScriptWnd.mock());

    expect(dialog.uiListBox.GetSize()).toBe(2);
    expect(dialog.uiListBox.GetItemByIndex(0).uiInnerNameText.GetText()).toBe("first");
    expect(dialog.uiListBox.GetItemByIndex(1).uiInnerNameText.GetText()).toBe("second");

    dialog.uiListBox.SetSelectedIndex(1);
    dialog.onListItemClicked();

    expect(dialog.uiEditBox.GetText()).toBe("second");
  });

  it("should validate, confirm, create, and delete saves", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: SaveDialog = new SaveDialog(owner);

    dialog.onOkButtonClicked();
    expect(dialog.uiMessageBox.InitMessageBox).toHaveBeenCalledWith("message_box_empty_file_name");

    dialog.uiEditBox.SetText("new-save");
    dialog.onOkButtonClicked();

    expect(createGameSave).toHaveBeenCalledWith("new-save");
    expect(owner.ShowDialog).toHaveBeenCalledWith(true);
    expect(dialog.HideDialog).toHaveBeenCalled();

    MockFileSystem.getInstance().exist.mockReturnValue({} as never);
    dialog.uiEditBox.SetText("existing-save");
    dialog.onOkButtonClicked();
    expect(dialog.modalBoxMode).toBe(1);
    expect(dialog.uiMessageBox.InitMessageBox).toHaveBeenLastCalledWith("message_box_file_already_exist");

    dialog.onMessageYesClicked();
    expect(createGameSave).toHaveBeenLastCalledWith("existing-save");

    dialog.addItemToList("obsolete", "[now]");
    dialog.uiListBox.SetSelectedIndex(0);
    dialog.onDeleteButtonClicked();
    expect(dialog.modalBoxMode).toBe(2);
    expect(dialog.uiMessageBox.InitMessageBox).toHaveBeenLastCalledWith("message_box_delete_file_name");

    dialog.onMessageYesClicked();
    expect(deleteGameSave).toHaveBeenCalledWith("obsolete");
    expect(dialog.uiListBox.GetSize()).toBe(0);
  });

  it("should route Return keyboard events to saving", () => {
    const dialog: SaveDialog = new SaveDialog(MockCUIScriptWnd.mock());

    jest.spyOn(dialog, "onOkButtonClicked").mockImplementation(jest.fn());

    dialog.OnKeyboard(DIK_keys.DIK_RETURN, ui_events.WINDOW_KEY_PRESSED);

    expect(dialog.onOkButtonClicked).toHaveBeenCalledTimes(1);
  });
});
