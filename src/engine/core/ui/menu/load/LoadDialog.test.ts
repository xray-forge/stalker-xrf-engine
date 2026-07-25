import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  CUIListBox,
  CUIMessageBoxEx,
  CUIScriptWnd,
  CUIStatic,
  CUITextWnd,
  DIK_keys,
  dik_to_bind,
  key_bindings,
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
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

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
    resetFunctionMock(dik_to_bind);
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

  it("should reset preview when nothing is selected", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    // Empty list returns early, so a non-empty list with an invalid selection is needed here.
    dialog.addItemToList("some-save", "[now]");
    jest.spyOn(dialog.uiListBox, "GetSelectedItem").mockImplementation(() => null as never);

    dialog.onListItemClicked();

    expect(dialog.uiFileCaption.GetText()).toBe("");
    expect(dialog.uiFileData.GetText()).toBe("");
    expect(dialog.uiPicture.InitTexture).toHaveBeenCalledWith("ui_ui_noise");
  });

  it("should show save preview picture when it exists", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    replaceFunctionMock(isGameSaveFileExist, () => true);
    replaceFunctionMock(getFileDataForGameSave, () => "save-data");

    dialog.addItemToList("preview-save", "[now]");
    dialog.uiListBox.SetSelectedIndex(0);
    dialog.onListItemClicked();

    expect(dialog.uiFileCaption.GetText()).toBe("preview-save");
    expect(dialog.uiFileData.GetText()).toBe("save-data");
    expect(dialog.uiPicture.InitTexture).toHaveBeenCalledWith("preview-save");
  });

  it("should drop list items whose save file is missing", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    replaceFunctionMock(isGameSaveFileExist, () => false);

    dialog.addItemToList("missing-save", "[now]");
    dialog.uiListBox.SetSelectedIndex(0);
    dialog.onListItemClicked();

    expect(dialog.uiListBox.RemoveItem).toHaveBeenCalledTimes(1);
  });

  it("should load on list item double click", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    jest.spyOn(dialog, "onLoadButtonClicked").mockImplementation(jest.fn());

    dialog.onListItemDoubleClicked();

    expect(dialog.onLoadButtonClicked).toHaveBeenCalledTimes(1);
  });

  it("should not delete anything without a selected save", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    dialog.uiListBox.RemoveAll();
    dialog.onDeleteButtonClicked();

    expect(dialog.messageBoxMode).toBe(0);
    expect(dialog.uiMessageBox.ShowDialog).not.toHaveBeenCalled();
  });

  it("should confirm and perform save deletion", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    dialog.addItemToList("delete-save", "[now]");
    dialog.uiListBox.SetSelectedIndex(0);

    dialog.onDeleteButtonClicked();

    expect(dialog.messageBoxMode).toBe(1);
    expect(dialog.uiMessageBox.InitMessageBox).toHaveBeenCalledWith("message_box_delete_file_name");

    dialog.onConfirmedLoadClicked();

    expect(deleteGameSave).toHaveBeenCalledWith("delete-save");
    expect(dialog.uiListBox.RemoveItem).toHaveBeenCalledTimes(1);
    expect(dialog.messageBoxMode).toBe(0);
  });

  it("should ignore confirmation without selection", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    dialog.uiListBox.RemoveAll();
    jest.spyOn(dialog.uiListBox, "GetSelectedIndex").mockImplementation(() => -1);

    dialog.onConfirmedLoadClicked();

    expect(deleteGameSave).not.toHaveBeenCalled();
    expect(loadGameSave).not.toHaveBeenCalled();
  });

  it("should load directly when no game is running", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    dialog.addItemToList("direct-save", "[now]");
    dialog.uiListBox.SetSelectedIndex(0);

    dialog.onLoadButtonClicked();

    expect(loadGameSave).toHaveBeenCalledWith("direct-save");
    expect(dialog.uiMessageBox.ShowDialog).not.toHaveBeenCalled();
  });

  it("should load directly when the actor is dead", () => {
    const { actorGameObject } = mockRegisteredActor();
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    registerSimulator();
    jest.spyOn(actorGameObject, "alive").mockImplementation(() => false);

    dialog.addItemToList("dead-actor-save", "[now]");
    dialog.uiListBox.SetSelectedIndex(0);

    dialog.onLoadButtonClicked();

    expect(loadGameSave).toHaveBeenCalledWith("dead-actor-save");
  });

  it("should not load without any saves in the list", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    dialog.uiListBox.RemoveAll();

    dialog.onLoadButtonClicked();
    dialog.loadGameInternal();

    expect(loadGameSave).not.toHaveBeenCalled();
  });

  it("should return to the owner menu on back click", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: LoadDialog = new LoadDialog(owner);

    jest.spyOn(owner, "Show");

    dialog.onBackButtonClicked();

    expect(owner.ShowDialog).toHaveBeenCalledWith(true);
    expect(dialog.HideDialog).toHaveBeenCalledTimes(1);
    expect(owner.Show).toHaveBeenCalledWith(true);
  });

  it("should route quit keyboard binding to back click", () => {
    const dialog: LoadDialog = new LoadDialog(MockCUIScriptWnd.mock());

    jest.spyOn(dialog, "onBackButtonClicked").mockImplementation(jest.fn());
    replaceFunctionMock(dik_to_bind, () => key_bindings.kQUIT);

    dialog.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);

    expect(dialog.onBackButtonClicked).toHaveBeenCalledTimes(1);
  });
});
