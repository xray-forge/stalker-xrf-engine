import type { Actor } from "@/engine/core/objects/creature/Actor";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { TConditionList } from "@/engine/core/utils/ini";
import { TCommunity } from "@/engine/lib/constants/communities";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import {
  ALifeSmartTerrainTask,
  AnyObject,
  Optional,
  PartialRecord,
  TCount,
  TName,
  TNumberId,
} from "@/engine/lib/types";

/**
 * Smart terrain details descriptor for alife participation.
 */
export interface ISmartTerrainDescriptor {
  smartTerrain: SmartTerrain;
  assignedSquads: LuaTable<TNumberId, Squad>;
  stayingSquadsCount: TCount;
}

/**
 * Descriptor of faction participating in alife.
 */
export interface ISimulationFactionDescriptor {
  id: TNumberId;
  name: TCommunity;
  isCommunity: boolean;
}

/**
 * todo: Remove / use strings / solve it
 */
export const groupIdByLevelName: LuaTable<TLevel, TNumberId> = $fromObject({
  [levels.zaton]: 1,
  [levels.pripyat]: 2,
  [levels.jupiter]: 3,
  [levels.labx8]: 4,
  [levels.jupiter_underground]: 5,
});

/**
 * Simulation interaction object generic.
 */
export type TSimulationObject = Squad | SmartTerrain | Actor;

/**
 * Type of smart terrain simulation role.
 */
export enum ESimulationRole {
  ACTOR = "actor",
  SQUAD = "squad",
  SMART_TERRAIN = "smart",
}

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
 * todo;
 */
export const VALID_SMART_TERRAINS_SIMULATION_ROLES: LuaTable<TName, boolean> = $fromObject<TName, boolean>({
  [ESimulationTerrainRole.DEFAULT]: true,
  [ESimulationTerrainRole.BASE]: true,
  [ESimulationTerrainRole.SURGE]: true,
  [ESimulationTerrainRole.RESOURCE]: true,
  [ESimulationTerrainRole.TERRITORY]: true,
  [ESimulationTerrainRole.LAIR]: true,
});

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
  getAlifeSmartTerrainTask(): ALifeSmartTerrainTask;
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
  isSquadArrived(squad: Squad): boolean;
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
 * Whether squad can select target.
 */
export type TSimulationActivityPrecondition = (this: void, squad: Squad, target: ISimulationTarget) => boolean;

/**
 * Generic faction activity description in terms of target selection.
 */
export interface ISimulationActivityDescriptor {
  squad: Optional<PartialRecord<TCommunity, Optional<TSimulationActivityPrecondition>>>;
  smart: Optional<PartialRecord<ESimulationTerrainRole, Optional<TSimulationActivityPrecondition>>>;
  actor: Optional<TSimulationActivityPrecondition>;
}
