import type { SmartTerrain } from "@/engine/core/objects";
import type {
  ALifeSmartTerrainTask,
  AnyObject,
  EJobType,
  ESchemeType,
  IniFile,
  LuaArray,
  Optional,
  ServerCreatureObject,
  ServerHumanObject,
  TNumberId,
  TPath,
  TRate,
  TSection,
  Vector,
} from "@/engine/lib/types";

/**
 * Descriptor of game object job in smart.
 * Contains information about object job state / progress.
 */
export interface IObjectJobDescriptor {
  isMonster: boolean;
  serverObject: ServerCreatureObject;
  desiredJob: TSection; // Section with needed job?
  jobPriority: TRate;
  jobId: TNumberId;
  jobLink: Optional<IJobDescriptor>;
  jobBegun: boolean;
  schemeType: ESchemeType;
}

/**
 * todo;
 */
export interface ISmartTerrainJob extends IJobBase {
  alifeTask: ALifeSmartTerrainTask;
  priority: TRate;
  gameVertexId: TNumberId;
  levelId: TNumberId;
  position: Vector;
}

/**
 * todo;
 */
export interface IJobBase {
  section: TSection;
  jobType: EJobType;
  online?: Optional<string>;
  iniPath?: TPath;
  iniFile?: IniFile;
}

/**
 * todo;
 */
export interface IJobDescriptor {
  priority: TRate;
  preconditionIsMonster?: Optional<boolean>;
  preconditionParameters?: AnyObject;
  preconditionFunction?: (
    this: void,
    serverObject: ServerHumanObject,
    smartTerrain: SmartTerrain,
    preconditionParameters: AnyObject,
    objectInfo: AnyObject
  ) => boolean;
  npc_id?: Optional<TNumberId>;
  jobId?: TNumberId | IJobBase;
}

/**
 * todo;
 */
export interface IJobListDescriptor {
  preconditionIsMonster?: Optional<boolean>;
  priority: TRate;
  jobs: LuaArray<IJobDescriptor>;
}

/**
 * todo;
 */
export type TJobDescriptor = IJobListDescriptor | IJobDescriptor;
