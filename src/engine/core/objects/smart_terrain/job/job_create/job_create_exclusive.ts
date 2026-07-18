import { getFS, ini_file } from "xray16";
import { IniFile } from "xray16/alias";
import { assert, Nillable, TCount, TIndex, TPath, TRate, TSection } from "xray16/lib";
import { $filename, $isNil } from "xray16/macros";

import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { jobPreconditionExclusive } from "@/engine/core/objects/smart_terrain/job/job_precondition";
import {
  EJobPathType,
  EJobType,
  JobPathTypeByScheme,
  TSmartTerrainJobsList,
} from "@/engine/core/objects/smart_terrain/job/job_types";
import { EScheme } from "@/engine/core/schemes/types";
import {
  getSchemeFromSection,
  parseConditionsList,
  readIniBoolean,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { roots } from "@/engine/lib/constants/roots";

const logger: LuaLogger = new LuaLogger($filename, { file: "job" });

/**
 * Create exclusive jobs defined for smart terrain.
 * Handles `exclusive` section in smart terrain ltx file config.
 *
 * @param terrain - Target smart terrain to create jobs for.
 * @param jobs - List of jobs to insert new jobs into.
 * @returns List of jobs where exclusive jobs are inserted.
 */
export function createExclusiveJobs(terrain: SmartTerrain, jobs: TSmartTerrainJobsList): TSmartTerrainJobsList {
  const terrainIni: IniFile = terrain.ini;

  // No smart terrain jobs configuration in spawn ini.
  if (!terrainIni.section_exist("smart_terrain")) {
    return jobs;
  }

  if (terrainIni.section_exist("exclusive")) {
    const exclusiveJobsCount: TCount = terrainIni.line_count("exclusive");

    for (const i of $range(0, exclusiveJobsCount - 1)) {
      const [, field] = terrainIni.r_line("exclusive", i, "", "");

      createExclusiveJob(terrainIni, "exclusive", field, jobs);
    }
  } else {
    let index: TIndex = 1;

    while (terrainIni.line_exist("smart_terrain", `work${index}`)) {
      createExclusiveJob(terrainIni, "smart_terrain", `work${index}`, jobs);
      index += 1;
    }
  }

  return jobs;
}

/**
 * Create exclusive job and insert it into jobs list.
 * Job configuration is based on ini file / section / field.
 *
 * @param ini - Target ini file to read from.
 * @param section - Target section to read work details from.
 * @param field - Name of field to read job details from.
 * @param jobs - List of jobs to insert new job into.
 * @returns List of jobs where new job is inserted.
 */
export function createExclusiveJob(
  ini: IniFile,
  section: TSection,
  field: TSection,
  jobs: TSmartTerrainJobsList
): TSmartTerrainJobsList {
  logger.info("Add exclusive job: '%s' - '%s'", section, field);

  const workScriptPath: Nillable<TPath> = readIniString(ini, section, field, false);

  // Field with work path does not exist, nothing to load.
  if ($isNil(workScriptPath)) {
    return jobs;
  }

  const iniPath: TPath = "scripts\\" + workScriptPath;

  assert(getFS().exist(roots.gameConfig, iniPath), "There is no job configuration file '%s'.", iniPath);

  const jobIniFile: Nillable<IniFile> = new ini_file(iniPath);
  const jobOnline: Nillable<string> = readIniString(jobIniFile, "logic@" + field, "job_online", false);
  const jobPriority: TRate = readIniNumber(jobIniFile, "logic@" + field, "prior", false, 45);
  const jobSuitableCondlist: Nillable<string> = readIniString(jobIniFile, "logic@" + field, "suitable", false);
  const isMonster: boolean = readIniBoolean(jobIniFile, "logic@" + field, "monster_job", false, false);
  const activeSection: TSection = readIniString(jobIniFile, "logic@" + field, "active", false);
  const scheme: Nillable<EScheme> = getSchemeFromSection(activeSection) as EScheme;

  let pathType: Nillable<EJobPathType> = (JobPathTypeByScheme[scheme] as EJobPathType) || null;

  if (scheme === EScheme.MOB_HOME && readIniBoolean(jobIniFile, activeSection, "gulag_point", false, false)) {
    pathType = EJobPathType.POINT;
  }

  // Add generic job placeholder if condlist is not defined, just combine ini parameters.
  if ($isNil(jobSuitableCondlist)) {
    table.insert(jobs, {
      type: EJobType.EXCLUSIVE,
      priority: jobPriority,
      isMonsterJob: isMonster,
      section: "logic@" + field,
      iniPath: iniPath,
      online: jobOnline,
      iniFile: jobIniFile,
      pathType: pathType as EJobPathType,
    });
  } else {
    const conditionsList: TConditionList = parseConditionsList(jobSuitableCondlist);

    table.insert(jobs, {
      type: EJobType.EXCLUSIVE,
      priority: jobPriority,
      isMonsterJob: isMonster,
      section: "logic@" + field,
      iniPath: iniPath,
      iniFile: jobIniFile,
      online: jobOnline,
      pathType: pathType,
      preconditionParameters: { condlist: conditionsList },
      preconditionFunction: jobPreconditionExclusive,
    });

    // Reserve an unconditional fallback slot (priority -1) for the same section so the smart terrain still has
    // enough selectable jobs when the `suitable` condlist evaluates false.
    table.insert(jobs, {
      type: EJobType.EXCLUSIVE,
      priority: -1,
      isMonsterJob: isMonster,
      section: "logic@" + field,
      iniFile: jobIniFile,
      pathType: pathType,
    });
  }

  return jobs;
}
