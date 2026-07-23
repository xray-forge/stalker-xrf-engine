import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CUIScriptWnd, DIK_keys, ui_events } from "xray16";
import { $fromArray } from "xray16/macros";
import { MockCUIScriptWnd } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { getAvailableExtensions, IExtensionsDescriptor } from "@/engine/core/extensions";
import {
  loadExtensionsState,
  saveExtensionsState,
  syncExtensionsState,
} from "@/engine/core/extensions/extensions_state";
import { ExtensionsDialog } from "@/engine/core/ui/menu/extensions/ExtensionsDialog";
import { mockExtension } from "@/fixtures/engine";

jest.mock("@/engine/core/extensions");
jest.mock("@/engine/core/extensions/extensions_state");

describe("ExtensionsDialog component", () => {
  beforeEach(() => {
    resetFunctionMock(saveExtensionsState);
    replaceFunctionMock(getAvailableExtensions, () => new LuaTable());
    replaceFunctionMock(loadExtensionsState, () => new LuaTable());
    replaceFunctionMock(syncExtensionsState, (available) => available);
  });

  it("should correctly create", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: ExtensionsDialog = new ExtensionsDialog(owner);

    expect(dialog.extensions).toEqualLuaArrays([]);
  });

  it("should correctly initialize controls for an empty and populated list", () => {
    const empty: ExtensionsDialog = new ExtensionsDialog(MockCUIScriptWnd.mock());

    expect(empty.uiItemsList.ShowSelectedItem).toHaveBeenCalledWith(true);
    expect(empty.uiUpButton.IsEnabled()).toBe(false);
    expect(empty.uiDownButton.IsEnabled()).toBe(false);

    const extension: IExtensionsDescriptor = mockExtension({ canToggle: true, name: "first" });

    replaceFunctionMock(getAvailableExtensions, () => $fromArray([extension]));

    const dialog: ExtensionsDialog = new ExtensionsDialog(MockCUIScriptWnd.mock());

    expect(dialog.uiItemsList.GetSelectedIndex()).toBe(0);
    expect(dialog.uiToggleButton.IsEnabled()).toBe(true);
    expect(dialog.uiUpButton.IsEnabled()).toBe(false);
    expect(dialog.uiDownButton.IsEnabled()).toBe(false);
  });

  it("should render the current extension order", () => {
    const first: IExtensionsDescriptor = mockExtension({ name: "first" });
    const second: IExtensionsDescriptor = mockExtension({ name: "second" });
    const dialog: ExtensionsDialog = new ExtensionsDialog(MockCUIScriptWnd.mock());

    dialog.extensions = $fromArray([first, second]);
    dialog.fillItemsList();

    expect(dialog.uiItemsList.GetSize()).toBe(2);
    expect(dialog.uiItemsList.GetItemByIndex(0).uiInnerNameText.GetText()).toBe("first");
    expect(dialog.uiItemsList.GetItemByIndex(1).uiInnerNameText.GetText()).toBe("second");
  });

  it("should change ordering only within list boundaries and persist accepted changes", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const first: IExtensionsDescriptor = mockExtension({ name: "first" });
    const second: IExtensionsDescriptor = mockExtension({ name: "second" });
    const dialog: ExtensionsDialog = new ExtensionsDialog(owner);

    dialog.extensions = $fromArray([first, second]);
    dialog.fillItemsList();
    dialog.uiItemsList.SetSelectedIndex(0);
    dialog.onUpButtonClick();
    expect(dialog.extensions).toEqualLuaArrays([first, second]);

    dialog.onDownButtonClick();
    expect(dialog.extensions).toEqualLuaArrays([second, first]);
    expect(dialog.uiItemsList.GetSelectedIndex()).toBe(1);

    dialog.onAcceptButtonClick();
    expect(saveExtensionsState).toHaveBeenCalledWith(dialog.extensions);
    expect(owner.ShowDialog).toHaveBeenCalledWith(true);
    expect(dialog.HideDialog).toHaveBeenCalledTimes(1);
  });

  it("should discard changes when Escape is pressed", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: ExtensionsDialog = new ExtensionsDialog(owner);

    jest.spyOn(dialog, "onCancelButtonClick");
    dialog.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);

    expect(dialog.onCancelButtonClick).toHaveBeenCalledTimes(1);
    expect(owner.ShowDialog).toHaveBeenCalledWith(true);
    expect(dialog.HideDialog).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle extension toggle", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: ExtensionsDialog = new ExtensionsDialog(owner);
    const first: IExtensionsDescriptor = mockExtension();
    const second: IExtensionsDescriptor = mockExtension();

    dialog.extensions = $fromArray([first, second]);

    jest.spyOn(dialog.uiItemsList, "GetSelectedIndex").mockImplementation(() => 10);
    jest.spyOn(dialog, "fillItemsList").mockImplementation(jest.fn());

    dialog.onToggleButtonClick();

    expect(dialog.fillItemsList).toHaveBeenCalledTimes(0);
    expect(dialog.uiItemsList.SetSelectedIndex).toHaveBeenCalledTimes(0);

    jest.spyOn(dialog.uiItemsList, "GetSelectedIndex").mockImplementation(() => 1);

    dialog.onToggleButtonClick();

    expect(first.isEnabled).toBe(true);
    expect(second.isEnabled).toBe(false);

    expect(dialog.fillItemsList).toHaveBeenCalledTimes(1);
    expect(dialog.uiItemsList.SetSelectedIndex).toHaveBeenCalledTimes(1);

    jest.spyOn(dialog.uiItemsList, "GetSelectedIndex").mockImplementation(() => 0);

    dialog.onToggleButtonClick();

    expect(first.isEnabled).toBe(false);
    expect(second.isEnabled).toBe(false);

    expect(dialog.fillItemsList).toHaveBeenCalledTimes(2);
    expect(dialog.uiItemsList.SetSelectedIndex).toHaveBeenCalledTimes(2);
  });
});
