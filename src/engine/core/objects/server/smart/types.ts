import { XR_CALifeSmartTerrainTask, XR_cse_alife_creature_abstract, XR_ini_file, XR_vector } from "xray16";

import { Optional, TName, TNumberId, TPath, TRate, TSection } from "@/engine/lib/types";

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
export enum ESimulationSmartType {
  DEFAULT = "default",
  BASE = "base",
  resource = "resource",
  territory = "territory",
}

/**
 * todo;
 */
export interface IObjectJobDescriptor {
  se_obj: XR_cse_alife_creature_abstract;
  is_monster: boolean;
  need_job: string;
  job_prior: number;
  job_id: number;
  job_link: Optional<{ npc_id: Optional<TNumberId>; job_id: TNumberId; _prior: TRate }>;
  begin_job: boolean;
  stype: any;
}

/**
 * todo;
 */
export interface ISmartTerrainJob {
  alife_task: XR_CALifeSmartTerrainTask;
  _prior: TRate;
  job_type: string;
  reserve_job: Optional<boolean>;
  section: TSection;
  ini_path: TPath;
  ini_file: XR_ini_file;
  prefix_name: TName;
  game_vertex_id: TNumberId;
  level_id: TNumberId;
  position: XR_vector;
}