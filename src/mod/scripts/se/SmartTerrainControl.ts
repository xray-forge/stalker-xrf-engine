import {
  game,
  TXR_net_processor,
  XR_CTime,
  XR_EngineBinding,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
} from "xray16";

import { Optional } from "@/mod/lib/types";
import { getActor, zoneByName } from "@/mod/scripts/core/db";
import { set_squad_goodwill } from "@/mod/scripts/core/game_relations";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { get_sim_board } from "@/mod/scripts/se/SimBoard";
import { ISmartTerrain } from "@/mod/scripts/se/SmartTerrain";
import { isWeapon } from "@/mod/scripts/utils/checkers/is";
import { getConfigString, parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

const logger: LuaLogger = new LuaLogger("SmartTerrainControl");

export enum ESmartTerrainStatus {
  NORMAL = 0,
  DANGER,
  ALARM,
}

export let current_smart_id: Optional<number> = null;

const ALARM_TIME = 2 * 60 * 60;

export interface ISmartTerrainControl extends XR_EngineBinding {
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
  load(packet: TXR_net_processor): void;
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

      const sound = pickSectionFromCondList(getActor() as XR_game_object, this.smart, this.alarm_stop_sound as any);

      if (sound !== null) {
        GlobalSound.set_sound_play(getActor()!.id(), sound, null, null);
      }

      for (const [squad_id, squad] of get_sim_board().smarts.get(this.smart.id).squads) {
        set_squad_goodwill(squad_id, "neutral");
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
    logger.info("Actor attacked smart:", this.smart.name());

    if (this.status !== ESmartTerrainStatus.ALARM) {
      const sound = pickSectionFromCondList(getActor() as XR_game_object, this.smart, this.alarm_start_sound as any);

      if (sound !== null) {
        GlobalSound.set_sound_play(getActor()!.id(), sound, null, null);
      }

      for (const [squad_id, squad] of get_sim_board().smarts.get(this.smart.id).squads) {
        set_squad_goodwill(squad_id, "enemy");
      }
    }

    this.status = ESmartTerrainStatus.ALARM;
    this.alarm_time = game.get_game_time();
  },
  get_status(): ESmartTerrainStatus {
    return this.status;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, SmartTerrainControl.__name);

    packet.w_u8(this.status);
    writeCTimeToPacket(packet, this.alarm_time);

    setSaveMarker(packet, true, SmartTerrainControl.__name);
  },
  load(reader: TXR_net_processor): void {
    setLoadMarker(reader, false, SmartTerrainControl.__name);

    this.status = reader.r_u8();
    this.alarm_time = readCTimeFromPacket(reader);

    setLoadMarker(reader, true, SmartTerrainControl.__name);
  },
} as ISmartTerrainControl);

export function getCurrentSmartId(): Optional<number> {
  return current_smart_id;
}
