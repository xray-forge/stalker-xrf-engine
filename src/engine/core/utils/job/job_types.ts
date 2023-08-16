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
  job_id: number;
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
  job_type: EJobType;
  online?: Optional<string>;
  ini_path?: TPath;
  ini_file?: IniFile;
}

/**
 * todo;
 */
export interface IJobDescriptor {
  priority: TRate;
  _precondition_is_monster?: Optional<boolean>;
  _precondition_params?: AnyObject;
  _precondition_function?: (
    this: void,
    serverObject: ServerHumanObject,
    smartTerrain: SmartTerrain,
    preconditionParameters: AnyObject,
    npc_info: AnyObject
  ) => boolean;
  npc_id?: Optional<TNumberId>;
  job_id?: TNumberId | IJobBase;
}

/**
 * todo;
 */
export interface IJobListDescriptor {
  _precondition_is_monster?: Optional<boolean>;
  priority: TRate;
  jobs: LuaArray<IJobDescriptor>;
}

/**
 * todo;
 */
export type TJobDescriptor = IJobListDescriptor | IJobDescriptor;
