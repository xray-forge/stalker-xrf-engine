import { describe, expect, it } from "@jest/globals";
import {
  CScriptXmlInit,
  CUICheckButton,
  CUIComboBox,
  CUIScriptWnd,
  CUISpinFlt,
  CUISpinNum,
  CUISpinText,
  CUITabControl,
} from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { MultiplayerOptions } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerOptions";
import { MockCScriptXmlInit } from "@/fixtures/xray";

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
});
