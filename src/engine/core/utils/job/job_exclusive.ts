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
import { IJobDescriptor, TJobDescriptor } from "@/engine/core/utils/job/job_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { roots } from "@/engine/lib/constants/roots";
import { FALSE } from "@/engine/lib/constants/words";
import {
  AnyObject,
  EJobType,
  EScheme,
  IniFile,
  JobTypeByScheme,
  LuaArray,
  Optional,
  ServerHumanObject,
  TCount,
  TIndex,
  TName,
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
export function loadExclusiveJobs(smartTerrain: SmartTerrain, jobsList: LuaArray<TJobDescriptor>): void {
  const smartTerrainIni: IniFile = smartTerrain.ini;

  if (smartTerrainIni.section_exist("smart_terrain")) {
    logger.info("Exclusive jobs load:", smartTerrain.name());

    if (smartTerrainIni.section_exist("exclusive")) {
      const exclusiveJobsCount: TCount = smartTerrainIni.line_count("exclusive");

      for (const i of $range(0, exclusiveJobsCount - 1)) {
        const [result, id, value] = smartTerrainIni.r_line("exclusive", i, "", "");

        loadExclusiveJob(smartTerrainIni, "exclusive", id, jobsList);
      }
    } else {
      let index: TIndex = 1;

      while (smartTerrainIni.line_exist("smart_terrain", "work" + index)) {
        loadExclusiveJob(smartTerrainIni, "smart_terrain", "work" + index, jobsList);
        index += 1;
      }
    }
  }
}

/**
 * Add jobs unique to terrain instance.
 */
export function loadExclusiveJob(
  ini: IniFile,
  section: TSection,
  field: TSection,
  jobsList: LuaArray<TJobDescriptor>
): void {
  const workScriptPath: Optional<TPath> = readIniString(ini, section, field, false, "", null);

  // Field with work path does not exist, nothing to load.
  if (workScriptPath === null) {
    return;
  }

  const iniPath: TPath = "scripts\\" + workScriptPath;

  assert(getFS().exist(roots.gameConfig, iniPath), "There is no job configuration file '%s'.", iniPath);

  const jobIniFile: Optional<IniFile> = new ini_file(iniPath);
  const jobOnline: Optional<string> = readIniString(jobIniFile, "logic@" + field, "job_online", false, "", null);
  const newPrior: TRate = readIniNumber(jobIniFile, "logic@" + field, "prior", false, 45);
  const jobSuitableCondlist: Optional<string> = readIniString(jobIniFile, "logic@" + field, "suitable", false, "");
  const isMonster: boolean = readIniBoolean(jobIniFile, "logic@" + field, "monster_job", false, false);
  const activeSection: TSection = readIniString(jobIniFile, "logic@" + field, "active", false, "");
  const scheme: Optional<EScheme> = getSchemeFromSection(activeSection) as EScheme;

  let jobType: Optional<EJobType> = (JobTypeByScheme[scheme] as EJobType) || null;

  if (scheme === EScheme.MOB_HOME && readIniBoolean(jobIniFile, activeSection, "gulag_point", false, false)) {
    jobType = EJobType.POINT_JOB;
  }

  // Add generic job placeholder if condlist is not defined, just combine ini parameters.
  if (jobSuitableCondlist === null) {
    const jobDescriptor: IJobDescriptor = {
      priority: newPrior,
      _precondition_is_monster: isMonster,
      job_id: {
        section: "logic@" + field,
        ini_path: iniPath,
        online: jobOnline,
        ini_file: jobIniFile,
        job_type: jobType as TName,
      },
    };

    table.insert(jobsList, jobDescriptor);
  } else {
    const conditionsList: TConditionList = parseConditionsList(jobSuitableCondlist);

    table.insert(jobsList, {
      priority: newPrior,
      _precondition_is_monster: isMonster,
      job_id: {
        section: "logic@" + field,
        ini_path: iniPath,
        ini_file: jobIniFile,
        online: jobOnline,
        job_type: jobType,
      },
      _precondition_params: { condlist: conditionsList },
      _precondition_function: (
        serverObject: ServerHumanObject,
        smartTerrain: SmartTerrain,
        precondParams: AnyObject
      ): boolean => {
        const result: Optional<string> = pickSectionFromCondList(registry.actor, serverObject, precondParams.condlist);

        return result !== FALSE && result !== null;
      },
    });

    // todo: Why is it needed with -1?
    table.insert(jobsList, {
      priority: -1,
      _precondition_is_monster: isMonster,
      job_id: {
        section: "logic@" + field,
        ini_file: jobIniFile,
        job_type: jobType,
      },
    });
  }
}
