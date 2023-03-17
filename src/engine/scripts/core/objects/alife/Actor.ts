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

import { AnyObject, Optional, TRate, TStringId } from "@/engine/lib/types";
import {
  registerStoryLink,
  registry,
  softResetOfflineObject,
  unregisterStoryLinkByObjectId,
} from "@/engine/scripts/core/database";
import { SimulationBoardManager } from "@/engine/scripts/core/database/SimulationBoardManager";
import { evaluate_prior, getSimulationObjectsRegistry } from "@/engine/scripts/core/database/SimulationObjectsRegistry";
import { simulation_activities } from "@/engine/scripts/core/objects/alife/SimulationActivity";
import { nearest_to_actor_smart, SmartTerrain } from "@/engine/scripts/core/objects/alife/smart/SmartTerrain";
import { ESmartTerrainStatus, getCurrentSmartId } from "@/engine/scripts/core/objects/alife/smart/SmartTerrainControl";
import { Squad } from "@/engine/scripts/core/objects/alife/Squad";
import { setLoadMarker, setSaveMarker } from "@/engine/scripts/utils/game_save";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class Actor extends cse_alife_creature_actor {
  public isRegistered: boolean = false;
  public isStartPositionsFilling: boolean = false;
  public sim_avail: Optional<boolean> = null;
  public props!: AnyObject;

  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();

    logger.info("Register:", this.id, this.name(), this.section_name());

    registerStoryLink(this.id, "actor");
    getSimulationObjectsRegistry().register(this);

    this.isRegistered = true;

    if (!this.isStartPositionsFilling) {
      SimulationBoardManager.getInstance().fill_start_position();
      this.isStartPositionsFilling = true;
    }
  }

  /**
   * todo;
   */
  public override on_unregister(): void {
    logger.info("Unregister actor");

    super.on_unregister();
    unregisterStoryLinkByObjectId(this.id);
    getSimulationObjectsRegistry().unregister(this);
  }

  /**
   * todo;
   */
  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

    setSaveMarker(packet, false, Actor.__name);
    packet.w_bool(this.isStartPositionsFilling);
    setSaveMarker(packet, true, Actor.__name);
  }

  /**
   * todo;
   */
  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    if (registry.actor === null) {
      setLoadMarker(packet, false, Actor.__name);
      this.isStartPositionsFilling = packet.r_bool();
      setLoadMarker(packet, true, Actor.__name);
    }
  }

  /**
   * todo;
   */
  public get_location(): LuaMultiReturn<[XR_vector, number, number]> {
    return $multi(this.position, this.m_level_vertex_id, this.m_game_vertex_id);
  }

  /**
   * todo;
   */
  public am_i_reached(): boolean {
    return !level.object_by_id(this.id)!.alive();
  }

  /**
   * todo;
   */
  public on_after_reach(squad: any): void {
    /**
     *  --squad.current_target_id = squad.smart_id
     */
  }

  /**
   * todo;
   */
  public on_reach_target(squad: Squad): void {
    squad.set_location_types();

    for (const squadMember of squad.squad_members()) {
      softResetOfflineObject(squadMember.id);
    }

    SimulationBoardManager.getInstance().assign_squad_to_smart(squad, null);
  }

  /**
   * todo;
   */
  public get_alife_task(): XR_CALifeSmartTerrainTask {
    return new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
  }

  /**
   * todo;
   */
  public sim_available(): boolean {
    const smarts_by_no_assault_zones = {
      ["zat_a2_sr_no_assault"]: "zat_stalker_base_smart",
      ["jup_a6_sr_no_assault"]: "jup_a6",
      ["jup_b41_sr_no_assault"]: "jup_b41",
    } as unknown as LuaTable<TStringId, TStringId>;

    if (nearest_to_actor_smart.dist < 50 && !getSimulationObjectsRegistry().objects.has(nearest_to_actor_smart.id!)) {
      return false;
    }

    for (const [k, v] of smarts_by_no_assault_zones) {
      const zone = registry.zones.get(k);

      if (zone !== null && zone.inside(this.position)) {
        const smart = SimulationBoardManager.getInstance().get_smart_by_name(v);

        if (smart !== null && smart.base_on_actor_control.status !== ESmartTerrainStatus.ALARM) {
          return false;
        }
      }
    }

    if (getCurrentSmartId() === null) {
      return true;
    }

    const smartTerrain: SmartTerrain = alife().object<SmartTerrain>(getCurrentSmartId()!)!;

    if (
      smartTerrain.base_on_actor_control !== null &&
      smartTerrain.base_on_actor_control.status === ESmartTerrainStatus.NORMAL &&
      registry.zones.get(smartTerrain.base_on_actor_control.noweap_zone).inside(this.position)
    ) {
      return false;
    }

    return true;
  }

  /**
   * todo;
   */
  public target_precondition(squad: Squad): boolean {
    const squad_params = simulation_activities[squad.player_id];

    if (squad_params === null || squad_params.actor === null || !squad_params.actor.prec(squad, this)) {
      return false;
    }

    return true;
  }

  /**
   * todo;
   */
  public evaluate_prior(squad: Squad): TRate {
    return evaluate_prior(this, squad);
  }
}
