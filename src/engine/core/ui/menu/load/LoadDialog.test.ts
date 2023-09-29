import { describe, expect, it } from "@jest/globals";
import { CUIScriptWnd } from "xray16";

import { LoadDialog } from "@/engine/core/ui/menu/load/LoadDialog";
import { MockCUIScriptWnd } from "@/fixtures/xray";

describe("LoadDialog component", () => {
  it("should correctly create", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: LoadDialog = new LoadDialog(owner);

    expect(dialog.messageBoxMode).toBe(0);
  });

  it.todo("should correctly initialize");

  it.todo("should correctly render list");

  it.todo("should correctly process loading");

  it.todo("should correctly handle keyboard events");
});
