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

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { MultiplayerOptions } from "@/engine/core/ui/menu/multiplayer/MultiplayerOptions";
import { MultiplayerServer } from "@/engine/core/ui/menu/multiplayer/MultiplayerServer";
import { MockCScriptXmlInit } from "@/fixtures/xray";

describe("MultiplayerServer", () => {
  it("should correctly initialize", () => {
    const owner: MultiplayerMenu = new CUIScriptWnd() as MultiplayerMenu;
    const multiplayerServer: MultiplayerServer = new MultiplayerServer(owner);

    jest.spyOn(multiplayerServer, "SetAutoDelete").mockImplementation(jest.fn());

    owner.dialogMultiplayerOptions = {
      uiSpinWeather: {},
    } as unknown as MultiplayerOptions;

    multiplayerServer.initialize(0, 0, MockCScriptXmlInit.mock(), owner);

    expect(multiplayerServer.owner).toBe(owner);
    expect(multiplayerServer.uiServerNameEdit).toBeInstanceOf(CUIEditBox);
    expect(multiplayerServer.uiPasswordEdit).toBeInstanceOf(CUIEditBox);
    expect(multiplayerServer.uiModeComboBox).toBeInstanceOf(CUIComboBox);
    expect(multiplayerServer.uiMaxPlayersSpin).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiMapList).toBeInstanceOf(CUIMapList);
    expect(multiplayerServer.uiDedicatedCheck).toBeInstanceOf(CUICheckButton);

    expect(multiplayerServer.SetAutoDelete).toHaveBeenCalledWith(true);
    expect(multiplayerServer.uiMapList.SetWeatherSelector).toHaveBeenCalledWith(
      owner.dialogMultiplayerOptions.uiWeatherComboBox
    );
    expect(multiplayerServer.uiMapList.SetModeSelector).toHaveBeenCalledWith(multiplayerServer.uiModeComboBox);
    expect(multiplayerServer.uiMapList.SetMapPic).toHaveBeenCalledWith(expect.any(CUIStatic));
    expect(multiplayerServer.uiMapList.SetMapInfo).toHaveBeenCalledWith(expect.any(CUIMapInfo));
  });

  it("should correctly handle game mode change", () => {
    const owner: MultiplayerMenu = new CUIScriptWnd() as MultiplayerMenu;
    const multiplayerServer: MultiplayerServer = new MultiplayerServer(owner);

    jest.spyOn(multiplayerServer, "SetAutoDelete").mockImplementation(jest.fn());

    owner.dialogMultiplayerOptions = {
      uiSpinWeather: {},
      setGameMode: jest.fn(),
    } as unknown as MultiplayerOptions;

    multiplayerServer.initialize(0, 0, MockCScriptXmlInit.mock(), owner);
    multiplayerServer.onGameModeChange();

    expect(multiplayerServer.uiMapList.OnModeChange).toHaveBeenCalledTimes(1);
    expect(owner.dialogMultiplayerOptions.setGameMode).toHaveBeenCalledTimes(1);
  });
});
