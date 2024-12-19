import type { Actor } from "@/engine/core/objects/creature/Actor";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import type { TCommunity } from "@/engine/lib/constants/communities";
import type {
  ALifeSmartTerrainTask,
  Optional,
  PartialRecord,
  TCount,
  TName,
  TNumberId,
  TRate,
} from "@/engine/lib/types";

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
 * Simulation interaction object generic.
 */
export type TSimulationObject = Squad | SmartTerrain | Actor;

/**
 * Smart terrain details descriptor for alife participation.
 */
export interface ISmartTerrainDescriptor {
  terrain: SmartTerrain;
  assignedSquads: LuaTable<TNumberId, Squad>;
  assignedSquadsCount: TCount;
}

/**
 * Generic simulation target.
 * Used for building game logic with custom alife priorities and decisions.
 */
export interface ISimulationTarget {
  // Simulation properties of separate object entity.
  simulationProperties: LuaTable<TName, TRate>;

  /**
   * @returns whether object is participating in simulation
   */
  isSimulationAvailable(): boolean;
  /**
   * @returns whether object can be selected as simulation target by squad
   */
  isValidSimulationTarget(squad: Squad): boolean;
  /**
   * @returns whether object reached by squad
   */
  isReachedBySimulationObject(squad: Squad): boolean;
  /**
   * Get CObject for smart terrain task.
   */
  getSimulationTask(): ALifeSmartTerrainTask;
  /**
   * On target selected by simulation squad.
   * Means that some squad started reaching the object.
   */
  onSimulationTargetSelected(squad: Squad): void;
  /**
   * On deselection by simulation squad.
   * Means that current instance is not reached anymore.
   */
  onSimulationTargetDeselected(squad: Squad): void;
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

/**
 * Descriptor of possible simulation target to pick.
 */
export interface IAvailableSimulationTargetDescriptor {
  priority: TRate;
  target: TSimulationObject;
}
