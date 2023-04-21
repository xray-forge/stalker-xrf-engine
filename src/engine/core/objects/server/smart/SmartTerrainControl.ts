import { game, TXR_net_processor, XR_CTime, XR_game_object, XR_ini_file, XR_net_packet } from "xray16";

import { closeLoadMarker, closeSaveMarker, openSaveMarker, registry } from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart/types";
import { isWeapon } from "@/engine/core/utils/check/is";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { setSquadGoodwill } from "@/engine/core/utils/relation";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { relations } from "@/engine/lib/constants/relations";
import { Optional, TName, TSection, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Handler of smart terrain status.
 * Manages alarm and notifications about weapon hiding.
 */
export class SmartTerrainControl {
  public readonly smartTerrain: SmartTerrain;
  public status: ESmartTerrainStatus = ESmartTerrainStatus.NORMAL;

  public isNoWeaponZone: TName;
  public isIgnoreZone: TName;

  public alarmStartedAt: Optional<XR_CTime> = null;
  public alarmStartSoundConditionList: TConditionList;
  public alarmStopSoundConditionList: TConditionList;

  public constructor(smartTerrain: SmartTerrain, ini: XR_ini_file, section: TSection) {
    this.smartTerrain = smartTerrain;

    this.isNoWeaponZone = readIniString(ini, section, "noweap_zone", true, "");
    this.isIgnoreZone = readIniString(ini, section, "ignore_zone", false, "");

    this.alarmStartSoundConditionList = parseConditionsList(
      readIniString(ini, section, "alarm_start_sound", false, "")
    );
    this.alarmStopSoundConditionList = parseConditionsList(readIniString(ini, section, "alarm_stop_sound", false, ""));
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.status === ESmartTerrainStatus.ALARM) {
      if (game.get_game_time().diffSec(this.alarmStartedAt!) < logicsConfig.SMART_TERRAIN.ALARM_SMART_TERRAIN_BASE) {
        return;
      }

      const sound: Optional<TName> = pickSectionFromCondList(
        registry.actor,
        this.smartTerrain,
        this.alarmStopSoundConditionList
      );

      if (sound !== null) {
        GlobalSoundManager.getInstance().playSound(registry.actor.id(), sound, null, null);
      }

      for (const [id, squad] of SimulationBoardManager.getInstance().getSmartTerrainDescriptorById(
        this.smartTerrain.id
      )!.assignedSquads) {
        setSquadGoodwill(id, relations.neutral);
      }

      this.alarmStartedAt = null;
    }

    if (this.getActorStatus()) {
      this.status = ESmartTerrainStatus.DANGER;
    } else {
      this.status = ESmartTerrainStatus.NORMAL;
    }
  }

  /**
   * Get current status of smart terrain.
   */
  public getSmartTerrainStatus(): ESmartTerrainStatus {
    return this.status;
  }

  /**
   * todo: Description.
   */
  public getActorStatus(): boolean {
    const zoneObject: XR_game_object = registry.zones.get(this.isNoWeaponZone);

    if (zoneObject === null) {
      return false;
    }

    if (!zoneObject.inside(registry.actor.position())) {
      if (registry.activeSmartTerrainId === this.smartTerrain.id) {
        registry.activeSmartTerrainId = null;
      }

      return false;
    } else {
      registry.activeSmartTerrainId = this.smartTerrain.id;
    }

    if (isWeapon(registry.actor.active_item())) {
      return true;
    }

    return false;
  }

  /**
   * Actor attacked safe place, trigger alarms and lock all doors.
   * All stalkers inside become enemies.
   */
  public onActorAttackSmartTerrain(): void {
    logger.info("Actor attacked smart:", this.smartTerrain.name());

    if (this.status !== ESmartTerrainStatus.ALARM) {
      const sound: Optional<TStringId> = pickSectionFromCondList(
        registry.actor,
        this.smartTerrain,
        this.alarmStartSoundConditionList as any
      );

      if (sound !== null) {
        GlobalSoundManager.getInstance().playSound(registry.actor.id(), sound, null, null);
      }

      for (const [squadId] of SimulationBoardManager.getInstance().getSmartTerrainDescriptorById(this.smartTerrain.id)!
        .assignedSquads) {
        setSquadGoodwill(squadId, relations.enemy);
      }
    }

    // Reset attack timers.
    this.status = ESmartTerrainStatus.ALARM;
    this.alarmStartedAt = game.get_game_time();
  }

  /**
   * Load generic information.
   */
  public save(packet: XR_net_packet): void {
    openSaveMarker(packet, SmartTerrainControl.name);

    packet.w_u8(this.status);
    writeTimeToPacket(packet, this.alarmStartedAt);

    closeSaveMarker(packet, SmartTerrainControl.name);
  }

  /**
   * Save generic information.
   */
  public load(reader: TXR_net_processor): void {
    openLoadMarker(reader, SmartTerrainControl.name);

    this.status = reader.r_u8();
    this.alarmStartedAt = readTimeFromPacket(reader);

    closeLoadMarker(reader, SmartTerrainControl.name);
  }
}