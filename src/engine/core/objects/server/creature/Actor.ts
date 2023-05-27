import { alife, CALifeSmartTerrainTask, cse_alife_creature_actor, level, LuabindClass } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openSaveMarker,
  registerStoryLink,
  registry,
  softResetOfflineObject,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { registerSimulationObject, unregisterSimulationObject } from "@/engine/core/database/simulation";
import { EGameEvent, EventsManager } from "@/engine/core/managers";
import { SaveManager } from "@/engine/core/managers/base/SaveManager";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart_terrain/types";
import { simulationActivities } from "@/engine/core/objects/server/squad/simulation_activities";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { ISimulationTarget } from "@/engine/core/objects/server/types";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { ACTOR, TRUE } from "@/engine/lib/constants/words";
import {
  ALifeSmartTerrainTask,
  AnyObject,
  ClientObject,
  NetPacket,
  ServerCreatureObject,
  TNumberId,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Actor server representation.
 * Generic registration logic and extension for simulation implementation.
 */
@LuabindClass()
export class Actor extends cse_alife_creature_actor implements ISimulationTarget {
  public isSimulationAvailableConditionList: TConditionList = parseConditionsList(TRUE);
  public simulationProperties!: AnyObject;

  public override on_register(): void {
    super.on_register();

    logger.info("Register actor:", this.id, this.name(), this.section_name());

    registerStoryLink(this.id, ACTOR);
    registerSimulationObject(this);

    SimulationBoardManager.getInstance().onActorNetworkRegister();
  }

  public override on_unregister(): void {
    super.on_unregister();

    logger.info("Unregister actor");

    unregisterStoryLinkByObjectId(this.id);
    unregisterSimulationObject(this);
  }

  public override STATE_Write(packet: NetPacket): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, Actor.__name);
    SaveManager.getInstance().writeState(packet);
    closeSaveMarker(packet, Actor.__name);
  }

  public override STATE_Read(packet: NetPacket, size: number): void {
    super.STATE_Read(packet, size);

    openLoadMarker(packet, Actor.__name);
    SaveManager.getInstance().readState(packet);
    closeLoadMarker(packet, Actor.__name);
  }

  public override on_death(killer: ServerCreatureObject): void {
    super.on_death(killer);

    logger.info("On actor death:", this.name(), killer.id, killer?.name());

    EventsManager.emitEvent(EGameEvent.ACTOR_DEATH, this, killer);
  }

  /**
   * Get full actor location.
   */
  public getGameLocation(): LuaMultiReturn<[Vector, TNumberId, TNumberId]> {
    return $multi(this.position, this.m_level_vertex_id, this.m_game_vertex_id);
  }

  /**
   * Get generic task.
   */
  public getAlifeSmartTerrainTask(): ALifeSmartTerrainTask {
    return new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
  }

  /**
   * @returns whether squad completed assigned task to `kill?` actor
   */
  public isReachedBySquad(): boolean {
    return !level.object_by_id(this.id)!.alive();
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
      registry.smartTerrainNearest.distance < 50 &&
      !registry.simulationObjects.has(registry.smartTerrainNearest.id!)
    ) {
      return false;
    }

    for (const [zoneName, smartName] of registry.noCombatZones) {
      const zone: ClientObject = registry.zones.get(zoneName);

      if (zone !== null && zone.inside(this.position)) {
        const smart = SimulationBoardManager.getInstance().getSmartTerrainByName(smartName);

        if (smart !== null && smart.smartTerrainActorControl.status !== ESmartTerrainStatus.ALARM) {
          return false;
        }
      }
    }

    if (registry.activeSmartTerrainId === null) {
      return true;
    }

    const activeSmartTerrain: SmartTerrain = alife().object<SmartTerrain>(
      registry.activeSmartTerrainId
    ) as SmartTerrain;

    if (
      activeSmartTerrain.smartTerrainActorControl?.status === ESmartTerrainStatus.NORMAL &&
      registry.zones.get(activeSmartTerrain.smartTerrainActorControl.isNoWeaponZone).inside(this.position)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Whether actor can be selected as simulation target by squad.
   */
  public isValidSquadTarget(squad: Squad): boolean {
    return simulationActivities.get(squad.faction)?.actor?.canSelect(squad, this) === true;
  }

  /**
   * When squad already reached actor.
   */
  public onEndedBeingReachedBySquad(squad: Squad): void {
    /**
     * Nothing.
     */
  }

  /**
   * When squad reaches actor.
   */
  public onStartedBeingReachedBySquad(squad: Squad): void {
    squad.setLocationTypes();

    for (const squadMember of squad.squad_members()) {
      softResetOfflineObject(squadMember.id);
    }

    SimulationBoardManager.getInstance().assignSquadToSmartTerrain(squad, null);
  }
}
