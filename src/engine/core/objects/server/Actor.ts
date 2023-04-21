import {
  alife,
  CALifeSmartTerrainTask,
  cse_alife_creature_actor,
  level,
  LuabindClass,
  XR_CALifeSmartTerrainTask,
  XR_game_object,
  XR_net_packet,
  XR_vector,
} from "xray16";

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
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart/types";
import {
  ISimulationActivityDescriptor,
  simulationActivities,
} from "@/engine/core/objects/server/squad/simulation_activities";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { ISimulationTarget } from "@/engine/core/objects/server/types";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { ACTOR, TRUE } from "@/engine/lib/constants/words";
import { AnyObject, TNumberId, TStringId } from "@/engine/lib/types";

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

    logger.info("Register:", this.id, this.name(), this.section_name());

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

  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, Actor.__name);
    SimulationBoardManager.getInstance().save(packet);
    closeSaveMarker(packet, Actor.__name);
  }

  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    if (registry.actor === null) {
      openLoadMarker(packet, Actor.__name);
      SimulationBoardManager.getInstance().load(packet);
      closeLoadMarker(packet, Actor.__name);
    }
  }

  /**
   * Get full actor location.
   */
  public getGameLocation(): LuaMultiReturn<[XR_vector, TNumberId, TNumberId]> {
    return $multi(this.position, this.m_level_vertex_id, this.m_game_vertex_id);
  }

  /**
   * Get generic task.
   */
  public getAlifeSmartTerrainTask(): XR_CALifeSmartTerrainTask {
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

    const smartsByNoAssaultZones = {
      ["zat_a2_sr_no_assault"]: "zat_stalker_base_smart",
      ["jup_a6_sr_no_assault"]: "jup_a6",
      ["jup_b41_sr_no_assault"]: "jup_b41",
    } as unknown as LuaTable<TStringId, TStringId>;

    if (
      registry.smartTerrainNearest.distance < 50 &&
      !registry.simulationObjects.has(registry.smartTerrainNearest.id!)
    ) {
      return false;
    }

    for (const [zoneName, smartName] of smartsByNoAssaultZones) {
      const zone: XR_game_object = registry.zones.get(zoneName);

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

    const smartTerrain: SmartTerrain = alife().object<SmartTerrain>(registry.activeSmartTerrainId) as SmartTerrain;

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.status === ESmartTerrainStatus.NORMAL &&
      registry.zones.get(smartTerrain.smartTerrainActorControl.isNoWeaponZone).inside(this.position)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Whether actor can be selected as simulation target by squad.
   */
  public isValidSquadTarget(squad: Squad): boolean {
    const squadParameters: ISimulationActivityDescriptor = simulationActivities[squad.faction];

    return squadParameters !== null && squadParameters.actor !== null && squadParameters.actor.prec(squad, this);
  }

  /**
   * When squad already reached actor.
   */
  public onAfterReachedBySquad(squad: Squad): void {
    /**
     *  --squad.current_target_id = squad.smart_id
     */
  }

  /**
   * When squad reaches actor.
   */
  public onReachedBySquad(squad: Squad): void {
    squad.setLocationTypes();

    for (const squadMember of squad.squad_members()) {
      softResetOfflineObject(squadMember.id);
    }

    SimulationBoardManager.getInstance().assignSquadToSmartTerrain(squad, null);
  }
}
