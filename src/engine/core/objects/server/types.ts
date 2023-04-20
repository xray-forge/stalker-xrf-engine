import { XR_CALifeSmartTerrainTask, XR_vector } from "xray16";

import { Actor, SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects";
import { SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { TConditionList } from "@/engine/core/utils/parse";
import { AnyObject, TNumberId } from "@/engine/lib/types";

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
 * Used for building game logic with custom alife priorities and decisions.
 */
export interface ISimulationTarget {
  /**
   * Whether simulation is available, basic conditions list.
   */
  isSimulationAvailableConditionList: TConditionList;
  /**
   * Simulation properties of separate object entity.
   */
  simulationProperties: AnyObject;
  /**
   * Get CObject for smart terrain task.
   */
  getAlifeSmartTerrainTask(): XR_CALifeSmartTerrainTask;
  /**
   * Get full object location.
   *
   * @returns position, levelVertexId, gameVertexId
   */
  getGameLocation(): LuaMultiReturn<[XR_vector, TNumberId, TNumberId]>;
  /**
   * @returns whether object can be selected as simulation target by squad
   */
  isValidSquadTarget(squad: Squad): boolean;
  /**
   * @returns whether object is participating in simulation
   */
  isSimulationAvailable(): boolean;
  /**
   * @returns whether object reached by squad
   */
  isReachedBySquad(squad: Squad): boolean;
  /**
   * On target reached by squad.
   */
  onReachedBySquad(squad: Squad): void;
  /**
   * On target reached by squad, next action.
   */
  onAfterReachedBySquad(squad: Squad): void;
}
