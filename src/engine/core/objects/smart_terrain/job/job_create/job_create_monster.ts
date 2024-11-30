import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { EJobPathType, EJobType, TSmartTerrainJobsList } from "@/engine/core/objects/smart_terrain/job/job_types";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { StringBuilder } from "@/engine/core/utils/string";
import { TName } from "@/engine/lib/types";

/**
 * Create list of default smart terrain jobs for monsters.
 * Usually it assigns monster home for some point.
 *
 * @param terrain - terrain to create jobs for
 * @param jobsList - list of jobs to insert into
 * @param stringBuilder - builder of large strings to inject LTX
 * @returns jobs descriptor and ltx config text for matching jobs
 */
export function createMonsterJobs(
  terrain: SmartTerrain,
  jobsList: TSmartTerrainJobsList,
  stringBuilder: StringBuilder
): LuaMultiReturn<[TSmartTerrainJobsList, StringBuilder]> {
  const terrainName: TName = terrain.name();

  // ===================================================================================================================
  // = Mob home
  // ===================================================================================================================

  for (const it of $range(1, smartTerrainConfig.JOBS.MOB_HOME.COUNT)) {
    const patrolName: TName = string.format("%s_home_%s", terrainName, it);

    table.insert(jobsList, {
      type: EJobType.MONSTER_HOME,
      isMonsterJob: true,
      priority: smartTerrainConfig.JOBS.MOB_HOME.PRIORITY,
      section: string.format("logic@%s", patrolName),
      pathType: EJobPathType.POINT,
    });

    stringBuilder.append(
      string.format(
        `[logic@%s]
active = mob_home@%s
[mob_home@%s]
gulag_point = true
home_min_radius = %s
home_mid_radius = %s
home_max_radius = %s
`,
        patrolName,
        patrolName,
        patrolName,
        smartTerrainConfig.JOBS.MOB_HOME.MIN_RADIUS,
        smartTerrainConfig.JOBS.MOB_HOME.MID_RADIUS,
        smartTerrainConfig.JOBS.MOB_HOME.MAX_RADIUS
      )
    );

    if (terrain.defendRestrictor !== null) {
      stringBuilder.append(string.format("out_restr = %s\n", terrain.defendRestrictor));
    }
  }

  return $multi(jobsList, stringBuilder);
}
