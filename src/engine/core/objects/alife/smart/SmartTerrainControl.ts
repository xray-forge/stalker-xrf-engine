import { game, TXR_net_processor, XR_CTime, XR_ini_file, XR_net_packet } from "xray16";

import { registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { isWeapon } from "@/engine/core/utils/check/is";
import { setLoadMarker, setSaveMarker } from "@/engine/core/utils/game_save";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { setSquadGoodwill } from "@/engine/core/utils/relation";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/engine/core/utils/time";
import { relations } from "@/engine/lib/constants/relations";
import { Optional, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
  public alarm_start_sound: TConditionList;
  public alarm_stop_sound: TConditionList;
  public smart: SmartTerrain;
  public alarm_time: Optional<XR_CTime> = null;

  /**
   * todo: Description.
   */
  public constructor(smart: SmartTerrain, ini: XR_ini_file, section: TSection) {
    this.noweap_zone = getConfigString(ini, section, "noweap_zone", this, true, "");
    this.ignore_zone = getConfigString(ini, section, "ignore_zone", this, false, "");

    this.alarm_start_sound = parseConditionsList(getConfigString(ini, section, "alarm_start_sound", this, false, ""));
    this.alarm_stop_sound = parseConditionsList(getConfigString(ini, section, "alarm_stop_sound", this, false, ""));

    this.smart = smart;
    this.status = ESmartTerrainStatus.NORMAL;
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.status === ESmartTerrainStatus.ALARM) {
      if (game.get_game_time().diffSec(this.alarm_time!) < ALARM_TIME) {
        return;
      }

      const sound = pickSectionFromCondList(registry.actor, this.smart, this.alarm_stop_sound as any);

      if (sound !== null) {
        GlobalSoundManager.getInstance().setSoundPlaying(registry.actor.id(), sound, null, null);
      }

      for (const [squad_id, squad] of SimulationBoardManager.getInstance().getSmartTerrainDescriptorById(
        this.smart.id!
      )!.assignedSquads) {
        setSquadGoodwill(squad_id, relations.neutral);
      }
    }

    if (this.get_actor_treat()) {
      this.status = ESmartTerrainStatus.DANGER;
    } else {
      this.status = ESmartTerrainStatus.NORMAL;
    }
  }

  /**
   * todo: Description.
   */
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

  /**
   * todo: Description.
   */
  public actor_attack(): void {
    logger.info("Actor attacked smart:", this.smart.name());

    if (this.status !== ESmartTerrainStatus.ALARM) {
      const sound = pickSectionFromCondList(registry.actor, this.smart, this.alarm_start_sound as any);

      if (sound !== null) {
        GlobalSoundManager.getInstance().setSoundPlaying(registry.actor.id(), sound, null, null);
      }

      for (const [squad_id, squad] of SimulationBoardManager.getInstance().getSmartTerrainDescriptorById(this.smart.id)!
        .assignedSquads) {
        setSquadGoodwill(squad_id, relations.enemy);
      }
    }

    this.status = ESmartTerrainStatus.ALARM;
    this.alarm_time = game.get_game_time();
  }

  /**
   * todo: Description.
   */
  public get_status(): ESmartTerrainStatus {
    return this.status;
  }

  /**
   * todo: Description.
   */
  public save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, SmartTerrainControl.name);

    packet.w_u8(this.status);
    writeCTimeToPacket(packet, this.alarm_time);

    setSaveMarker(packet, true, SmartTerrainControl.name);
  }

  /**
   * todo: Description.
   */
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
