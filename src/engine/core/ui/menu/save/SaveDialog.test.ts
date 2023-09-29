import { describe, expect, it } from "@jest/globals";
import { CUIScriptWnd } from "xray16";

import { SaveDialog } from "@/engine/core/ui/menu/save/SaveDialog";
import { MockCUIScriptWnd } from "@/fixtures/xray";

describe("SaveDialog component", () => {
  it("should correctly create", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: SaveDialog = new SaveDialog(owner);

    expect(dialog.newSave).toBe("");
  });

  it.todo("should correctly initialize");

  it.todo("should correctly render list");

  it.todo("should correctly process saving");

  it.todo("should correctly handle keyboard events");
});
