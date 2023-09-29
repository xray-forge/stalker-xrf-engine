import { describe, expect, it } from "@jest/globals";
import { CUIScriptWnd } from "xray16";

import { ExtensionsDialog } from "@/engine/core/ui/menu/extensions/ExtensionsDialog";
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
});
