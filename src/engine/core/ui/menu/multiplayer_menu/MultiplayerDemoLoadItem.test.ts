import { describe, expect, it } from "@jest/globals";
import { CScriptXmlInit, CUI3tButton, CUIScriptWnd, CUITextWnd } from "xray16";

import { MultiplayerDemo } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemo";
import { MultiplayerDemoLoadItem } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemoLoadItem";
import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { MockCScriptXmlInit } from "@/fixtures/xray";

describe("MultiplayerDemoLoadItem", () => {
  it("should correctly initialize", () => {
    const owner: MultiplayerMenu = new CUIScriptWnd() as MultiplayerMenu;
    const xml: CScriptXmlInit = MockCScriptXmlInit.mock();
    const multiplayerDemo: MultiplayerDemo = new MultiplayerDemo(owner, xml);
    const loadItem: MultiplayerDemoLoadItem = new MultiplayerDemoLoadItem(multiplayerDemo, 0, 1, 2);

    expect(loadItem.filename).toBe("filename");
    expect(loadItem.uiFileNameText).toBeInstanceOf(CUITextWnd);
    expect(loadItem.uiFileNameText).toBeInstanceOf(CUITextWnd);
    expect(loadItem.uiFileAgeText).toBeInstanceOf(CUITextWnd);
    expect(loadItem.uiDeleteButton).toBeInstanceOf(CUI3tButton);

    expect(loadItem.SetTextColor).toHaveBeenCalled();

    expect(loadItem.uiFileNameText.SetFont).toHaveBeenCalled();
    expect(loadItem.uiFileNameText.SetWndPos).toHaveBeenCalled();
    expect(loadItem.uiFileNameText.SetWndSize).toHaveBeenCalled();
    expect(loadItem.uiFileNameText.SetEllipsis).toHaveBeenCalled();

    expect(loadItem.uiFileAgeText.SetFont).toHaveBeenCalled();
    expect(loadItem.uiFileAgeText.SetWndSize).toHaveBeenCalled();
  });
});
