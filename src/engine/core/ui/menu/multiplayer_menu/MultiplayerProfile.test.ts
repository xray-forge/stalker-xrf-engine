import { describe, expect, it } from "@jest/globals";
import {
  CScriptXmlInit,
  CUI3tButton,
  CUIComboBox,
  CUIEditBox,
  CUIMessageBoxEx,
  CUIScriptWnd,
  CUIScrollView,
  CUIWindow,
} from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { MultiplayerProfile } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerProfile";
import { MockCScriptXmlInit } from "@/fixtures/xray";

describe("MultiplayerProfile", () => {
  it("should correctly initialize", () => {
    const owner: MultiplayerMenu = new CUIScriptWnd() as MultiplayerMenu;
    const xml: CScriptXmlInit = MockCScriptXmlInit.mock();
    const multiplayerServer: MultiplayerProfile = new MultiplayerProfile(owner, xml);

    expect(multiplayerServer.owner).toBe(owner);
    expect(multiplayerServer.xml).toBe(xml);
    expect(multiplayerServer.uiAwardsWindow).toBeInstanceOf(CUIWindow);
    expect(multiplayerServer.uiBestResultsWindow).toBeInstanceOf(CUIWindow);
    expect(multiplayerServer.uiChangeNickMessageBoxCancel).toBeInstanceOf(CUIMessageBoxEx);
    expect(multiplayerServer.uiChangeNicMessageBox).toBeInstanceOf(CUIMessageBoxEx);
    expect(multiplayerServer.uiUniqueNickEditBox).toBeInstanceOf(CUIEditBox);
    expect(multiplayerServer.uiAvailableButton).toBeInstanceOf(CUI3tButton);
    expect(multiplayerServer.uiAvailableUniqueNickComboBox).toBeInstanceOf(CUIComboBox);
    expect(multiplayerServer.uiAwardsList).toBeInstanceOf(CUIScrollView);
  });
});
