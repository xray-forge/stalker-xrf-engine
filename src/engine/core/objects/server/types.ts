import { level, XR_CALifeSmartTerrainTask, XR_vector } from "xray16";

import { Actor, SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects";
import { SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { TNumberId } from "@/engine/lib/types";

/**
 * Simulation interaction object generic.
 */
export type TSimulationObject = Squad | SmartTerrain | Actor;

/**
 * Squad action type.
 */
export type TSquadAction = SquadStayOnTargetAction | SquadReachTargetAction;

/**
 * Generic simulation target.
 */
export interface ISimulationTarget {
  /**
   * Whether object can be selected as simulation target by squad.
   */
  target_precondition(squad: Squad): boolean;
  /**
   * Whether object is participating in simulation.
   */
  isSimulationAvailable(): boolean;
  /**
   * Get CObject for smart terrain task.
   */
  getAlifeSmartTerrainTask(): XR_CALifeSmartTerrainTask;
  /**
   * Get full object location.
   *
   * @returns position, levelVertexId, gameVertexId
   */
  get_location(): LuaMultiReturn<[XR_vector, TNumberId, TNumberId]>;
  /**
   * On target reached by squad.
   */
  on_reach_target(squad: Squad): void;
  /**
   * On target reached by squad, next action.
   */
  on_after_reach(squad: Squad): void;
  /**
   * Is object reached by squad.
   */
  am_i_reached(squad: Squad): boolean;
}
