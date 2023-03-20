import {
  alife,
  CALifeSmartTerrainTask,
  cse_alife_creature_actor,
  level,
  LuabindClass,
  XR_CALifeSmartTerrainTask,
  XR_net_packet,
  XR_vector,
} from "xray16";

import {
  registerStoryLink,
  registry,
  softResetOfflineObject,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { registerSimulationObject, unregisterSimulationObject } from "@/engine/core/database/simulation";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { simulation_activities } from "@/engine/core/objects/alife/SimulationActivity";
import { nearest_to_actor_smart, SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { ESmartTerrainStatus, getCurrentSmartId } from "@/engine/core/objects/alife/smart/SmartTerrainControl";
import { Squad } from "@/engine/core/objects/alife/Squad";
import { setLoadMarker, setSaveMarker } from "@/engine/core/utils/game_save";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { ACTOR, STRINGIFIED_TRUE } from "@/engine/lib/constants/words";
import { AnyObject, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class Actor extends cse_alife_creature_actor {
  public isSimulationAvailableConditionList: TConditionList = parseConditionsList(STRINGIFIED_TRUE);
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

    setSaveMarker(packet, false, Actor.__name);
    this.simulationBoardManager.save(packet);
    setSaveMarker(packet, true, Actor.__name);
  }

  /**
   * todo: Description.
   */
  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    if (registry.actor === null) {
      setLoadMarker(packet, false, Actor.__name);
      this.simulationBoardManager.load(packet);
      setLoadMarker(packet, true, Actor.__name);
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
    if (pickSectionFromCondList(registry.actor, this, this.isSimulationAvailableConditionList) !== STRINGIFIED_TRUE) {
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

    for (const [k, v] of smartsByNoAssaultZones) {
      const zone = registry.zones.get(k);

      if (zone !== null && zone.inside(this.position)) {
        const smart = SimulationBoardManager.getInstance().getSmartTerrainByName(v);

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
    const squad_params = simulation_activities[squad.player_id];

    if (squad_params === null || squad_params.actor === null || !squad_params.actor.prec(squad, this)) {
      return false;
    }

    return true;
  }
}
