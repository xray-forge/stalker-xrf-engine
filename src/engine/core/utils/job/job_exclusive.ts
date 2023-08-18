import { getFS, ini_file } from "xray16";

import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects";
import { assert } from "@/engine/core/utils/assertion";
import {
  getSchemeFromSection,
  parseConditionsList,
  pickSectionFromCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { jobPreconditionExclusive } from "@/engine/core/utils/job/job_precondition";
import {
  EJobPathType,
  EJobType,
  ISmartTerrainJobDescriptor,
  JobPathTypeByScheme,
} from "@/engine/core/utils/job/job_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { roots } from "@/engine/lib/constants/roots";
import { FALSE } from "@/engine/lib/constants/words";
import {
  AnyObject,
  EScheme,
  IniFile,
  LuaArray,
  Optional,
  ServerCreatureObject,
  ServerHumanObject,
  TCount,
  TIndex,
  TPath,
  TRate,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 *
 * @param smartTerrain
 * @param jobsList
 */
export function createExclusiveJobs(smartTerrain: SmartTerrain, jobsList: LuaArray<ISmartTerrainJobDescriptor>): void {
  const smartTerrainIni: IniFile = smartTerrain.ini;

  // No smart terrain jobs configuration in spawn ini.
  if (!smartTerrainIni.section_exist("smart_terrain")) {
    return;
  }

  if (smartTerrainIni.section_exist("exclusive")) {
    const exclusiveJobsCount: TCount = smartTerrainIni.line_count("exclusive");

    for (const i of $range(0, exclusiveJobsCount - 1)) {
      const [result, field, value] = smartTerrainIni.r_line("exclusive", i, "", "");

      createExclusiveJob(smartTerrainIni, "exclusive", field, jobsList);
    }
  } else {
    let index: TIndex = 1;

    while (smartTerrainIni.line_exist("smart_terrain", `work${index}`)) {
      createExclusiveJob(smartTerrainIni, "smart_terrain", `work${index}`, jobsList);
      index += 1;
    }
  }
}

/**
 * Add jobs unique to terrain instance.
 */
export function createExclusiveJob(
  ini: IniFile,
  section: TSection,
  field: TSection,
  jobsList: LuaArray<ISmartTerrainJobDescriptor>
): LuaArray<ISmartTerrainJobDescriptor> {
  // logger.format("Add exclusive job':  %s - %s", section, field);

  const workScriptPath: Optional<TPath> = readIniString(ini, section, field, false, "", null);

  // Field with work path does not exist, nothing to load.
  if (workScriptPath === null) {
    return jobsList;
  }

  const iniPath: TPath = "scripts\\" + workScriptPath;

  assert(getFS().exist(roots.gameConfig, iniPath), "There is no job configuration file '%s'.", iniPath);

  const jobIniFile: Optional<IniFile> = new ini_file(iniPath);
  const jobOnline: Optional<string> = readIniString(jobIniFile, "logic@" + field, "job_online", false, "", null);
  const jobPriority: TRate = readIniNumber(jobIniFile, "logic@" + field, "prior", false, 45);
  const jobSuitableCondlist: Optional<string> = readIniString(jobIniFile, "logic@" + field, "suitable", false, "");
  const isMonster: boolean = readIniBoolean(jobIniFile, "logic@" + field, "monster_job", false, false);
  const activeSection: TSection = readIniString(jobIniFile, "logic@" + field, "active", false, "");
  const scheme: Optional<EScheme> = getSchemeFromSection(activeSection) as EScheme;

  let pathType: Optional<EJobPathType> = (JobPathTypeByScheme[scheme] as EJobPathType) || null;

  if (scheme === EScheme.MOB_HOME && readIniBoolean(jobIniFile, activeSection, "gulag_point", false, false)) {
    pathType = EJobPathType.POINT;
  }

  // Add generic job placeholder if condlist is not defined, just combine ini parameters.
  if (jobSuitableCondlist === null) {
    table.insert(jobsList, {
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

    table.insert(jobsList, {
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

  return jobsList;
}
