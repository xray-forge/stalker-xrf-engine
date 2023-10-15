import {
  CScriptXmlInit,
  CUICheckButton,
  CUIComboBox,
  CUISpinFlt,
  CUISpinNum,
  CUISpinText,
  CUITabButton,
  CUITabControl,
  CUIWindow,
  GAME_TYPE,
  LuabindClass,
  TXR_GAME_TYPE,
  ui_events,
} from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, initializeElement } from "@/engine/core/utils/ui";
import { consoleCommands } from "@/engine/lib/constants/console_commands";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Options tab for multiplayer menu.
 */
@LuabindClass()
export class MultiplayerOptions extends CUIWindow {
  public owner: MultiplayerMenu;
  public isOnlineMode: boolean;

  public uiCheckSpectator!: CUICheckButton;
  public uiCheckAllowVoting!: CUICheckButton;
  public uiSpinMaxPing!: CUISpinText;
  public uiCheckDamageBlock!: CUICheckButton;
  public uiCheckAutoTeamBalance!: CUICheckButton;
  public uiCheckAutoTeamSwap!: CUICheckButton;
  public uiCheckFriendlyIndicators!: CUICheckButton;
  public uiCheckFriendlyNames!: CUICheckButton;
  public uiCheckNoAnmalies!: CUICheckButton;
  public uiCheckSpecTeamonly!: CUICheckButton;
  public uiCheckSpecFreefly!: CUICheckButton;
  public uiCheckSpecFirsteye!: CUICheckButton;
  public uiCheckSpecLookat!: CUICheckButton;
  public uiCheckSpecFreelook!: CUICheckButton;
  public uiCheckDemosave!: CUICheckButton;
  public uiTabRespawn!: CUITabControl;
  public uiSpinFriendlyFire!: CUISpinFlt;
  public uiSpinArtefactsNum!: CUISpinNum;
  public uiSpinArtefactDelay!: CUISpinNum;
  public uiSpinSpectator!: CUISpinNum;
  public uiSpinForceRespawn!: CUISpinNum;
  public uiSpinReinforcement!: CUISpinNum;
  public uiSpinDamageBlock!: CUISpinNum;
  public uiSpinArtreturnTime!: CUISpinNum;
  public uiSpinFragLimit!: CUISpinNum;
  public uiSpinArtefactStay!: CUISpinNum;
  public uiSpinAnomalyTime!: CUISpinNum;
  public uiSpinTimeLimit!: CUISpinNum;
  public uiCheckActivatedReturn!: CUICheckButton;
  public uiSpinWarmUpTime!: CUISpinNum;
  public uiCheckDdaHunt!: CUICheckButton;
  public uiSpinRateOfChange!: CUISpinFlt;
  public uiWeatherComboBox!: CUIComboBox;

  public constructor(owner: MultiplayerMenu, xml: CScriptXmlInit, isOnlineMode: boolean) {
    super();
    this.owner = owner;
    this.isOnlineMode = isOnlineMode;

    this.initialize(owner, xml);
  }

  public initialize(owner: MultiplayerMenu, xml: CScriptXmlInit): void {
    this.SetAutoDelete(true);

    xml.InitWindow("tab_options:main", 0, this);

    xml.InitFrame("tab_options:frame_1", this);
    xml.InitFrame("tab_options:frame_2", this);
    xml.InitFrame("tab_options:frame_3", this);

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

    this.uiCheckSpectator = xml.InitCheck("tab_options:check_spectator", this);
    this.uiCheckAllowVoting = xml.InitCheck("tab_options:check_allow_voting", this);
    this.uiSpinMaxPing = xml.InitSpinNum("tab_options:spin_max_ping", this);

    this.uiCheckDamageBlock = xml.InitCheck("tab_options:check_damage_block", this);
    this.uiCheckAutoTeamBalance = xml.InitCheck("tab_options:check_auto_team_balance", this);
    this.uiCheckAutoTeamSwap = xml.InitCheck("tab_options:check_auto_team_swap", this);
    this.uiCheckFriendlyIndicators = xml.InitCheck("tab_options:check_friendly_indicators", this);
    this.uiCheckFriendlyNames = xml.InitCheck("tab_options:check_friendly_names", this);
    this.uiCheckNoAnmalies = xml.InitCheck("tab_options:check_no_anmalies", this);

    this.uiCheckSpecTeamonly = xml.InitCheck("tab_options:check_spec_teamonly", this);
    this.uiCheckSpecFreefly = xml.InitCheck("tab_options:check_spec_freefly", this);
    this.uiCheckSpecFirsteye = xml.InitCheck("tab_options:check_spec_firsteye", this);
    this.uiCheckSpecLookat = xml.InitCheck("tab_options:check_spec_lookat", this);
    this.uiCheckSpecFreelook = xml.InitCheck("tab_options:check_spec_freelook", this);

    this.uiCheckDemosave = initializeElement(xml, "tab_options:check_demosave", EElementType.CHECK_BUTTON, this, {
      context: owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onDemoSaveChange(),
      },
    });

    this.uiTabRespawn = xml.InitTab("tab_options:radio_tab_respawn_options", this);
    this.uiSpinFriendlyFire = xml.InitSpinFlt("tab_options:spin_friendly_fire", this);
    this.uiSpinArtefactsNum = xml.InitSpinNum("tab_options:spin_artefacts_num", this);
    this.uiSpinSpectator = xml.InitSpinNum("tab_options:spin_spectator", this);
    this.uiSpinForceRespawn = xml.InitSpinNum("tab_options:spin_force_respawn", this);
    this.uiSpinReinforcement = xml.InitSpinNum("tab_options:spin_reinforcement", this);

    this.uiSpinDamageBlock = xml.InitSpinNum("tab_options:spin_damage_block", this);
    this.uiSpinArtreturnTime = xml.InitSpinNum("tab_options:spin_artreturn_time", this);
    this.uiCheckActivatedReturn = xml.InitCheck("tab_options:check_activated_return", this);
    this.uiSpinFragLimit = xml.InitSpinNum("tab_options:spin_frag_limit", this);
    this.uiSpinTimeLimit = xml.InitSpinNum("tab_options:spin_time_limit", this);
    this.uiSpinArtefactStay = xml.InitSpinNum("tab_options:spin_artefact_stay", this);
    this.uiSpinArtefactDelay = xml.InitSpinNum("tab_options:spin_artefact_delay", this);
    this.uiSpinAnomalyTime = xml.InitSpinNum("tab_options:spin_anomaly_time", this);
    this.uiSpinWarmUpTime = xml.InitSpinNum("tab_options:spin_warm_up_time", this);

    this.uiCheckDdaHunt = xml.InitCheck("tab_options:check_pda_hunt", this);
    this.uiSpinRateOfChange = xml.InitSpinFlt("tab_options:spin_rate_of_change", this);
    this.uiWeatherComboBox = xml.InitComboBox("tab_options:spin_weather", this);

    this.uiCheckSpectator.SetDependControl(this.uiSpinSpectator);
  }

  public setGameMode(mode: TXR_GAME_TYPE): void {
    logger.info("Set game mode");

    this.uiSpinFriendlyFire.Enable(true);
    this.uiCheckAutoTeamBalance.Enable(true);
    this.uiCheckAutoTeamSwap.Enable(true);
    this.uiSpinArtefactsNum.Enable(true);
    this.uiSpinArtefactDelay.Enable(true);
    this.uiSpinArtefactStay.Enable(true);
    this.uiCheckFriendlyIndicators.Enable(true);
    this.uiCheckFriendlyNames.Enable(true);
    this.uiSpinReinforcement.Enable(true);
    this.uiSpinFragLimit.Enable(true);
    this.uiCheckSpecTeamonly.Enable(true);

    this.uiSpinArtreturnTime.Enable(true);
    this.uiCheckActivatedReturn.Enable(true);

    const btnReinforcement: CUITabButton = this.uiTabRespawn.GetButtonById("reinforcement");
    const btnArtefactCapture: CUITabButton = this.uiTabRespawn.GetButtonById("artefactcapture");

    btnReinforcement.Enable(true);
    btnArtefactCapture.Enable(true);

    if ((GAME_TYPE.GAME_UNKNOWN as number) !== 0) {
      if (GAME_TYPE.eGameIDDeathmatch === mode) {
        this.uiSpinFriendlyFire.Enable(false);
        this.uiCheckAutoTeamBalance.Enable(false);
        this.uiCheckAutoTeamSwap.Enable(false);
        this.uiSpinArtefactsNum.Enable(false);
        this.uiSpinArtefactDelay.Enable(false);
        this.uiSpinArtefactStay.Enable(false);
        this.uiCheckFriendlyIndicators.Enable(false);
        this.uiCheckFriendlyNames.Enable(false);
        this.uiCheckSpecTeamonly.Enable(false);
        this.uiSpinReinforcement.Enable(false);
        // -- tab
        this.uiTabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
        this.uiSpinArtreturnTime.Enable(false);
        this.uiCheckActivatedReturn.Enable(false);
      } else if (GAME_TYPE.eGameIDTeamDeathmatch === mode) {
        this.uiSpinArtefactsNum.Enable(false);
        this.uiSpinArtefactDelay.Enable(false);
        this.uiSpinArtefactStay.Enable(false);
        // -- tab
        this.uiTabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
        this.uiSpinArtreturnTime.Enable(false);
        this.uiCheckActivatedReturn.Enable(false);
      } else if (GAME_TYPE.eGameIDArtefactHunt === mode) {
        this.uiSpinFragLimit.Enable(false);
        this.uiSpinArtreturnTime.Enable(false);
        this.uiCheckActivatedReturn.Enable(false);
      } else if (GAME_TYPE.eGameIDCaptureTheArtefact === mode) {
        this.uiSpinArtefactDelay.Enable(false);
        this.uiSpinArtefactStay.Enable(false);
        this.uiSpinFragLimit.Enable(false);
      }
    } else if ((GAME_TYPE.GAME_UNKNOWN as number) === 0) {
      this.uiSpinArtreturnTime.Enable(false);
      this.uiCheckActivatedReturn.Enable(false);

      if (GAME_TYPE.GAME_DEATHMATCH === mode) {
        this.uiSpinFriendlyFire.Enable(false);
        this.uiCheckAutoTeamBalance.Enable(false);
        this.uiCheckAutoTeamSwap.Enable(false);
        this.uiSpinArtefactsNum.Enable(false);
        this.uiSpinArtefactDelay.Enable(false);
        this.uiSpinArtefactStay.Enable(false);
        this.uiCheckFriendlyIndicators.Enable(false);
        this.uiCheckFriendlyNames.Enable(false);
        this.uiCheckSpecTeamonly.Enable(false);
        this.uiSpinReinforcement.Enable(false);
        // -- tab
        this.uiTabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
      } else if (GAME_TYPE.GAME_TEAMDEATHMATCH === mode) {
        this.uiSpinArtefactsNum.Enable(false);
        this.uiSpinArtefactDelay.Enable(false);
        this.uiSpinArtefactStay.Enable(false);
        // -- tab
        this.uiTabRespawn.SetActiveTab("forcerespawn");
        btnReinforcement.Enable(false);
        btnArtefactCapture.Enable(false);
      } else if (GAME_TYPE.GAME_ARTEFACTHUNT === mode) {
        this.uiSpinFragLimit.Enable(false);
      }
    }
  }

  public onDemoSaveChange(): void {
    logger.info("Demo save change");

    executeConsoleCommand(consoleCommands.cl_mpdemosave, this.uiCheckDemosave.GetCheck() ? 1 : 0);
  }
}
