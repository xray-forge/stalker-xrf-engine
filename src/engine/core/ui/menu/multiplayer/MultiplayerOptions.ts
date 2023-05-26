import { CScriptXmlInit, CUIWindow, GAME_TYPE, LuabindClass, TXR_GAME_TYPE } from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerOptions extends CUIWindow {
  public online: boolean;

  public constructor(online_mode: boolean) {
    super();
    this.online = online_mode;
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

    if (this.online) {
      xml.InitStatic("tab_options:public_server_t", this);
    } else {
      xml.InitStatic("tab_options:public_server_d", this);
    }

    // --    handler.check_public_server            = xml.InitCheck("tab_options:check_public_server",            this)
    owner.check_spectator = xml.InitCheck("tab_options:check_spectator", this);
    owner.check_allow_voting = xml.InitCheck("tab_options:check_allow_voting", this);
    owner.spin_max_ping = xml.InitSpinNum("tab_options:spin_max_ping", this);

    owner.check_damage_block = xml.InitCheck("tab_options:check_damage_block", this);
    owner.check_auto_team_balance = xml.InitCheck("tab_options:check_auto_team_balance", this);
    owner.check_auto_team_swap = xml.InitCheck("tab_options:check_auto_team_swap", this);
    owner.check_friendly_indicators = xml.InitCheck("tab_options:check_friendly_indicators", this);
    owner.check_friendly_names = xml.InitCheck("tab_options:check_friendly_names", this);
    owner.check_no_anmalies = xml.InitCheck("tab_options:check_no_anmalies", this);

    owner.check_spec_teamonly = xml.InitCheck("tab_options:check_spec_teamonly", this);
    owner.check_spec_freefly = xml.InitCheck("tab_options:check_spec_freefly", this);
    owner.check_spec_firsteye = xml.InitCheck("tab_options:check_spec_firsteye", this);
    owner.check_spec_lookat = xml.InitCheck("tab_options:check_spec_lookat", this);
    owner.check_spec_freelook = xml.InitCheck("tab_options:check_spec_freelook", this);

    owner.check_demosave = xml.InitCheck("tab_options:check_demosave", this);
    owner.Register(owner.check_demosave, "check_demosave");

    owner.tab_respawn = xml.InitTab("tab_options:radio_tab_respawn_options", this);
    // -- spin boxes
    owner.spin_friendly_fire = xml.InitSpinFlt("tab_options:spin_friendly_fire", this);
    owner.spin_artefacts_num = xml.InitSpinNum("tab_options:spin_artefacts_num", this);
    owner.spin_spectator = xml.InitSpinNum("tab_options:spin_spectator", this);
    owner.spin_force_respawn = xml.InitSpinNum("tab_options:spin_force_respawn", this);
    owner.spin_reinforcement = xml.InitSpinNum("tab_options:spin_reinforcement", this);

    owner.spin_damage_block = xml.InitSpinNum("tab_options:spin_damage_block", this);
    owner.spin_artreturn_time = xml.InitSpinNum("tab_options:spin_artreturn_time", this);
    owner.check_activated_return = xml.InitCheck("tab_options:check_activated_return", this);
    owner.spin_frag_limit = xml.InitSpinNum("tab_options:spin_frag_limit", this);
    owner.spin_time_limit = xml.InitSpinNum("tab_options:spin_time_limit", this);
    owner.spin_artefact_stay = xml.InitSpinNum("tab_options:spin_artefact_stay", this);
    owner.spin_artefact_delay = xml.InitSpinNum("tab_options:spin_artefact_delay", this);
    owner.spin_anomaly_time = xml.InitSpinNum("tab_options:spin_anomaly_time", this);
    owner.spin_warm_up_time = xml.InitSpinNum("tab_options:spin_warm_up_time", this);

    owner.check_pda_hunt = xml.InitCheck("tab_options:check_pda_hunt", this);
    owner.spin_rate_of_change = xml.InitSpinFlt("tab_options:spin_rate_of_change", this);
    owner.spin_weather = xml.InitComboBox("tab_options:spin_weather", this);

    owner.check_spectator.SetDependControl(owner.spin_spectator);

    // --    handler.check_public_server.SetDependControl(handler.check_verify_cdkey)

    if (this.online) {
      // --        handler.check_public_server.SetCheck(true)
    } else {
      // --        handler.check_public_server.SetCheck(false)
    }
  }

  public SetGameMode(mode: TXR_GAME_TYPE, handler: MultiplayerMenu): void {
    logger.info("Set game mode");

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
}
