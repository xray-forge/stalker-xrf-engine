import { describe, expect, it, jest } from "@jest/globals";
import {
  CUICheckButton,
  CUIComboBox,
  CUIEditBox,
  CUIMapInfo,
  CUIMapList,
  CUIScriptWnd,
  CUISpinNum,
  CUIStatic,
} from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { MultiplayerOptions } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerOptions";
import { MultiplayerServer } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerServer";
import { MockCScriptXmlInit } from "@/fixtures/xray";

describe("MultiplayerServer", () => {
  it("should correctly initialize", () => {
    const owner: MultiplayerMenu = new CUIScriptWnd() as MultiplayerMenu;

    owner.uiDialogMultiplayerOptions = {
      uiSpinWeather: {},
    } as unknown as MultiplayerOptions;

    const multiplayerServer: MultiplayerServer = new MultiplayerServer(owner, MockCScriptXmlInit.mock());

    expect(multiplayerServer.owner).toBe(owner);
    expect(multiplayerServer.uiServerNameEdit).toBeInstanceOf(CUIEditBox);
    expect(multiplayerServer.uiPasswordEdit).toBeInstanceOf(CUIEditBox);
    expect(multiplayerServer.uiModeComboBox).toBeInstanceOf(CUIComboBox);
    expect(multiplayerServer.uiMaxPlayersSpin).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiMapList).toBeInstanceOf(CUIMapList);
    expect(multiplayerServer.uiDedicatedCheck).toBeInstanceOf(CUICheckButton);

    expect(multiplayerServer.SetAutoDelete).toHaveBeenCalledWith(true);
    expect(multiplayerServer.uiMapList.SetWeatherSelector).toHaveBeenCalledWith(
      owner.uiDialogMultiplayerOptions.uiWeatherComboBox
    );
    expect(multiplayerServer.uiMapList.SetModeSelector).toHaveBeenCalledWith(multiplayerServer.uiModeComboBox);
    expect(multiplayerServer.uiMapList.SetMapPic).toHaveBeenCalledWith(expect.any(CUIStatic));
    expect(multiplayerServer.uiMapList.SetMapInfo).toHaveBeenCalledWith(expect.any(CUIMapInfo));
  });

  it("should correctly handle game mode change", () => {
    const owner: MultiplayerMenu = new CUIScriptWnd() as MultiplayerMenu;

    owner.uiDialogMultiplayerOptions = {
      uiSpinWeather: {},
      setGameMode: jest.fn(),
    } as unknown as MultiplayerOptions;

    const multiplayerServer: MultiplayerServer = new MultiplayerServer(owner, MockCScriptXmlInit.mock());

    multiplayerServer.onGameModeChange();

    expect(multiplayerServer.uiMapList.OnModeChange).toHaveBeenCalledTimes(1);
    expect(owner.uiDialogMultiplayerOptions.setGameMode).toHaveBeenCalledTimes(1);
  });
});
