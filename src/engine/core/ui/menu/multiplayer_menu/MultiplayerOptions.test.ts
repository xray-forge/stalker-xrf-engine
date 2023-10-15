import { describe, expect, it } from "@jest/globals";
import {
  CScriptXmlInit,
  CUICheckButton,
  CUIComboBox,
  CUIScriptWnd,
  CUISpinFlt,
  CUISpinNum,
  CUITabControl,
  GAME_TYPE,
  get_console,
} from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { MultiplayerOptions } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerOptions";
import { MockCScriptXmlInit, MockGameType } from "@/fixtures/xray";

describe("MultiplayerOptions", () => {
  it("should correctly initialize", () => {
    const owner: MultiplayerMenu = new CUIScriptWnd() as MultiplayerMenu;
    const xml: CScriptXmlInit = MockCScriptXmlInit.mock();
    const multiplayerServer: MultiplayerOptions = new MultiplayerOptions(owner, xml, true);

    expect(multiplayerServer.owner).toBe(owner);
    expect(multiplayerServer.xml).toBe(xml);
    expect(multiplayerServer.isOnlineMode).toBe(true);

    expect(multiplayerServer.uiCheckSpectator).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckAllowVoting).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiSpinMaxPing).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiCheckDamageBlock).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckAutoTeamBalance).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckAutoTeamSwap).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckFriendlyIndicators).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckFriendlyNames).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckNoAnmalies).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckSpecTeamonly).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckSpecFreefly).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckSpecFirsteye).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckSpecLookat).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckSpecFreelook).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiCheckDemosave).toBeInstanceOf(CUICheckButton);

    expect(multiplayerServer.uiTabRespawn).toBeInstanceOf(CUITabControl);
    expect(multiplayerServer.uiSpinFriendlyFire).toBeInstanceOf(CUISpinFlt);
    expect(multiplayerServer.uiSpinArtefactsNum).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiSpinArtefactDelay).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiSpinSpectator).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiSpinForceRespawn).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiSpinReinforcement).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiSpinDamageBlock).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiSpinArtreturnTime).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiSpinFragLimit).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiSpinArtefactStay).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiSpinAnomalyTime).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiSpinTimeLimit).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiCheckActivatedReturn).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiSpinWarmUpTime).toBeInstanceOf(CUISpinNum);
    expect(multiplayerServer.uiCheckDdaHunt).toBeInstanceOf(CUICheckButton);
    expect(multiplayerServer.uiSpinRateOfChange).toBeInstanceOf(CUISpinFlt);
    expect(multiplayerServer.uiWeatherComboBox).toBeInstanceOf(CUIComboBox);
  });

  it("should correctly change game mode to eGameIDDeathmatch", () => {
    const multiplayerOptions: MultiplayerOptions = new MultiplayerOptions(
      new CUIScriptWnd() as MultiplayerMenu,
      MockCScriptXmlInit.mock(),
      true
    );

    MockGameType.GAME_UNKNOWN = -1;

    multiplayerOptions.setGameMode(GAME_TYPE.eGameIDDeathmatch);

    expect(multiplayerOptions.uiSpinFriendlyFire.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckAutoTeamBalance.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckAutoTeamSwap.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtefactsNum.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtefactDelay.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtefactStay.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckFriendlyIndicators.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckFriendlyNames.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckSpecTeamonly.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinReinforcement.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiTabRespawn.SetActiveTab).toHaveBeenLastCalledWith("forcerespawn");
    expect(multiplayerOptions.uiSpinArtreturnTime.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckActivatedReturn.Enable).toHaveBeenLastCalledWith(false);
  });

  it("should correctly change game mode to eGameIDTeamDeathmatch", () => {
    const multiplayerOptions: MultiplayerOptions = new MultiplayerOptions(
      new CUIScriptWnd() as MultiplayerMenu,
      MockCScriptXmlInit.mock(),
      true
    );

    MockGameType.GAME_UNKNOWN = -1;

    multiplayerOptions.setGameMode(GAME_TYPE.eGameIDTeamDeathmatch);

    expect(multiplayerOptions.uiSpinArtefactsNum.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtefactDelay.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtefactStay.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiTabRespawn.SetActiveTab).toHaveBeenLastCalledWith("forcerespawn");
    expect(multiplayerOptions.uiSpinArtreturnTime.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckActivatedReturn.Enable).toHaveBeenLastCalledWith(false);
  });

  it("should correctly change game mode to eGameIDArtefactHunt", () => {
    const multiplayerOptions: MultiplayerOptions = new MultiplayerOptions(
      new CUIScriptWnd() as MultiplayerMenu,
      MockCScriptXmlInit.mock(),
      true
    );

    MockGameType.GAME_UNKNOWN = -1;

    multiplayerOptions.setGameMode(GAME_TYPE.eGameIDArtefactHunt);

    expect(multiplayerOptions.uiSpinFragLimit.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtreturnTime.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckActivatedReturn.Enable).toHaveBeenLastCalledWith(false);
  });

  it("should correctly change game mode to eGameIDCaptureTheArtefact", () => {
    const multiplayerOptions: MultiplayerOptions = new MultiplayerOptions(
      new CUIScriptWnd() as MultiplayerMenu,
      MockCScriptXmlInit.mock(),
      true
    );

    MockGameType.GAME_UNKNOWN = -1;

    multiplayerOptions.setGameMode(GAME_TYPE.eGameIDCaptureTheArtefact);

    expect(multiplayerOptions.uiSpinArtefactDelay.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtefactStay.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinFragLimit.Enable).toHaveBeenLastCalledWith(false);
  });

  it("should correctly change game mode to GAME_DEATHMATCH", () => {
    const multiplayerOptions: MultiplayerOptions = new MultiplayerOptions(
      new CUIScriptWnd() as MultiplayerMenu,
      MockCScriptXmlInit.mock(),
      true
    );

    MockGameType.GAME_UNKNOWN = 0;

    multiplayerOptions.setGameMode(GAME_TYPE.GAME_DEATHMATCH);

    expect(multiplayerOptions.uiSpinFriendlyFire.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckAutoTeamBalance.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckAutoTeamSwap.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtefactsNum.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtefactDelay.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtefactStay.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckFriendlyIndicators.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckFriendlyNames.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiCheckSpecTeamonly.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinReinforcement.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiTabRespawn.SetActiveTab).toHaveBeenLastCalledWith("forcerespawn");
  });

  it("should correctly change game mode to GAME_TEAMDEATHMATCH", () => {
    const multiplayerOptions: MultiplayerOptions = new MultiplayerOptions(
      new CUIScriptWnd() as MultiplayerMenu,
      MockCScriptXmlInit.mock(),
      true
    );

    MockGameType.GAME_UNKNOWN = 0;

    multiplayerOptions.setGameMode(GAME_TYPE.GAME_TEAMDEATHMATCH);

    expect(multiplayerOptions.uiSpinArtefactsNum.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtefactDelay.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiSpinArtefactStay.Enable).toHaveBeenLastCalledWith(false);
    expect(multiplayerOptions.uiTabRespawn.SetActiveTab).toHaveBeenLastCalledWith("forcerespawn");
  });

  it("should correctly change game mode to GAME_ARTEFACTHUNT", () => {
    const multiplayerOptions: MultiplayerOptions = new MultiplayerOptions(
      new CUIScriptWnd() as MultiplayerMenu,
      MockCScriptXmlInit.mock(),
      true
    );

    MockGameType.GAME_UNKNOWN = 0;

    multiplayerOptions.setGameMode(GAME_TYPE.GAME_ARTEFACTHUNT);

    expect(multiplayerOptions.uiSpinFragLimit.Enable).toHaveBeenLastCalledWith(false);
  });

  it("should correctly handle demo save", () => {
    const multiplayerOptions: MultiplayerOptions = new MultiplayerOptions(
      new CUIScriptWnd() as MultiplayerMenu,
      MockCScriptXmlInit.mock(),
      true
    );

    multiplayerOptions.uiCheckDemosave.SetCheck(false);
    multiplayerOptions.onDemoSaveChange();

    expect(get_console().execute).toHaveBeenCalledWith("cl_mpdemosave 0");

    multiplayerOptions.uiCheckDemosave.SetCheck(true);
    multiplayerOptions.onDemoSaveChange();

    expect(get_console().execute).toHaveBeenCalledWith("cl_mpdemosave 1");
  });
});
