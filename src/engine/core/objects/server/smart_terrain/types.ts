import {
  CALifeSmartTerrainTask,
  cse_alife_creature_abstract,
  cse_alife_human_abstract,
  ini_file,
  vector,
} from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import {
  AnyObject,
  ESchemeType,
  LuaArray,
  Optional,
  TName,
  TNumberId,
  TPath,
  TRate,
  TSection,
} from "@/engine/lib/types";

/**
 * Smart terrain active status.
 */
export enum ESmartTerrainStatus {
  NORMAL = 0,
  DANGER,
  ALARM,
}

/**
 * todo;
 */
export interface IObjectJobDescriptor {
  isMonster: boolean;
  serverObject: cse_alife_creature_abstract;
  need_job: string;
  job_prior: number;
  job_id: number;
  job_link: Optional<{ npc_id: Optional<TNumberId>; job_id: TNumberId; priority: TRate }>;
  begin_job: boolean;
  schemeType: ESchemeType;
}

/**
 * todo;
 */
export interface ISmartTerrainJob extends IJobBase {
  alife_task: CALifeSmartTerrainTask;
  priority: TRate;
  reserve_job: Optional<boolean>;
  prefix_name: TName;
  game_vertex_id: TNumberId;
  level_id: TNumberId;
  position: vector;
}

/**
 * todo;
 */
export interface IJobBase {
  section: TSection;
  job_type: string;
  online?: Optional<string>;
  ini_path?: TPath;
  ini_file?: ini_file;
}

/**
 * todo;
 */
export interface IJobDescriptor {
  priority: TRate;
  _precondition_is_monster?: Optional<boolean>;
  _precondition_params?: AnyObject;
  _precondition_function?: (
    serverObject: cse_alife_human_abstract,
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
  jobs: LuaArray<IJobListDescriptor | IJobDescriptor>;
}

/**
 * todo;
 */
export type TJobDescriptor = IJobListDescriptor | IJobDescriptor;
