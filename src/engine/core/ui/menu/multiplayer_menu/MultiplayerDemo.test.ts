import { describe, expect, it } from "@jest/globals";
import {
  CScriptXmlInit,
  CUIEditBox,
  CUIListBox,
  CUIMapInfo,
  CUIMessageBoxEx,
  CUIScriptWnd,
  CUIStatic,
  CUITextWnd,
  vector2,
} from "xray16";

import { MultiplayerDemo } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemo";
import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { MockCScriptXmlInit } from "@/fixtures/xray";

describe("MultiplayerDemo", () => {
  it("should correctly initialize", () => {
    const owner: MultiplayerMenu = new CUIScriptWnd() as MultiplayerMenu;
    const xml: CScriptXmlInit = MockCScriptXmlInit.mock();
    const multiplayerDemo: MultiplayerDemo = new MultiplayerDemo(owner, xml);

    expect(multiplayerDemo.owner).toBe(owner);
    expect(multiplayerDemo.xml).toBe(xml);

    expect(multiplayerDemo.uiMapPic).toBeInstanceOf(CUIStatic);
    expect(multiplayerDemo.uiMapInfo).toBeInstanceOf(CUIMapInfo);
    expect(multiplayerDemo.uiDemoList).toBeInstanceOf(CUIListBox);

    expect(multiplayerDemo.fileItemMainSz).toBeInstanceOf(vector2);
    expect(multiplayerDemo.fileItemFnSz).toBeInstanceOf(vector2);
    expect(multiplayerDemo.fileItemFdSz).toBeInstanceOf(vector2);

    expect(multiplayerDemo.uiMessageBox).toBeInstanceOf(CUIMessageBoxEx);
    expect(multiplayerDemo.uiGameType).toBeInstanceOf(CUITextWnd);
    expect(multiplayerDemo.uiPlayersCount).toBeInstanceOf(CUITextWnd);
    expect(multiplayerDemo.uiTeamStats).toBeInstanceOf(CUITextWnd);
    expect(multiplayerDemo.uiFileNameEdit).toBeInstanceOf(CUIEditBox);
    expect(multiplayerDemo.uiPlayersList).toBeInstanceOf(CUIListBox);

    expect(multiplayerDemo.playerItemMainSz).toBeInstanceOf(vector2);
    expect(multiplayerDemo.playerItemNameSz).toBeInstanceOf(vector2);
    expect(multiplayerDemo.playerItemColumnSz).toBeInstanceOf(vector2);
  });
});
