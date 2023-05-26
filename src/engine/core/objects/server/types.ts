import { CALifeSmartTerrainTask, vector } from "xray16";

import type { Actor } from "@/engine/core/objects";
import type { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import type { Squad } from "@/engine/core/objects/server/squad/Squad";
import type { TConditionList } from "@/engine/core/utils/parse";
import type { TCommunity } from "@/engine/lib/constants/communities";
import type { AnyObject, Optional, PartialRecord, TName, TNumberId } from "@/engine/lib/types";

/**
 * Simulation interaction object generic.
 */
export type TSimulationObject = Squad | SmartTerrain | Actor;

/**
 * Type of smart terrain simulation role.
 */
export enum ESimulationTerrainRole {
  DEFAULT = "default",
  BASE = "base",
  SURGE = "surge",
  RESOURCE = "resource",
  TERRITORY = "territory",
  LAIR = "lair",
}

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
  getAlifeSmartTerrainTask(): CALifeSmartTerrainTask;
  /**
   * Get full object location.
   *
   * @returns position, levelVertexId, gameVertexId
   */
  getGameLocation(): LuaMultiReturn<[vector, TNumberId, TNumberId]>;
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
   * On target started being reached by squad.
   */
  onStartedBeingReachedBySquad(squad: Squad): void;
  /**
   * On target reached by squad, next action.
   */
  onEndedBeingReachedBySquad(squad: Squad): void;
}

/**
 * Generic squad action interface.
 */
export interface ISquadAction {
  /**
   * Action name.
   * Unique identifier of action type.
   */
  name: TName;
  /**
   * Initialize action.
   *
   * @param isUnderSimulation - is squad under simulation
   */
  initialize: (isUnderSimulation: boolean) => void;
  /**
   * Finalize and destroy everything related to the action.
   * Called when object drops action instance and finds something new.
   */
  finalize: () => void;
  /**
   * Perform generic update tick for action.
   *
   * @param isUnderSimulation - is squad under simulation
   * @returns whether action is finished
   */
  update: (isUnderSimulation: boolean) => boolean;
}

/**
 * Precondition object describing simulation target checker.
 */
export interface ISimulationActivityPrecondition {
  /**
   * Whether squad can select target.
   */
  canSelect: (squad: Squad, target: ISimulationTarget) => boolean;
}

/**
 * Generic faction activity description in terms of target selection.
 */
export interface ISimulationActivityDescriptor {
  squad: Optional<PartialRecord<TCommunity, Optional<ISimulationActivityPrecondition>>>;
  smart: Optional<PartialRecord<ESimulationTerrainRole, Optional<ISimulationActivityPrecondition>>>;
  actor: Optional<ISimulationActivityPrecondition>;
}
