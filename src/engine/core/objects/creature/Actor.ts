import { CALifeSmartTerrainTask, cse_alife_creature_actor, LuabindClass } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  openSaveMarker,
  registerActorServer,
  registerStoryLink,
  registry,
  softResetOfflineObject,
  unregisterActorServer,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { registerSimulationObject, unregisterSimulationObject } from "@/engine/core/database/simulation";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SaveManager } from "@/engine/core/managers/save/SaveManager";
import { ISimulationTarget, simulationActivities } from "@/engine/core/managers/simulation";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { Squad } from "@/engine/core/objects/squad/Squad";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { parseConditionsList } from "@/engine/core/utils/ini/ini_parse";
import { TConditionList } from "@/engine/core/utils/ini/ini_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ACTOR, TRUE } from "@/engine/lib/constants/words";
import {
  ALifeSmartTerrainTask,
  GameObject,
  NetPacket,
  Optional,
  ServerObject,
  TName,
  TRate,
  TSize,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Actor server representation.
 * Generic registration logic and extension for simulation implementation.
 */
@LuabindClass()
export class Actor extends cse_alife_creature_actor implements ISimulationTarget {
  public isSimulationAvailableConditionList: TConditionList = parseConditionsList(TRUE);
  public simulationProperties!: LuaTable<TName, TRate>;

  public override on_register(): void {
    super.on_register();

    logger.info("Register actor:", this.id, this.name(), this.section_name());

    registerActorServer(this);
    registerStoryLink(this.id, ACTOR);
    registerSimulationObject(this);

    getManager(SimulationManager).onActorRegister();

    EventsManager.emitEvent(EGameEvent.ACTOR_REGISTER, this);
  }

  public override on_unregister(): void {
    logger.info("Unregister actor");

    EventsManager.emitEvent(EGameEvent.ACTOR_UNREGISTER, this);

    unregisterActorServer();
    unregisterStoryLinkByObjectId(this.id);
    unregisterSimulationObject(this);

    super.on_unregister();
  }

  public override STATE_Write(packet: NetPacket): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, Actor.__name);
    getManager(SaveManager).serverSave(packet);
    closeSaveMarker(packet, Actor.__name);
  }

  public override STATE_Read(packet: NetPacket, size: TSize): void {
    super.STATE_Read(packet, size);

    openLoadMarker(packet, Actor.__name);
    getManager(SaveManager).serverLoad(packet);
    closeLoadMarker(packet, Actor.__name);
  }

  public override on_death(killer: ServerObject): void {
    super.on_death(killer);

    logger.info("On actor death:", this.name(), killer.id, killer?.name());

    EventsManager.emitEvent(EGameEvent.ACTOR_DEATH, this, killer);
  }

  /**
   * Get generic task.
   */
  public getSimulationTask(): ALifeSmartTerrainTask {
    return new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
  }

  /**
   * @returns whether squad completed assigned task to `kill?` actor
   */
  public isReachedBySimulationObject(): boolean {
    return !registry.actor.alive();
  }

  /**
   * Whether actor is available for simulation.
   * Exclude from participation when in some safe zones.
   */
  public isSimulationAvailable(): boolean {
    if (pickSectionFromCondList(registry.actor, this, this.isSimulationAvailableConditionList) !== TRUE) {
      return false;
    }

    if (
      registry.smartTerrainNearest.distanceSqr < 2_500 && // 50*50
      !registry.simulationObjects.has(registry.smartTerrainNearest.id!)
    ) {
      return false;
    }

    for (const [zoneName, smartName] of registry.noCombatZones) {
      const zone: GameObject = registry.zones.get(zoneName);

      if (zone !== null && zone.inside(this.position)) {
        const smartTerrain: Optional<SmartTerrain> = getManager(SimulationManager).getSmartTerrainByName(smartName);

        if (smartTerrain && smartTerrain.smartTerrainActorControl?.status !== ESmartTerrainStatus.ALARM) {
          return false;
        }
      }
    }

    if (registry.activeSmartTerrainId === null) {
      return true;
    }

    const activeSmartTerrain: SmartTerrain = registry.simulator.object<SmartTerrain>(
      registry.activeSmartTerrainId
    ) as SmartTerrain;

    if (
      activeSmartTerrain.smartTerrainActorControl?.status === ESmartTerrainStatus.NORMAL &&
      registry.zones.get(activeSmartTerrain.smartTerrainActorControl.noWeaponZone).inside(this.position)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Whether actor can be selected as simulation target by squad.
   */
  public isValidSimulationTarget(squad: Squad): boolean {
    return simulationActivities.get(squad.faction)?.actor?.(squad, this) === true;
  }

  /**
   * When squad already reached actor.
   */
  public onSimulationTargetDeselected(squad: Squad): void {
    /**
     * Nothing.
     */
  }

  /**
   * When squad reaches actor.
   */
  public onSimulationTargetSelected(squad: Squad): void {
    squad.setLocationTypes();

    for (const squadMember of squad.squad_members()) {
      softResetOfflineObject(squadMember.id);
    }

    getManager(SimulationManager).assignSquadToSmartTerrain(squad, null);
  }
}
