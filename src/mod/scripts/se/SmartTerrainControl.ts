import { game, XR_CTime, XR_ini_file, XR_LuaBindBase, XR_net_packet } from "xray16";

import { AnyCallable, AnyCallablesModule, Optional } from "@/mod/lib/types";
import { isWeapon } from "@/mod/scripts/core/checkers";
import { getActor, zoneByName } from "@/mod/scripts/core/db";
import { get_sim_board } from "@/mod/scripts/se/SimBoard";
import { ISmartTerrain } from "@/mod/scripts/se/SmartTerrain";
import { getConfigString, parseCondList } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

const log: LuaLogger = new LuaLogger("SmartTerrainControl");

export enum ESmartTerrainStatus {
  NORMAL = 0,
  DANGER,
  ALARM
}

export let current_smart_id: Optional<number> = null;

const ALARM_TIME = 2 * 60 * 60;

export interface ISmartTerrainControl extends XR_LuaBindBase {
  status: ESmartTerrainStatus;
  noweap_zone: string;
  ignore_zone: string;
  alarm_start_sound: string;
  alarm_stop_sound: string;
  smart: ISmartTerrain;

  alarm_time: Optional<XR_CTime>;

  update(): void;
  get_actor_treat(): boolean;
  actor_attack(): void;
  get_status(): ESmartTerrainStatus;
  save(packet: XR_net_packet): void;
  load(packet: XR_net_packet): void;
}

// CBaseOnActorControl
export const SmartTerrainControl: ISmartTerrainControl = declare_xr_class("SmartTerrainControl", null, {
  __init(smart: ISmartTerrain, ini: XR_ini_file, section: string): void {
    this.noweap_zone = getConfigString(ini, section, "noweap_zone", this, true, "");
    this.ignore_zone = getConfigString(ini, section, "ignore_zone", this, false, "");

    this.alarm_start_sound = parseCondList(
      smart,
      section,
      "alarm_start_sound",
      getConfigString(ini, section, "alarm_start_sound", this, false, "")
    );
    this.alarm_stop_sound = parseCondList(
      smart,
      section,
      "alarm_stop_sound",
      getConfigString(ini, section, "alarm_stop_sound", this, false, "")
    );

    this.smart = smart;
    this.status = ESmartTerrainStatus.NORMAL;
  },
  update(): void {
    if (this.status === ESmartTerrainStatus.ALARM) {
      if (game.get_game_time().diffSec(this.alarm_time!) < ALARM_TIME) {
        return;
      }

      const sound = get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(
        getActor(),
        this.smart,
        this.alarm_stop_sound
      );

      if (sound !== null) {
        get_global<AnyCallablesModule>("xr_sound").set_sound_play(getActor()!.id(), sound);
      }

      for (const [squad_id, squad] of get_sim_board().smarts.get(this.smart.id).squads) {
        get_global<AnyCallablesModule>("game_relations").set_squad_goodwill(squad_id, "neutral");
      }
    }

    if (this.get_actor_treat() === true) {
      this.status = ESmartTerrainStatus.DANGER;
    } else {
      this.status = ESmartTerrainStatus.NORMAL;
    }
  },
  get_actor_treat(): boolean {
    const zone = zoneByName.get(this.noweap_zone);

    if (zone === null) {
      return false;
    }

    if (!zone.inside(getActor()!.position())) {
      if (current_smart_id === this.smart.id) {
        current_smart_id = null;
      }

      return false;
    } else {
      current_smart_id = this.smart.id;
    }

    if (isWeapon(getActor()!.active_item())) {
      return true;
    }

    return false;
  },
  actor_attack(): void {
    log.info("Actor attacked smart:", this.smart.name());

    if (this.status !== ESmartTerrainStatus.ALARM) {
      const sound = get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(
        getActor(),
        this.smart,
        this.alarm_start_sound
      );

      if (sound !== null) {
        get_global<AnyCallablesModule>("xr_sound").set_sound_play(getActor()!.id(), sound);
      }

      for (const [squad_id, squad] of get_sim_board().smarts.get(this.smart.id).squads) {
        get_global<AnyCallablesModule>("game_relations").set_squad_goodwill(squad_id, "enemy");
      }
    }

    this.status = ESmartTerrainStatus.ALARM;
    this.alarm_time = game.get_game_time();
  },
  get_status(): ESmartTerrainStatus {
    return this.status;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "SmartTerrainControl");

    packet.w_u8(this.status);
    writeCTimeToPacket(packet, this.alarm_time);

    setSaveMarker(packet, true, "SmartTerrainControl");
  },
  load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, "SmartTerrainControl");

    this.status = packet.r_u8();
    this.alarm_time = readCTimeFromPacket(packet);

    setLoadMarker(packet, true, "SmartTerrainControl");
  }
} as ISmartTerrainControl);

export function getCurrentSmartId(): Optional<number> {
  return current_smart_id;
}
