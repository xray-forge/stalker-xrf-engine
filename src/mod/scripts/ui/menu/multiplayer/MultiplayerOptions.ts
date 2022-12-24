import { IMultiplayerMenu } from "@/mod/scripts/ui/menu/MultiplayerMenu";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("MultiplayerOptions");

export interface IMultiplayerOptions extends XR_CUIWindow {
  online: boolean;

  __init(online_mode: boolean): void;

  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IMultiplayerMenu): void;
  SetGameMode(gameType: XR_TGAME_TYPE, handler: IMultiplayerMenu): void;
}

export const MultiplayerOptions: IMultiplayerOptions = declare_xr_class("MultiplayerOptions", CUIWindow, {
  __init(online_mode: boolean): void {
    xr_class_super();

    this.online = online_mode;
  },
  __finalize(): void {},
  InitControls(x, y, xml: XR_CScriptXmlInit, handler: IMultiplayerMenu): void {
    log.info("Init controls");

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

    if (this.online) {
      xml.InitStatic("tab_options:public_server_t", this);
    } else {
      xml.InitStatic("tab_options:public_server_d", this);
    }

    // --    handler.check_public_server            = xml.InitCheck("tab_options:check_public_server",            this)
    handler.check_spectator = xml.InitCheck("tab_options:check_spectator", this);
    handler.check_allow_voting = xml.InitCheck("tab_options:check_allow_voting", this);
    handler.spin_max_ping = xml.InitSpinNum("tab_options:spin_max_ping", this);

    handler.check_damage_block = xml.InitCheck("tab_options:check_damage_block", this);
    handler.check_auto_team_balance = xml.InitCheck("tab_options:check_auto_team_balance", this);
    handler.check_auto_team_swap = xml.InitCheck("tab_options:check_auto_team_swap", this);
    handler.check_friendly_indicators = xml.InitCheck("tab_options:check_friendly_indicators", this);
    handler.check_friendly_names = xml.InitCheck("tab_options:check_friendly_names", this);
    handler.check_no_anmalies = xml.InitCheck("tab_options:check_no_anmalies", this);

    handler.check_spec_teamonly = xml.InitCheck("tab_options:check_spec_teamonly", this);
    handler.check_spec_freefly = xml.InitCheck("tab_options:check_spec_freefly", this);
    handler.check_spec_firsteye = xml.InitCheck("tab_options:check_spec_firsteye", this);
    handler.check_spec_lookat = xml.InitCheck("tab_options:check_spec_lookat", this);
    handler.check_spec_freelook = xml.InitCheck("tab_options:check_spec_freelook", this);

    handler.check_demosave = xml.InitCheck("tab_options:check_demosave", this);
    handler.Register(handler.check_demosave, "check_demosave");

    handler.tab_respawn = xml.InitTab("tab_options:radio_tab_respawn_options", this);
    // -- spin boxes
    handler.spin_friendly_fire = xml.InitSpinFlt("tab_options:spin_friendly_fire", this);
    handler.spin_artefacts_num = xml.InitSpinNum("tab_options:spin_artefacts_num", this);
    handler.spin_spectator = xml.InitSpinNum("tab_options:spin_spectator", this);
    handler.spin_force_respawn = xml.InitSpinNum("tab_options:spin_force_respawn", this);
    handler.spin_reinforcement = xml.InitSpinNum("tab_options:spin_reinforcement", this);

    handler.spin_damage_block = xml.InitSpinNum("tab_options:spin_damage_block", this);
    handler.spin_artreturn_time = xml.InitSpinNum("tab_options:spin_artreturn_time", this);
    handler.check_activated_return = xml.InitCheck("tab_options:check_activated_return", this);
    handler.spin_frag_limit = xml.InitSpinNum("tab_options:spin_frag_limit", this);
    handler.spin_time_limit = xml.InitSpinNum("tab_options:spin_time_limit", this);
    handler.spin_artefact_stay = xml.InitSpinNum("tab_options:spin_artefact_stay", this);
    handler.spin_artefact_delay = xml.InitSpinNum("tab_options:spin_artefact_delay", this);
    handler.spin_anomaly_time = xml.InitSpinNum("tab_options:spin_anomaly_time", this);
    handler.spin_warm_up_time = xml.InitSpinNum("tab_options:spin_warm_up_time", this);

    handler.check_pda_hunt = xml.InitCheck("tab_options:check_pda_hunt", this);
    handler.spin_rate_of_change = xml.InitSpinFlt("tab_options:spin_rate_of_change", this);
    handler.spin_weather = xml.InitComboBox("tab_options:spin_weather", this);

    handler.check_spectator.SetDependControl(handler.spin_spectator);

    // --    handler.check_public_server.SetDependControl(handler.check_verify_cdkey)

    if (this.online) {
      // --        handler.check_public_server.SetCheck(true)
    } else {
      // --        handler.check_public_server.SetCheck(false)
    }
  },
  SetGameMode(mode: XR_TGAME_TYPE, handler: IMultiplayerMenu): void {
    log.info("Set game mode");

    handler.spin_friendly_fire.Enable(true);
    handler.check_auto_team_balance.Enable(true);
    handler.check_auto_team_swap.Enable(true);
    handler.spin_artefacts_num.Enable(true);
    handler.spin_artefact_delay.Enable(true);
    handler.spin_artefact_stay.Enable(true);
    handler.check_friendly_indicators.Enable(true);
    handler.check_friendly_names.Enable(true);
    handler.spin_reinforcement.Enable(true);
    handler.spin_frag_limit.Enable(true);
    handler.check_spec_teamonly.Enable(true);

    handler.spin_artreturn_time.Enable(true);
    handler.check_activated_return.Enable(true);

    const btn_reinforcement = handler.tab_respawn.GetButtonById("reinforcement");
    const btn_artefactcapture = handler.tab_respawn.GetButtonById("artefactcapture");

    btn_reinforcement.Enable(true);
    btn_artefactcapture.Enable(true);

    if ((GAME_TYPE.GAME_UNKNOWN as number) !== 0) {
      if (GAME_TYPE.eGameIDDeathmatch === mode) {
        handler.spin_friendly_fire.Enable(false);
        handler.check_auto_team_balance.Enable(false);
        handler.check_auto_team_swap.Enable(false);
        handler.spin_artefacts_num.Enable(false);
        handler.spin_artefact_delay.Enable(false);
        handler.spin_artefact_stay.Enable(false);
        handler.check_friendly_indicators.Enable(false);
        handler.check_friendly_names.Enable(false);
        handler.check_spec_teamonly.Enable(false);
        handler.spin_reinforcement.Enable(false);
        // -- tab
        handler.tab_respawn.SetActiveTab("forcerespawn");
        btn_reinforcement.Enable(false);
        btn_artefactcapture.Enable(false);
        handler.spin_artreturn_time.Enable(false);
        handler.check_activated_return.Enable(false);
      } else if (GAME_TYPE.eGameIDTeamDeathmatch === mode) {
        handler.spin_artefacts_num.Enable(false);
        handler.spin_artefact_delay.Enable(false);
        handler.spin_artefact_stay.Enable(false);
        // -- tab
        handler.tab_respawn.SetActiveTab("forcerespawn");
        btn_reinforcement.Enable(false);
        btn_artefactcapture.Enable(false);
        handler.spin_artreturn_time.Enable(false);
        handler.check_activated_return.Enable(false);
      } else if (GAME_TYPE.eGameIDArtefactHunt === mode) {
        handler.spin_frag_limit.Enable(false);
        handler.spin_artreturn_time.Enable(false);
        handler.check_activated_return.Enable(false);
      } else if (GAME_TYPE.eGameIDCaptureTheArtefact === mode) {
        handler.spin_artefact_delay.Enable(false);
        handler.spin_artefact_stay.Enable(false);
        handler.spin_frag_limit.Enable(false);
      }
    } else if ((GAME_TYPE.GAME_UNKNOWN as number) === 0) {
      handler.spin_artreturn_time.Enable(false);
      handler.check_activated_return.Enable(false);

      if (GAME_TYPE.GAME_DEATHMATCH === mode) {
        handler.spin_friendly_fire.Enable(false);
        handler.check_auto_team_balance.Enable(false);
        handler.check_auto_team_swap.Enable(false);
        handler.spin_artefacts_num.Enable(false);
        handler.spin_artefact_delay.Enable(false);
        handler.spin_artefact_stay.Enable(false);
        handler.check_friendly_indicators.Enable(false);
        handler.check_friendly_names.Enable(false);
        handler.check_spec_teamonly.Enable(false);
        handler.spin_reinforcement.Enable(false);
        // -- tab
        handler.tab_respawn.SetActiveTab("forcerespawn");
        btn_reinforcement.Enable(false);
        btn_artefactcapture.Enable(false);
      } else if (GAME_TYPE.GAME_TEAMDEATHMATCH === mode) {
        handler.spin_artefacts_num.Enable(false);
        handler.spin_artefact_delay.Enable(false);
        handler.spin_artefact_stay.Enable(false);
        // -- tab
        handler.tab_respawn.SetActiveTab("forcerespawn");
        btn_reinforcement.Enable(false);
        btn_artefactcapture.Enable(false);
      } else if (GAME_TYPE.GAME_ARTEFACTHUNT === mode) {
        handler.spin_frag_limit.Enable(false);
      }
    }
  }
} as IMultiplayerOptions);
