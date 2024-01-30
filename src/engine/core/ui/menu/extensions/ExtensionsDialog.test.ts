import { describe, expect, it, jest } from "@jest/globals";
import { CUIScriptWnd } from "xray16";

import { ExtensionsDialog } from "@/engine/core/ui/menu/extensions/ExtensionsDialog";
import { IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import { mockExtension } from "@/fixtures/engine";
import { MockLuaTable } from "@/fixtures/lua";
import { MockCUIScriptWnd } from "@/fixtures/xray";

describe("ExtensionsDialog component", () => {
  it("should correctly create", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: ExtensionsDialog = new ExtensionsDialog(owner);

    expect(dialog.extensions).toEqualLuaArrays([]);
  });

  it.todo("should correctly initialize");

  it.todo("should correctly render list");

  it.todo("should correctly process changes of ordering");

  it.todo("should correctly handle keyboard events");

  it("should correctly handle extension toggle", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: ExtensionsDialog = new ExtensionsDialog(owner);
    const first: IExtensionsDescriptor = mockExtension();
    const second: IExtensionsDescriptor = mockExtension();

    dialog.extensions = MockLuaTable.mockFromArray([first, second]);

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
