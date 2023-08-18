import { SmartTerrain } from "@/engine/core/objects";
import { EJobPathType, EJobType, ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { LuaArray, TName } from "@/engine/lib/types";

/**
 * Create list of default smart terrain jobs for monsters.
 * Usually it assigns monster home for some point.
 *
 * @param smartTerrain - terrain to create jobs for
 * @param jobsList - list of jobs to insert into
 * @returns jobs descriptor and ltx config text for matching jobs
 */
export function createMonsterJobs(
  smartTerrain: SmartTerrain,
  jobsList: LuaArray<ISmartTerrainJobDescriptor> = new LuaTable()
): LuaMultiReturn<[LuaArray<ISmartTerrainJobDescriptor>, string]> {
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";

  // ===================================================================================================================
  // = Mob home
  // ===================================================================================================================

  for (const it of $range(1, logicsConfig.JOBS.MOB_HOME.COUNT)) {
    const name: TName = `${smartTerrainName}_home_${it}`;

    table.insert(jobsList, {
      type: EJobType.MONSTER_HOME,
      isMonsterJob: true,
      priority: logicsConfig.JOBS.MOB_HOME.PRIORITY,
      section: `logic@${name}`,
      pathType: EJobPathType.POINT,
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

  return $multi(jobsList, ltx);
}
