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
  TName,
  TNumberId,
  TPath,
  TRate,
  TSection,
  Vector,
} from "@/engine/lib/types";

/**
 * todo;
 */
export interface IObjectJobDescriptor {
  isMonster: boolean;
  serverObject: ServerCreatureObject;
  need_job: string; // Section with needed job?
  job_prior: number;
  jobId: number;
  job_link: Optional<IJobDescriptor>;
  begin_job: boolean;
  schemeType: ESchemeType;
}

/**
 * todo;
 */
export interface ISmartTerrainJob extends IJobBase {
  alife_task: ALifeSmartTerrainTask;
  priority: TRate;
  reserve_job: Optional<boolean>;
  prefix_name: Optional<TName>;
  game_vertex_id: TNumberId;
  level_id: TNumberId;
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
