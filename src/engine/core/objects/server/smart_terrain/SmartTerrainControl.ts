import { game } from "xray16";

import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker, registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart_terrain/smart_terrain_types";
import type { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/server/smart_terrain/SmartTerrainConfig";
import { isWeapon } from "@/engine/core/utils/class_ids";
import { parseConditionsList, pickSectionFromCondList, readIniString, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ERelation, updateSquadIdRelationToActor } from "@/engine/core/utils/relation";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import {
  ClientObject,
  IniFile,
  NetPacket,
  NetProcessor,
  Optional,
  Time,
  TName,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Handler of smart terrain status.
 * Manages alarm and notifications about weapon hiding.
 */
export class SmartTerrainControl {
  public readonly smartTerrain: SmartTerrain;
  public status: ESmartTerrainStatus = ESmartTerrainStatus.NORMAL;

  public noWeaponZone: TName;
  public ignoreZone: TName;

  public alarmStartedAt: Optional<Time> = null;
  public alarmStartSoundConditionList: TConditionList;
  public alarmStopSoundConditionList: TConditionList;

  public constructor(smartTerrain: SmartTerrain, ini: IniFile, section: TSection) {
    this.smartTerrain = smartTerrain;

    this.noWeaponZone = readIniString(ini, section, "noweap_zone", true);
    this.ignoreZone = readIniString(ini, section, "ignore_zone", false);

    this.alarmStartSoundConditionList = parseConditionsList(readIniString(ini, section, "alarm_start_sound", false));
    this.alarmStopSoundConditionList = parseConditionsList(readIniString(ini, section, "alarm_stop_sound", false));
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.status === ESmartTerrainStatus.ALARM) {
      if (game.get_game_time().diffSec(this.alarmStartedAt!) < smartTerrainConfig.ALARM_SMART_TERRAIN_BASE) {
        return;
      }

      const sound: Optional<TName> = pickSectionFromCondList(
        registry.actor,
        this.smartTerrain,
        this.alarmStopSoundConditionList
      );

      if (sound !== null) {
        GlobalSoundManager.getInstance().playSound(ACTOR_ID, sound);
      }

      for (const [id, squad] of SimulationBoardManager.getInstance().getSmartTerrainDescriptor(this.smartTerrain.id)!
        .assignedSquads) {
        updateSquadIdRelationToActor(id, ERelation.NEUTRAL);
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
    const zoneObject: ClientObject = registry.zones.get(this.noWeaponZone);

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
    if (this.status !== ESmartTerrainStatus.ALARM) {
      const sound: Optional<TStringId> = pickSectionFromCondList(
        registry.actor,
        this.smartTerrain,
        this.alarmStartSoundConditionList as any
      );

      if (sound !== null) {
        GlobalSoundManager.getInstance().playSound(ACTOR_ID, sound);
      }

      for (const [squadId] of SimulationBoardManager.getInstance().getSmartTerrainDescriptor(this.smartTerrain.id)!
        .assignedSquads) {
        updateSquadIdRelationToActor(squadId, ERelation.ENEMY);
      }
    }

    // Reset attack timers.
    this.status = ESmartTerrainStatus.ALARM;
    this.alarmStartedAt = game.get_game_time();
  }

  /**
   * Load generic information.
   */
  public save(packet: NetPacket): void {
    openSaveMarker(packet, SmartTerrainControl.name);

    packet.w_u8(this.status);
    writeTimeToPacket(packet, this.alarmStartedAt);

    closeSaveMarker(packet, SmartTerrainControl.name);
  }

  /**
   * Save generic information.
   */
  public load(reader: NetProcessor): void {
    openLoadMarker(reader, SmartTerrainControl.name);

    this.status = reader.r_u8();
    this.alarmStartedAt = readTimeFromPacket(reader);

    closeLoadMarker(reader, SmartTerrainControl.name);
  }
}
