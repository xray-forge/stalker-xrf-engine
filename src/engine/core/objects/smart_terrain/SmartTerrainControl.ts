import { game } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { getSimulationTerrainDescriptorById } from "@/engine/core/managers/simulation/utils";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { isWeapon } from "@/engine/core/utils/class_ids";
import { parseConditionsList, pickSectionFromCondList, readIniString, TConditionList } from "@/engine/core/utils/ini";
import { ERelation, updateSquadIdRelationToActor } from "@/engine/core/utils/relation";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import {
  GameObject,
  IniFile,
  NetPacket,
  NetProcessor,
  Optional,
  Time,
  TName,
  TSection,
  TStringId,
} from "@/engine/lib/types";

/**
 * Handler of smart terrain status.
 * Manages alarm and notifications about weapon hiding.
 */
export class SmartTerrainControl {
  public readonly terrain: SmartTerrain;
  public status: ESmartTerrainStatus = ESmartTerrainStatus.NORMAL;

  public noWeaponZone: TName;
  public ignoreZone: TName;

  public alarmStartedAt: Optional<Time> = null;
  public alarmStartSoundConditionList: TConditionList;
  public alarmStopSoundConditionList: TConditionList;

  public constructor(terrain: SmartTerrain, ini: IniFile, section: TSection) {
    this.terrain = terrain;

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
        this.terrain,
        this.alarmStopSoundConditionList
      );

      if (sound !== null) {
        getManager(SoundManager).play(ACTOR_ID, sound);
      }

      for (const [id] of getSimulationTerrainDescriptorById(this.terrain.id)!.assignedSquads) {
        updateSquadIdRelationToActor(id, ERelation.NEUTRAL);
      }

      this.alarmStartedAt = null;
    }

    this.status = this.getActorStatus() ? ESmartTerrainStatus.DANGER : ESmartTerrainStatus.NORMAL;
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
    const zoneObject: GameObject = registry.zones.get(this.noWeaponZone);

    if (zoneObject === null) {
      return false;
    }

    if (!zoneObject.inside(registry.actor.position())) {
      if (registry.activeSmartTerrainId === this.terrain.id) {
        registry.activeSmartTerrainId = null;
      }

      return false;
    } else {
      registry.activeSmartTerrainId = this.terrain.id;
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
        this.terrain,
        this.alarmStartSoundConditionList
      );

      if (sound) {
        getManager(SoundManager).play(ACTOR_ID, sound);
      }

      for (const [squadId] of getSimulationTerrainDescriptorById(this.terrain.id)!.assignedSquads) {
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
