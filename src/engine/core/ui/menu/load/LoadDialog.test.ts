import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  CUIListBox,
  CUIMessageBoxEx,
  CUIScriptWnd,
  CUIStatic,
  CUITextWnd,
  DIK_keys,
  ui_events,
  valid_saved_game,
} from "xray16";
import { FSItem } from "xray16/alias";
import { $fromArray } from "xray16/macros";
import { MockCUIScriptWnd } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registerSimulator } from "@/engine/core/database";
import { LoadDialog } from "@/engine/core/ui/menu/load/LoadDialog";
import {
  deleteGameSave,
  getFileDataForGameSave,
  getGameSaves,
  isGameSaveFileExist,
  loadGameSave,
} from "@/engine/core/utils/game_save";
import { resetRegistry } from "@/fixtures/engine";

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

describe("LoadDialog component", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(deleteGameSave);
    resetFunctionMock(getFileDataForGameSave);
    resetFunctionMock(isGameSaveFileExist);
    resetFunctionMock(loadGameSave);
    resetFunctionMock(valid_saved_game);
    replaceFunctionMock(getGameSaves, () => new LuaTable());
    replaceFunctionMock(valid_saved_game, () => true);
  });

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

  it("should correctly initialize controls", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    expect(dialog.uiListBox.ShowSelectedItem).toHaveBeenCalledWith(true);
    expect(dialog.SetWndRect).toHaveBeenCalledTimes(1);
    expect(dialog.uiFileCaption).toBeInstanceOf(CUITextWnd);
    expect(dialog.uiFileData).toBeInstanceOf(CUITextWnd);
  });

  it("should render available saves and their selected metadata", () => {
    replaceFunctionMock(getGameSaves, () => $fromArray([mockSave("first.scop"), mockSave("second.scop")]));
    replaceFunctionMock(getFileDataForGameSave, (name) => `data:${name}`);
    replaceFunctionMock(isGameSaveFileExist, () => true);

    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    dialog.fillList();
    expect(dialog.uiListBox.GetSize()).toBe(2);
    expect(dialog.uiListBox.GetItemByIndex(0).uiInnerNameText.GetText()).toBe("first");

    dialog.uiListBox.SetSelectedIndex(1);
    dialog.onListItemClicked();

    expect(dialog.uiFileCaption.GetText()).toBe("second");
    expect(dialog.uiFileData.GetText()).toBe("data:second");
  });

  it("should load immediately without an active game and delete after confirmation", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    dialog.addItemToList("save-to-load", "[now]");
    dialog.uiListBox.SetSelectedIndex(0);
    dialog.loadGameInternal();
    expect(loadGameSave).toHaveBeenCalledWith("save-to-load");

    dialog.onDeleteButtonClicked();
    expect(dialog.messageBoxMode).toBe(1);
    expect(dialog.uiMessageBox.InitMessageBox).toHaveBeenCalledWith("message_box_delete_file_name");

    dialog.onConfirmedLoadClicked();
    expect(deleteGameSave).toHaveBeenCalledWith("save-to-load");
    expect(dialog.uiListBox.GetSize()).toBe(0);
    expect(dialog.messageBoxMode).toBe(0);
  });

  it("should remove unavailable saves and request confirmation before loading an active game", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    dialog.addItemToList("missing-save", "[now]");
    replaceFunctionMock(isGameSaveFileExist, () => false);
    dialog.onListItemClicked();

    expect(dialog.uiListBox.GetSize()).toBe(0);

    dialog.addItemToList("active-save", "[now]");
    replaceFunctionMock(isGameSaveFileExist, () => true);
    registerSimulator();
    dialog.onLoadButtonClicked();

    expect(dialog.messageBoxMode).toBe(2);
    expect(dialog.uiMessageBox.InitMessageBox).toHaveBeenLastCalledWith("message_box_confirm_load_save");

    dialog.onConfirmedLoadClicked();
    expect(loadGameSave).toHaveBeenCalledWith("active-save");
  });

  it("should report invalid saves without loading them", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    dialog.addItemToList("invalid-save", "[now]");
    replaceFunctionMock(valid_saved_game, () => false);
    dialog.onLoadButtonClicked();

    expect(dialog.uiMessageBox.InitMessageBox).toHaveBeenCalledWith("message_box_invalid_saved_game");
    expect(loadGameSave).not.toHaveBeenCalled();
  });

  it("should route Return keyboard events to loading", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    jest.spyOn(dialog, "onLoadButtonClicked").mockImplementation(jest.fn());

    dialog.OnKeyboard(DIK_keys.DIK_RETURN, ui_events.WINDOW_KEY_PRESSED);

    expect(dialog.onLoadButtonClicked).toHaveBeenCalledTimes(1);
  });
});
