import { game, TXR_net_processor, XR_CTime, XR_ini_file, XR_net_packet } from "xray16";

import { relations } from "@/mod/globals/relations";
import { Optional, TName, TSection } from "@/mod/lib/types";
import { SmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { registry } from "@/mod/scripts/core/database";
import { get_sim_board } from "@/mod/scripts/core/database/SimBoard";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { isWeapon } from "@/mod/scripts/utils/checkers/is";
import { getConfigString, parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { setSquadGoodwill } from "@/mod/scripts/utils/relations";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

const logger: LuaLogger = new LuaLogger("SmartTerrainControl");

export enum ESmartTerrainStatus {
  NORMAL = 0,
  DANGER,
  ALARM,
}

export let current_smart_id: Optional<number> = null;

const ALARM_TIME = 2 * 60 * 60;

// CBaseOnActorControl
/**
 * todo;
 */
export class SmartTerrainControl {
  public status: ESmartTerrainStatus;
  public noweap_zone: TName;
  public ignore_zone: string;
  public alarm_start_sound: string;
  public alarm_stop_sound: string;
  public smart: SmartTerrain;
  public alarm_time: Optional<XR_CTime> = null;

  public constructor(smart: SmartTerrain, ini: XR_ini_file, section: TSection) {
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
  }

  public update(): void {
    if (this.status === ESmartTerrainStatus.ALARM) {
      if (game.get_game_time().diffSec(this.alarm_time!) < ALARM_TIME) {
        return;
      }

      const sound = pickSectionFromCondList(registry.actor, this.smart, this.alarm_stop_sound as any);

      if (sound !== null) {
        GlobalSound.set_sound_play(registry.actor.id(), sound, null, null);
      }

      for (const [squad_id, squad] of get_sim_board().smarts.get(this.smart.id).squads) {
        setSquadGoodwill(squad_id, relations.neutral);
      }
    }

    if (this.get_actor_treat() === true) {
      this.status = ESmartTerrainStatus.DANGER;
    } else {
      this.status = ESmartTerrainStatus.NORMAL;
    }
  }

  public get_actor_treat(): boolean {
    const zone = registry.zones.get(this.noweap_zone);

    if (zone === null) {
      return false;
    }

    if (!zone.inside(registry.actor.position())) {
      if (current_smart_id === this.smart.id) {
        current_smart_id = null;
      }

      return false;
    } else {
      current_smart_id = this.smart.id;
    }

    if (isWeapon(registry.actor.active_item())) {
      return true;
    }

    return false;
  }

  public actor_attack(): void {
    logger.info("Actor attacked smart:", this.smart.name());

    if (this.status !== ESmartTerrainStatus.ALARM) {
      const sound = pickSectionFromCondList(registry.actor, this.smart, this.alarm_start_sound as any);

      if (sound !== null) {
        GlobalSound.set_sound_play(registry.actor.id(), sound, null, null);
      }

      for (const [squad_id, squad] of get_sim_board().smarts.get(this.smart.id).squads) {
        setSquadGoodwill(squad_id, relations.enemy);
      }
    }

    this.status = ESmartTerrainStatus.ALARM;
    this.alarm_time = game.get_game_time();
  }

  public get_status(): ESmartTerrainStatus {
    return this.status;
  }

  public save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, SmartTerrainControl.name);

    packet.w_u8(this.status);
    writeCTimeToPacket(packet, this.alarm_time);

    setSaveMarker(packet, true, SmartTerrainControl.name);
  }

  public load(reader: TXR_net_processor): void {
    setLoadMarker(reader, false, SmartTerrainControl.name);

    this.status = reader.r_u8();
    this.alarm_time = readCTimeFromPacket(reader);

    setLoadMarker(reader, true, SmartTerrainControl.name);
  }
}
export function getCurrentSmartId(): Optional<number> {
  return current_smart_id;
}
