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
    owner.checkSpectator = xml.InitCheck("tab_options:check_spectator", this);
    owner.checkAllowVoting = xml.InitCheck("tab_options:check_allow_voting", this);
    owner.spinMaxPing = xml.InitSpinNum("tab_options:spin_max_ping", this);

    owner.checkDamageBlock = xml.InitCheck("tab_options:check_damage_block", this);
    owner.checkAutoTeamBalance = xml.InitCheck("tab_options:check_auto_team_balance", this);
    owner.checkAutoTeamSwap = xml.InitCheck("tab_options:check_auto_team_swap", this);
    owner.checkFriendlyIndicators = xml.InitCheck("tab_options:check_friendly_indicators", this);
    owner.checkFriendlyNames = xml.InitCheck("tab_options:check_friendly_names", this);
    owner.checkNoAnmalies = xml.InitCheck("tab_options:check_no_anmalies", this);

    owner.checkSpecTeamonly = xml.InitCheck("tab_options:check_spec_teamonly", this);
    owner.checkSpecFreefly = xml.InitCheck("tab_options:check_spec_freefly", this);
    owner.checkSpecFirsteye = xml.InitCheck("tab_options:check_spec_firsteye", this);
    owner.checkSpecLookat = xml.InitCheck("tab_options:check_spec_lookat", this);
    owner.checkSpecFreelook = xml.InitCheck("tab_options:check_spec_freelook", this);

    owner.checkDemosave = xml.InitCheck("tab_options:check_demosave", this);
    owner.Register(owner.checkDemosave, "check_demosave");

    owner.tabRespawn = xml.InitTab("tab_options:radio_tab_respawn_options", this);
    // -- spin boxes
    owner.spinFriendlyFire = xml.InitSpinFlt("tab_options:spin_friendly_fire", this);
    owner.spinArtefactsNum = xml.InitSpinNum("tab_options:spin_artefacts_num", this);
    owner.spinSpectator = xml.InitSpinNum("tab_options:spin_spectator", this);
    owner.spinForceRespawn = xml.InitSpinNum("tab_options:spin_force_respawn", this);
    owner.spinReinforcement = xml.InitSpinNum("tab_options:spin_reinforcement", this);

    owner.spinDamageBlock = xml.InitSpinNum("tab_options:spin_damage_block", this);
    owner.spinArtreturnTime = xml.InitSpinNum("tab_options:spin_artreturn_time", this);
    owner.checkActivatedReturn = xml.InitCheck("tab_options:check_activated_return", this);
    owner.spinFragLimit = xml.InitSpinNum("tab_options:spin_frag_limit", this);
    owner.spinTimeLimit = xml.InitSpinNum("tab_options:spin_time_limit", this);
    owner.spinArtefactStay = xml.InitSpinNum("tab_options:spin_artefact_stay", this);
    owner.spinArtefactDelay = xml.InitSpinNum("tab_options:spin_artefact_delay", this);
    owner.spinAnomalyTime = xml.InitSpinNum("tab_options:spin_anomaly_time", this);
    owner.spinWarmUpTime = xml.InitSpinNum("tab_options:spin_warm_up_time", this);

    owner.checkDdaHunt = xml.InitCheck("tab_options:check_pda_hunt", this);
    owner.spinRateOfChange = xml.InitSpinFlt("tab_options:spin_rate_of_change", this);
    owner.spinWeather = xml.InitComboBox("tab_options:spin_weather", this);

    owner.checkSpectator.SetDependControl(owner.spinSpectator);

    // --    handler.check_public_server.SetDependControl(handler.check_verify_cdkey)

    if (this.isOnlineMode) {
      // --        handler.check_public_server.SetCheck(true)
    } else {
      // --        handler.check_public_server.SetCheck(false)
    }
  }

  public SetGameMode(mode: TXR_GAME_TYPE, handler: MultiplayerMenu): void {
    logger.info("Set game mode");

    handler.spinFriendlyFire.Enable(true);
    handler.checkAutoTeamBalance.Enable(true);
    handler.checkAutoTeamSwap.Enable(true);
    handler.spinArtefactsNum.Enable(true);
    handler.spinArtefactDelay.Enable(true);
    handler.spinArtefactStay.Enable(true);
    handler.checkFriendlyIndicators.Enable(true);
    handler.checkFriendlyNames.Enable(true);
    handler.spinReinforcement.Enable(true);
    handler.spinFragLimit.Enable(true);
    handler.checkSpecTeamonly.Enable(true);

    handler.spinArtreturnTime.Enable(true);
    handler.checkActivatedReturn.Enable(true);

    const btnReinforcement: CUITabButton = handler.tabRespawn.GetButtonById("reinforcement");
    const btnArtefactCapture: CUITabButton = handler.tabRespawn.GetButtonById("artefactcapture");

    btnReinforcement.Enable(true);
    btnArtefactCapture.Enable(true);

    if ((GAME_TYPE.GAME_UNKNOWN as number) !== 0) {
      if (GAME_TYPE.eGameIDDeathmatch === mode) {
        handler.spinFriendlyFire.Enable(false);
        handler.checkAutoTeamBalance.Enable(false);
        handler.checkAutoTeamSwap.Enable(false);
        handler.spinArtefactsNum.Enable(false);
        handler.spinArtefactDelay.Enable(false);
        handler.spinArtefactStay.Enable(false);
        handler.checkFriendlyIndicators.Enable(false);
        handler.checkFriendlyNames.Enable(false);
        handler.checkSpecTeamonly.Enable(false);
        handler.spinReinforcement.Enable(false);
        // -- tab
        handler.tabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
        handler.spinArtreturnTime.Enable(false);
        handler.checkActivatedReturn.Enable(false);
      } else if (GAME_TYPE.eGameIDTeamDeathmatch === mode) {
        handler.spinArtefactsNum.Enable(false);
        handler.spinArtefactDelay.Enable(false);
        handler.spinArtefactStay.Enable(false);
        // -- tab
        handler.tabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
        handler.spinArtreturnTime.Enable(false);
        handler.checkActivatedReturn.Enable(false);
      } else if (GAME_TYPE.eGameIDArtefactHunt === mode) {
        handler.spinFragLimit.Enable(false);
        handler.spinArtreturnTime.Enable(false);
        handler.checkActivatedReturn.Enable(false);
      } else if (GAME_TYPE.eGameIDCaptureTheArtefact === mode) {
        handler.spinArtefactDelay.Enable(false);
        handler.spinArtefactStay.Enable(false);
        handler.spinFragLimit.Enable(false);
      }
    } else if ((GAME_TYPE.GAME_UNKNOWN as number) === 0) {
      handler.spinArtreturnTime.Enable(false);
      handler.checkActivatedReturn.Enable(false);

      if (GAME_TYPE.GAME_DEATHMATCH === mode) {
        handler.spinFriendlyFire.Enable(false);
        handler.checkAutoTeamBalance.Enable(false);
        handler.checkAutoTeamSwap.Enable(false);
        handler.spinArtefactsNum.Enable(false);
        handler.spinArtefactDelay.Enable(false);
        handler.spinArtefactStay.Enable(false);
        handler.checkFriendlyIndicators.Enable(false);
        handler.checkFriendlyNames.Enable(false);
        handler.checkSpecTeamonly.Enable(false);
        handler.spinReinforcement.Enable(false);
        // -- tab
        handler.tabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
      } else if (GAME_TYPE.GAME_TEAMDEATHMATCH === mode) {
        handler.spinArtefactsNum.Enable(false);
        handler.spinArtefactDelay.Enable(false);
        handler.spinArtefactStay.Enable(false);
        // -- tab
        handler.tabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
      } else if (GAME_TYPE.GAME_ARTEFACTHUNT === mode) {
        handler.spinFragLimit.Enable(false);
      }
    }
  }
}
