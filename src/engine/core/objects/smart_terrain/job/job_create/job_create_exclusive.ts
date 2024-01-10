import { getFS, ini_file } from "xray16";

import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { jobPreconditionExclusive } from "@/engine/core/objects/smart_terrain/job/job_precondition";
import {
  EJobPathType,
  EJobType,
  JobPathTypeByScheme,
  TSmartTerrainJobsList,
} from "@/engine/core/objects/smart_terrain/job/job_types";
import { assert } from "@/engine/core/utils/assertion";
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
import { EScheme, IniFile, Optional, TCount, TIndex, TPath, TRate, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "job" });

/**
 * Create exclusive jobs defined for smart terrain.
 * Handles `exclusive` section in smart terrain ltx file config.
 *
 * @param smartTerrain - target smart terrain to create jobs for
 * @param jobs - list of jobs to insert new jobs into
 * @returns list of jobs where exclusive jobs are inserted
 */
export function createExclusiveJobs(smartTerrain: SmartTerrain, jobs: TSmartTerrainJobsList): TSmartTerrainJobsList {
  const smartTerrainIni: IniFile = smartTerrain.ini;

  // No smart terrain jobs configuration in spawn ini.
  if (!smartTerrainIni.section_exist("smart_terrain")) {
    return jobs;
  }

  if (smartTerrainIni.section_exist("exclusive")) {
    const exclusiveJobsCount: TCount = smartTerrainIni.line_count("exclusive");

    for (const i of $range(0, exclusiveJobsCount - 1)) {
      const [result, field, value] = smartTerrainIni.r_line("exclusive", i, "", "");

      createExclusiveJob(smartTerrainIni, "exclusive", field, jobs);
    }
  } else {
    let index: TIndex = 1;

    while (smartTerrainIni.line_exist("smart_terrain", `work${index}`)) {
      createExclusiveJob(smartTerrainIni, "smart_terrain", `work${index}`, jobs);
      index += 1;
    }
  }

  return jobs;
}

/**
 * Create exclusive job and insert it into jobs list.
 * Job configuration is based on ini file / section / field.
 *
 * @param ini - target ini file to read from
 * @param section - target section to read work details from
 * @param field - name of field to read job details from
 * @param jobs - list of jobs to insert new job into
 * @returns list of jobs where new job is inserted
 */
export function createExclusiveJob(
  ini: IniFile,
  section: TSection,
  field: TSection,
  jobs: TSmartTerrainJobsList
): TSmartTerrainJobsList {
  logger.info("Add exclusive job: '%s' - '%s'", section, field);

  const workScriptPath: Optional<TPath> = readIniString(ini, section, field, false);

  // Field with work path does not exist, nothing to load.
  if (workScriptPath === null) {
    return jobs;
  }

  const iniPath: TPath = "scripts\\" + workScriptPath;

  assert(getFS().exist(roots.gameConfig, iniPath), "There is no job configuration file '%s'.", iniPath);

  const jobIniFile: Optional<IniFile> = new ini_file(iniPath);
  const jobOnline: Optional<string> = readIniString(jobIniFile, "logic@" + field, "job_online", false);
  const jobPriority: TRate = readIniNumber(jobIniFile, "logic@" + field, "prior", false, 45);
  const jobSuitableCondlist: Optional<string> = readIniString(jobIniFile, "logic@" + field, "suitable", false);
  const isMonster: boolean = readIniBoolean(jobIniFile, "logic@" + field, "monster_job", false, false);
  const activeSection: TSection = readIniString(jobIniFile, "logic@" + field, "active", false);
  const scheme: Optional<EScheme> = getSchemeFromSection(activeSection) as EScheme;

  let pathType: Optional<EJobPathType> = (JobPathTypeByScheme[scheme] as EJobPathType) || null;

  if (scheme === EScheme.MOB_HOME && readIniBoolean(jobIniFile, activeSection, "gulag_point", false, false)) {
    pathType = EJobPathType.POINT;
  }

  // Add generic job placeholder if condlist is not defined, just combine ini parameters.
  if (jobSuitableCondlist === null) {
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
  }

  return jobs;
}
