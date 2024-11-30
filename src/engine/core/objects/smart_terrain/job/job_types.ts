import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import {
  ALifeSmartTerrainTask,
  AnyObject,
  EScheme,
  ESchemeType,
  IniFile,
  LuaArray,
  Optional,
  PartialRecord,
  ServerCreatureObject,
  TNumberId,
  TPath,
  TRate,
  TSection,
  Vector,
} from "@/engine/lib/types";

/**
 * todo;
 */
export const PATH_FIELDS: LuaArray<string> = $fromArray(["path_walk", "path_main", "path_home", "center_point"]);

/**
 * Enumeration describing smart terrains jobs.
 */
export enum EJobPathType {
  PATH = 1,
  POINT = 2,
  SMART_COVER = 3,
}

/**
 * Enumeration describing smart terrains jobs.
 */
export enum EJobType {
  EXCLUSIVE = 1,
  MONSTER_HOME,
  ANIMPOINT,
  CAMPER,
  COLLECTOR,
  GUARD,
  GUARD_FOLLOWER,
  PATROL,
  POINT,
  SLEEP,
  SNIPER,
  SURGE,
  WALKER,
}

/**
 * Map describing job types for default logics schemes.
 */
export const JobPathTypeByScheme: PartialRecord<EScheme, EJobPathType> = {
  [EScheme.WALKER]: EJobPathType.PATH,
  [EScheme.CAMPER]: EJobPathType.PATH,
  [EScheme.PATROL]: EJobPathType.PATH,
  [EScheme.ANIMPOINT]: EJobPathType.SMART_COVER,
  [EScheme.SMARTCOVER]: EJobPathType.SMART_COVER,
  [EScheme.REMARK]: EJobPathType.POINT,
  [EScheme.COVER]: EJobPathType.POINT,
  [EScheme.SLEEPER]: EJobPathType.PATH,
  [EScheme.MOB_WALKER]: EJobPathType.PATH,
  [EScheme.MOB_HOME]: EJobPathType.PATH,
  [EScheme.MOB_JUMP]: EJobPathType.POINT,
  [EScheme.COMPANION]: EJobPathType.POINT,
} as const;

/**
 * Descriptor of game object job in smart.
 * Contains information about object job state / progress.
 */
export interface IObjectJobState {
  isMonster: boolean;
  object: ServerCreatureObject;
  desiredJob: TSection; // Section with needed job?
  jobPriority: TRate;
  jobId: TNumberId;
  job: Optional<ISmartTerrainJobDescriptor>;
  // Whether job is begun and logics for object schemes is set.
  isBegun: boolean;
  schemeType: ESchemeType;
}

/**
 * Descriptor of smart terrain job available for objects.
 */
export interface ISmartTerrainJobDescriptor {
  iniPath?: TPath; // Used by exclusive jobs.
  iniFile?: IniFile; // Used by exclusive jobs.
  isMonsterJob?: Optional<boolean>;
  id?: TNumberId;
  section: TSection;
  priority: TRate;
  type: EJobType;
  pathType: EJobPathType;
  // Currently working object ID.
  objectId?: Optional<TNumberId>;
  alifeTask?: ALifeSmartTerrainTask;
  gameVertexId?: TNumberId;
  levelId?: TNumberId;
  position?: Vector;
  online?: Optional<string>;
  // Execution preconditions.
  preconditionParameters?: AnyObject;
  preconditionFunction?: (
    this: void,
    object: ServerCreatureObject,
    terrain: SmartTerrain,
    preconditionParameters: AnyObject,
    objectJobDescriptor: IObjectJobState
  ) => boolean;
}

/**
 * List of smart terrain jobs.
 * Use in many places, so alias can be simpler.
 */
export type TSmartTerrainJobsList = LuaArray<ISmartTerrainJobDescriptor>;

/**
 * List of object jobs.
 * Use in many places, so alias can be simpler.
 */
export type TObjectJobsList = LuaArray<IObjectJobState>;
