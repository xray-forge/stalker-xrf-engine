import { SmartTerrain } from "@/engine/core/objects";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { EJobType, TName } from "@/engine/lib/types";

/**
 * Create list of default smart terrain jobs for monsters.
 * Usually it assigns monster home for some point.
 *
 * @param smartTerrain - tarrain to create jobs for
 * @returns jobs descriptor and ltx config text for matching jobs
 */
export function createMonsterJobs(smartTerrain: SmartTerrain): LuaMultiReturn<[IJobListDescriptor, string]> {
  const smartTerrainName: TName = smartTerrain.name();
  const monsterJobsDescriptor: IJobListDescriptor = {
    preconditionIsMonster: true,
    priority: logicsConfig.JOBS.MONSTER_JOB_PRIORITY,
    jobs: new LuaTable(),
  };

  let ltx: string = "";

  // ===================================================================================================================
  // = Mob home
  // ===================================================================================================================

  for (const it of $range(1, logicsConfig.JOBS.MOB_HOME.COUNT)) {
    const name: TName = `${smartTerrainName}_home_${it}`;

    table.insert(monsterJobsDescriptor.jobs, {
      priority: logicsConfig.JOBS.MOB_HOME.PRIORITY,
      jobId: {
        section: `logic@${name}`,
        jobType: EJobType.POINT_JOB,
      },
    });

    ltx +=
      `[logic@${name}]\n` +
      `active = mob_home@${name}\n` +
      `[mob_home@${name}]\n` +
      "gulag_point = true\n" +
      `home_min_radius = ${logicsConfig.JOBS.MOB_HOME.MIN_RADIUS}\n` +
      `home_mid_radius = ${logicsConfig.JOBS.MOB_HOME.MID_RADIUS}\n` +
      `home_max_radius = ${logicsConfig.JOBS.MOB_HOME.MAX_RADIUS}\n`;

    if (smartTerrain.defendRestrictor !== null) {
      ltx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }
  }

  return $multi(monsterJobsDescriptor, ltx);
}
