import { describe, expect, it } from "@jest/globals";
import { CScriptXmlInit, CServerList, CUI3tButton, CUICheckButton, CUIScriptWnd } from "xray16";

import { MultiplayerJoin } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerJoin";
import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { MockCScriptXmlInit } from "@/fixtures/xray";

describe("MultiplayerJoin", () => {
  it("should correctly initialize", () => {
    const owner: MultiplayerMenu = new CUIScriptWnd() as MultiplayerMenu;
    const xml: CScriptXmlInit = MockCScriptXmlInit.mock();
    const multiplayerJoin: MultiplayerJoin = new MultiplayerJoin(owner, xml, true);

    expect(multiplayerJoin.owner).toBe(owner);
    expect(multiplayerJoin.xml).toBe(xml);
    expect(multiplayerJoin.isOnlineMode).toBe(true);

    expect(multiplayerJoin.uiServerList).toBeInstanceOf(CServerList);
    expect(multiplayerJoin.uiJoinDirectIPButton).toBeInstanceOf(CUI3tButton);
    expect(multiplayerJoin.uiFilterEmptyCheckButton).toBeInstanceOf(CUICheckButton);
    expect(multiplayerJoin.uiFilterFullCheckButton).toBeInstanceOf(CUICheckButton);
    expect(multiplayerJoin.uiFilterWithPasswordCheckButton).toBeInstanceOf(CUICheckButton);
    expect(multiplayerJoin.uiFilterWithoutPasswordCheckButton).toBeInstanceOf(CUICheckButton);
    expect(multiplayerJoin.uiFilterFFCheckButton).toBeInstanceOf(CUICheckButton);
    expect(multiplayerJoin.uiFilterListenServersCheckButton).toBeInstanceOf(CUICheckButton);
  });
});
