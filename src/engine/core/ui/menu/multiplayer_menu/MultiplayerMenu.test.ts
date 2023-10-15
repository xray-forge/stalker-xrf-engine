import { describe, expect, it } from "@jest/globals";
import { CUI3tButton, CUIEditBox, CUIMessageBoxEx, CUIScriptWnd } from "xray16";

import { MainMenu } from "@/engine/core/ui/menu";
import { MultiplayerDemo } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemo";
import { MultiplayerJoin } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerJoin";
import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { MultiplayerOptions } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerOptions";
import { MultiplayerProfile } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerProfile";
import { MultiplayerServer } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerServer";

describe("MultiplayerMenu", () => {
  it("should correctly initialize for online mode", () => {
    const owner: MainMenu = new CUIScriptWnd() as MainMenu;
    const multiplayerMenu: MultiplayerMenu = new MultiplayerMenu(owner, true);

    expect(multiplayerMenu.owner).toBe(owner);
    expect(multiplayerMenu.xml).toBeDefined();
    expect(multiplayerMenu.isOnlineMode).toBe(true);

    expect(multiplayerMenu.uiDialogMultiplayerJoin).toBeInstanceOf(MultiplayerJoin);
    expect(multiplayerMenu.uiDialogMultiplayerServer).toBeInstanceOf(MultiplayerServer);
    expect(multiplayerMenu.uiDialogMultiplayerDemo).toBeInstanceOf(MultiplayerDemo);
    expect(multiplayerMenu.uiDialogMultiplayerProfile).toBeInstanceOf(MultiplayerProfile);
    expect(multiplayerMenu.uiDialogMultiplayerOptions).toBeInstanceOf(MultiplayerOptions);

    expect(multiplayerMenu.uiMessageBox).toBeInstanceOf(CUIMessageBoxEx);
    expect(multiplayerMenu.uiCdkey).toBeInstanceOf(CUIEditBox);
    expect(multiplayerMenu.uiPlayerNameEditBox).toBeUndefined();
    expect(multiplayerMenu.uiCreateButton).toBeInstanceOf(CUI3tButton);
    expect(multiplayerMenu.uiPlayDemoButton).toBeInstanceOf(CUI3tButton);
    expect(multiplayerMenu.uiJoinButton).toBeInstanceOf(CUI3tButton);

    expect(multiplayerMenu.SetWndRect).toHaveBeenCalled();
    expect(multiplayerMenu.Enable).toHaveBeenCalledWith(true);
  });

  it("should correctly initialize for offline mode", () => {
    const owner: MainMenu = new CUIScriptWnd() as MainMenu;
    const multiplayerMenu: MultiplayerMenu = new MultiplayerMenu(owner, false);

    expect(multiplayerMenu.owner).toBe(owner);
    expect(multiplayerMenu.xml).toBeDefined();
    expect(multiplayerMenu.isOnlineMode).toBe(false);

    expect(multiplayerMenu.uiDialogMultiplayerJoin).toBeInstanceOf(MultiplayerJoin);
    expect(multiplayerMenu.uiDialogMultiplayerServer).toBeInstanceOf(MultiplayerServer);
    expect(multiplayerMenu.uiDialogMultiplayerDemo).toBeInstanceOf(MultiplayerDemo);
    expect(multiplayerMenu.uiDialogMultiplayerProfile).toBeUndefined();
    expect(multiplayerMenu.uiDialogMultiplayerOptions).toBeInstanceOf(MultiplayerOptions);

    expect(multiplayerMenu.uiMessageBox).toBeInstanceOf(CUIMessageBoxEx);
    expect(multiplayerMenu.uiCdkey).toBeUndefined();
    expect(multiplayerMenu.uiPlayerNameEditBox).toBeInstanceOf(CUIEditBox);
    expect(multiplayerMenu.uiCreateButton).toBeInstanceOf(CUI3tButton);
    expect(multiplayerMenu.uiPlayDemoButton).toBeInstanceOf(CUI3tButton);
    expect(multiplayerMenu.uiJoinButton).toBeInstanceOf(CUI3tButton);

    expect(multiplayerMenu.SetWndRect).toHaveBeenCalled();
    expect(multiplayerMenu.Enable).toHaveBeenCalledWith(true);
  });

  it("should correctly generate server creation params with default values", () => {
    const owner: MainMenu = new CUIScriptWnd() as MainMenu;
    const multiplayerMenu: MultiplayerMenu = new MultiplayerMenu(owner, false);

    expect(multiplayerMenu.getServerCreationParameters()).toBe(
      "/maxplayers=test-cs/maxping=test-cs/spectrmds=0/dmgblock=test-cs/fraglimit=test-cs" +
        "/timelimit=test-cs/ffire=test-cs/ans=1/anslen=test-cs/warmup=test-cs/etimef=test-cs"
    );
  });
});
