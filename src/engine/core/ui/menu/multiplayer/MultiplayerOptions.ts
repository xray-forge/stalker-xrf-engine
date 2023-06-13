import { CScriptXmlInit, CUITabButton, CUIWindow, GAME_TYPE, LuabindClass, TXR_GAME_TYPE } from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerOptions extends CUIWindow {
  public isOnlineMode: boolean;

  public constructor(isOnlineMode: boolean) {
    super();
    this.isOnlineMode = isOnlineMode;
  }

  public InitControls(x: number, y: number, xml: CScriptXmlInit, owner: MultiplayerMenu): void {
    this.SetAutoDelete(true);
    xml.InitWindow("tab_options:main", 0, this);

    // --    this.bk = xml.InitFrame("frame", this)
    xml.InitFrame("tab_options:frame_1", this);
    xml.InitFrame("tab_options:frame_2", this);
    xml.InitFrame("tab_options:frame_3", this);

    // --    xml.InitFrameLine("tab_options:vert_separator",        this)
    // --    xml.InitFrameLine("tab_options:vert_separator_2",    this)
    xml.InitFrameLine("tab_options:cap_network_connection", this);
    xml.InitFrameLine("tab_options:cap_respawn_options", this);
    xml.InitFrameLine("tab_options:cap_server_list", this);
    xml.InitFrameLine("tab_options:cap_weather_options", this);
    xml.InitFrameLine("tab_options:cap_spectator_options", this);
    xml.InitFrameLine("tab_options:cap_demosave_options", this);
    xml.InitStatic("tab_options:cap_damage_block", this);
    xml.InitStatic("tab_options:cap_artreturn_time", this);

    xml.InitStatic("tab_options:cap_friendly_fire", this);
    xml.InitStatic("tab_options:cap_frag_limit", this);
    xml.InitStatic("tab_options:cap_time_limit", this);
    xml.InitStatic("tab_options:cap_artefact_stay", this);
    xml.InitStatic("tab_options:cap_artefact_num", this);
    xml.InitStatic("tab_options:cap_anomaly_time", this);
    xml.InitStatic("tab_options:cap_warm_up_time", this);
    xml.InitStatic("tab_options:cap_artefact_delay", this);
    xml.InitStatic("tab_options:cap_starting_weather", this);
    xml.InitStatic("tab_options:cap_rate_of_change", this);
    xml.InitStatic("tab_options:cap_max_ping", this);

    if (this.isOnlineMode) {
      xml.InitStatic("tab_options:public_server_t", this);
    } else {
      xml.InitStatic("tab_options:public_server_d", this);
    }

    // --    handler.check_public_server            = xml.InitCheck("tab_options:check_public_server",            this)
    owner.uiCheckSpectator = xml.InitCheck("tab_options:check_spectator", this);
    owner.uiCheckAllowVoting = xml.InitCheck("tab_options:check_allow_voting", this);
    owner.uiSpinMaxPing = xml.InitSpinNum("tab_options:spin_max_ping", this);

    owner.uiCheckDamageBlock = xml.InitCheck("tab_options:check_damage_block", this);
    owner.uiCheckAutoTeamBalance = xml.InitCheck("tab_options:check_auto_team_balance", this);
    owner.uiCheckAutoTeamSwap = xml.InitCheck("tab_options:check_auto_team_swap", this);
    owner.uiCheckFriendlyIndicators = xml.InitCheck("tab_options:check_friendly_indicators", this);
    owner.uiCheckFriendlyNames = xml.InitCheck("tab_options:check_friendly_names", this);
    owner.uiCheckNoAnmalies = xml.InitCheck("tab_options:check_no_anmalies", this);

    owner.uiCheckSpecTeamonly = xml.InitCheck("tab_options:check_spec_teamonly", this);
    owner.uiCheckSpecFreefly = xml.InitCheck("tab_options:check_spec_freefly", this);
    owner.uiCheckSpecFirsteye = xml.InitCheck("tab_options:check_spec_firsteye", this);
    owner.uiCheckSpecLookat = xml.InitCheck("tab_options:check_spec_lookat", this);
    owner.uiCheckSpecFreelook = xml.InitCheck("tab_options:check_spec_freelook", this);

    owner.uiCheckDemosave = xml.InitCheck("tab_options:check_demosave", this);
    owner.Register(owner.uiCheckDemosave, "check_demosave");

    owner.uiTabRespawn = xml.InitTab("tab_options:radio_tab_respawn_options", this);
    // -- spin boxes
    owner.uiSpinFriendlyFire = xml.InitSpinFlt("tab_options:spin_friendly_fire", this);
    owner.uiSpinArtefactsNum = xml.InitSpinNum("tab_options:spin_artefacts_num", this);
    owner.uiSpinSpectator = xml.InitSpinNum("tab_options:spin_spectator", this);
    owner.uiSpinForceRespawn = xml.InitSpinNum("tab_options:spin_force_respawn", this);
    owner.uiSpinReinforcement = xml.InitSpinNum("tab_options:spin_reinforcement", this);

    owner.uiSpinDamageBlock = xml.InitSpinNum("tab_options:spin_damage_block", this);
    owner.uiSpinArtreturnTime = xml.InitSpinNum("tab_options:spin_artreturn_time", this);
    owner.uiCheckActivatedReturn = xml.InitCheck("tab_options:check_activated_return", this);
    owner.uiSpinFragLimit = xml.InitSpinNum("tab_options:spin_frag_limit", this);
    owner.uiSpinTimeLimit = xml.InitSpinNum("tab_options:spin_time_limit", this);
    owner.uiSpinArtefactStay = xml.InitSpinNum("tab_options:spin_artefact_stay", this);
    owner.uiSpinArtefactDelay = xml.InitSpinNum("tab_options:spin_artefact_delay", this);
    owner.uiSpinAnomalyTime = xml.InitSpinNum("tab_options:spin_anomaly_time", this);
    owner.uiSpinWarmUpTime = xml.InitSpinNum("tab_options:spin_warm_up_time", this);

    owner.uiCheckDdaHunt = xml.InitCheck("tab_options:check_pda_hunt", this);
    owner.uiSpinRateOfChange = xml.InitSpinFlt("tab_options:spin_rate_of_change", this);
    owner.uiSpinWeather = xml.InitComboBox("tab_options:spin_weather", this);

    owner.uiCheckSpectator.SetDependControl(owner.uiSpinSpectator);

    // --    handler.check_public_server.SetDependControl(handler.check_verify_cdkey)

    if (this.isOnlineMode) {
      // --        handler.check_public_server.SetCheck(true)
    } else {
      // --        handler.check_public_server.SetCheck(false)
    }
  }

  public SetGameMode(mode: TXR_GAME_TYPE, handler: MultiplayerMenu): void {
    logger.info("Set game mode");

    handler.uiSpinFriendlyFire.Enable(true);
    handler.uiCheckAutoTeamBalance.Enable(true);
    handler.uiCheckAutoTeamSwap.Enable(true);
    handler.uiSpinArtefactsNum.Enable(true);
    handler.uiSpinArtefactDelay.Enable(true);
    handler.uiSpinArtefactStay.Enable(true);
    handler.uiCheckFriendlyIndicators.Enable(true);
    handler.uiCheckFriendlyNames.Enable(true);
    handler.uiSpinReinforcement.Enable(true);
    handler.uiSpinFragLimit.Enable(true);
    handler.uiCheckSpecTeamonly.Enable(true);

    handler.uiSpinArtreturnTime.Enable(true);
    handler.uiCheckActivatedReturn.Enable(true);

    const btnReinforcement: CUITabButton = handler.uiTabRespawn.GetButtonById("reinforcement");
    const btnArtefactCapture: CUITabButton = handler.uiTabRespawn.GetButtonById("artefactcapture");

    btnReinforcement.Enable(true);
    btnArtefactCapture.Enable(true);

    if ((GAME_TYPE.GAME_UNKNOWN as number) !== 0) {
      if (GAME_TYPE.eGameIDDeathmatch === mode) {
        handler.uiSpinFriendlyFire.Enable(false);
        handler.uiCheckAutoTeamBalance.Enable(false);
        handler.uiCheckAutoTeamSwap.Enable(false);
        handler.uiSpinArtefactsNum.Enable(false);
        handler.uiSpinArtefactDelay.Enable(false);
        handler.uiSpinArtefactStay.Enable(false);
        handler.uiCheckFriendlyIndicators.Enable(false);
        handler.uiCheckFriendlyNames.Enable(false);
        handler.uiCheckSpecTeamonly.Enable(false);
        handler.uiSpinReinforcement.Enable(false);
        // -- tab
        handler.uiTabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
        handler.uiSpinArtreturnTime.Enable(false);
        handler.uiCheckActivatedReturn.Enable(false);
      } else if (GAME_TYPE.eGameIDTeamDeathmatch === mode) {
        handler.uiSpinArtefactsNum.Enable(false);
        handler.uiSpinArtefactDelay.Enable(false);
        handler.uiSpinArtefactStay.Enable(false);
        // -- tab
        handler.uiTabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
        handler.uiSpinArtreturnTime.Enable(false);
        handler.uiCheckActivatedReturn.Enable(false);
      } else if (GAME_TYPE.eGameIDArtefactHunt === mode) {
        handler.uiSpinFragLimit.Enable(false);
        handler.uiSpinArtreturnTime.Enable(false);
        handler.uiCheckActivatedReturn.Enable(false);
      } else if (GAME_TYPE.eGameIDCaptureTheArtefact === mode) {
        handler.uiSpinArtefactDelay.Enable(false);
        handler.uiSpinArtefactStay.Enable(false);
        handler.uiSpinFragLimit.Enable(false);
      }
    } else if ((GAME_TYPE.GAME_UNKNOWN as number) === 0) {
      handler.uiSpinArtreturnTime.Enable(false);
      handler.uiCheckActivatedReturn.Enable(false);

      if (GAME_TYPE.GAME_DEATHMATCH === mode) {
        handler.uiSpinFriendlyFire.Enable(false);
        handler.uiCheckAutoTeamBalance.Enable(false);
        handler.uiCheckAutoTeamSwap.Enable(false);
        handler.uiSpinArtefactsNum.Enable(false);
        handler.uiSpinArtefactDelay.Enable(false);
        handler.uiSpinArtefactStay.Enable(false);
        handler.uiCheckFriendlyIndicators.Enable(false);
        handler.uiCheckFriendlyNames.Enable(false);
        handler.uiCheckSpecTeamonly.Enable(false);
        handler.uiSpinReinforcement.Enable(false);
        // -- tab
        handler.uiTabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
      } else if (GAME_TYPE.GAME_TEAMDEATHMATCH === mode) {
        handler.uiSpinArtefactsNum.Enable(false);
        handler.uiSpinArtefactDelay.Enable(false);
        handler.uiSpinArtefactStay.Enable(false);
        // -- tab
        handler.uiTabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
      } else if (GAME_TYPE.GAME_ARTEFACTHUNT === mode) {
        handler.uiSpinFragLimit.Enable(false);
      }
    }
  }
}
