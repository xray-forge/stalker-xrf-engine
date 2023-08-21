import { CALifeSmartTerrainTask, game_graph, level } from "xray16";

import { loadDynamicIni } from "@/engine/core/database/ini";
import { registry } from "@/engine/core/database/registry";
import type { SmartCover, SmartTerrain } from "@/engine/core/objects";
import { abort } from "@/engine/core/utils/assertion";
import { createExclusiveJobs } from "@/engine/core/utils/job/job_create/job_create_exclusive";
import { createMonsterJobs } from "@/engine/core/utils/job/job_create/job_create_monster";
import { createStalkerJobs } from "@/engine/core/utils/job/job_create/job_create_stalker";
import {
  EJobPathType,
  ISmartTerrainJobDescriptor,
  PATH_FIELDS,
  TSmartTerrainJobsList,
} from "@/engine/core/utils/job/job_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { StringBuilder } from "@/engine/core/utils/string";
import { IniFile, Optional, TName, TNumberId, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Create jobs for smart terrain.
 * Generate jobs for stalkers and monsters based on available configuration and data.
 *
 * Following types are created:
 * - Monster jobs
 * - Stalker jobs
 * - Exclusive jobs
 *
 * @param smartTerrain - smart terrain to generate for
 * @returns array of job descriptors and ltx configuration text
 */
export function createSmartTerrainJobs(
  smartTerrain: SmartTerrain
): LuaMultiReturn<[TSmartTerrainJobsList, IniFile, TName]> {
  // logger.info("Create jobs for smart terrain:", smartTerrain.name());

  const builder: StringBuilder = new StringBuilder();
  const jobs: TSmartTerrainJobsList = new LuaTable();

  // Exclusive jobs for smart terrain.
  createExclusiveJobs(smartTerrain, jobs);

  // Stalkers part.
  createStalkerJobs(smartTerrain, jobs, builder);

  // Monsters part.
  createMonsterJobs(smartTerrain, jobs, builder);

  const [jobsConfig, jobsConfigName] = loadDynamicIni(smartTerrain.name(), builder.build());

  for (const [, job] of jobs) {
    const section: TSection = job.section;
    const ltx: IniFile = job.iniFile || jobsConfig;

    if (!ltx.line_exist(section, "active")) {
      abort("Smart terrain '%s', ltx='%s' no 'active' section %s", smartTerrain.name(), jobsConfigName, section);
    }

    const activeSection: TSection = ltx.r_string(section, "active");

    switch (job.pathType) {
      case EJobPathType.PATH: {
        let pathField: string = "";

        for (const [, possiblePathField] of PATH_FIELDS) {
          if (ltx.line_exist(activeSection, possiblePathField)) {
            pathField = possiblePathField;
            break;
          }
        }

        let pathName: TName = string.format("%s_%s", smartTerrain.name(), ltx.r_string(activeSection, pathField));

        // todo: enum.
        if (pathField === "center_point") {
          if (level.patrol_path_exists(string.format("%s_task", pathName))) {
            pathName = string.format("%s_task", pathName);
          }
        }

        job.alifeTask = new CALifeSmartTerrainTask(pathName);

        break;
      }

      case EJobPathType.SMART_COVER: {
        const smartCoverName: TName = ltx.r_string(activeSection, "cover_name");
        const smartCover: Optional<SmartCover> = registry.smartCovers.get(smartCoverName);

        if (!smartCover) {
          abort(
            "There is an exclusive job with wrong smart cover name '%s' in smart terrain '%s'.",
            tostring(smartCoverName),
            smartTerrain.name()
          );
        }

        job.alifeTask = new CALifeSmartTerrainTask(smartCover.m_game_vertex_id, smartCover.m_level_vertex_id);

        break;
      }

      case EJobPathType.POINT: {
        job.alifeTask = smartTerrain.smartTerrainAlifeTask as CALifeSmartTerrainTask;

        break;
      }
    }

    job.gameVertexId = job.alifeTask.game_vertex_id();
    job.levelId = game_graph().vertex(job.gameVertexId).level_id();
    job.position = job.alifeTask.position();
  }

  // Sort tasks by priority.
  table.sort(jobs, (a: ISmartTerrainJobDescriptor, b: ISmartTerrainJobDescriptor) => a.priority > b.priority);

  // Create matching IDs links.
  let id: TNumberId = 1;

  for (const [, jobDescriptor] of jobs) {
    jobDescriptor.id = id;
    id += 1;
  }

  return $multi(jobs, jobsConfig, jobsConfigName);
}
