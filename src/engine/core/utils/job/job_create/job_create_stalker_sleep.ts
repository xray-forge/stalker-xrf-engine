import { level } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { jobPreconditionSleep } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, TSmartTerrainJobsList } from "@/engine/core/utils/job/job_types";
import { isPatrolInRestrictor } from "@/engine/core/utils/patrol";
import { StringBuilder } from "@/engine/core/utils/string";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { TIndex, TName } from "@/engine/lib/types";

/**
 * Create sleep jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default animpoint jobs for
 * @param jobs - list of smart terrain jobs to insert into
 * @param builder - builder of large ltx file
 * @returns cover jobs list and updated string builder
 */
export function createStalkerSleepJobs(
  smartTerrain: SmartTerrain,
  jobs: TSmartTerrainJobsList,
  builder: StringBuilder
): LuaMultiReturn<[TSmartTerrainJobsList, StringBuilder]> {
  const smartTerrainName: TName = smartTerrain.name();

  let it: TIndex = 1;

  while (level.patrol_path_exists(string.format("%s_sleep_%s", smartTerrainName, it))) {
    const wayName: TName = string.format("%s_sleep_%s", smartTerrainName, it);

    table.insert(jobs, {
      type: EJobType.SLEEP,
      isMonsterJob: false,
      priority: logicsConfig.JOBS.STALKER_SLEEP.PRIORITY,
      section: string.format("logic@%s", wayName),
      pathType: EJobPathType.PATH,
      preconditionParameters: { wayName },
      preconditionFunction: jobPreconditionSleep,
    });

    builder.append(
      string.format(
        `[logic@%s]
active = sleeper@%s
[sleeper@%s]
path_main = sleep_%s
`,
        wayName,
        wayName,
        wayName,
        it
      )
    );

    if (smartTerrain.safeRestrictor !== null && isPatrolInRestrictor(smartTerrain.safeRestrictor, wayName)) {
      builder.append("invulnerable = {=npc_in_zone(smart.safe_restr)} true\n");
    }

    if (smartTerrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", smartTerrain.defendRestrictor));
    }

    if (
      smartTerrain.smartTerrainActorControl !== null &&
      smartTerrain.smartTerrainActorControl.ignoreZone !== null &&
      isPatrolInRestrictor(smartTerrain.smartTerrainActorControl.ignoreZone, wayName)
    ) {
      builder.append(
        `combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true
combat_ignore_keep_when_attacked = true
`
      );
    }

    it += 1;
  }

  return $multi(jobs, builder);
}
