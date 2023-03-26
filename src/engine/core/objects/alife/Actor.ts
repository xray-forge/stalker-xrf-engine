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
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { nearest_to_actor_smart, SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { ESmartTerrainStatus, getCurrentSmartId } from "@/engine/core/objects/alife/smart/SmartTerrainControl";
import { simulationActivities } from "@/engine/core/objects/alife/squad/simulation_activities";
import { Squad } from "@/engine/core/objects/alife/squad/Squad";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { ACTOR, TRUE } from "@/engine/lib/constants/words";
import { AnyObject, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class Actor extends cse_alife_creature_actor {
  public isSimulationAvailableConditionList: TConditionList = parseConditionsList(TRUE);
  public props!: AnyObject;

  protected readonly simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();

  /**
   * todo: Description.
   */
  public override on_register(): void {
    super.on_register();

    logger.info("Register:", this.id, this.name(), this.section_name());

    registerStoryLink(this.id, ACTOR);
    registerSimulationObject(this);

    this.simulationBoardManager.onNetworkRegister();
  }

  /**
   * todo: Description.
   */
  public override on_unregister(): void {
    super.on_unregister();

    logger.info("Unregister actor");

    unregisterStoryLinkByObjectId(this.id);
    unregisterSimulationObject(this);
  }

  /**
   * todo: Description.
   */
  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, Actor.__name);
    this.simulationBoardManager.save(packet);
    closeSaveMarker(packet, Actor.__name);
  }

  /**
   * todo: Description.
   */
  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    if (registry.actor === null) {
      openLoadMarker(packet, Actor.__name);
      this.simulationBoardManager.load(packet);
      closeLoadMarker(packet, Actor.__name);
    }
  }

  /**
   * todo: Description.
   */
  public get_location(): LuaMultiReturn<[XR_vector, number, number]> {
    return $multi(this.position, this.m_level_vertex_id, this.m_game_vertex_id);
  }

  /**
   * todo: Description.
   */
  public am_i_reached(): boolean {
    return !level.object_by_id(this.id)!.alive();
  }

  /**
   * todo: Description.
   */
  public on_after_reach(squad: any): void {
    /**
     *  --squad.current_target_id = squad.smart_id
     */
  }

  /**
   * todo: Description.
   */
  public on_reach_target(squad: Squad): void {
    squad.set_location_types();

    for (const squadMember of squad.squad_members()) {
      softResetOfflineObject(squadMember.id);
    }

    SimulationBoardManager.getInstance().assignSquadToSmartTerrain(squad, null);
  }

  /**
   * todo: Description.
   */
  public getAlifeSmartTerrainTask(): XR_CALifeSmartTerrainTask {
    return new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
  }

  /**
   * todo: Description.
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

    if (nearest_to_actor_smart.dist < 50 && !registry.simulationObjects.has(nearest_to_actor_smart.id!)) {
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

    if (getCurrentSmartId() === null) {
      return true;
    }

    const smartTerrain: SmartTerrain = alife().object<SmartTerrain>(getCurrentSmartId()!)!;

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.status === ESmartTerrainStatus.NORMAL &&
      registry.zones.get(smartTerrain.smartTerrainActorControl.noweap_zone).inside(this.position)
    ) {
      return false;
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public target_precondition(squad: Squad): boolean {
    const squadParameters = simulationActivities[squad.player_id];

    if (squadParameters === null || squadParameters.actor === null || !squadParameters.actor.prec(squad, this)) {
      return false;
    }

    return true;
  }
}
