import { level } from "xray16";

import {
  jobPreconditionGuard,
  jobPreconditionGuardFollower,
} from "@/engine/core/objects/server/smart_terrain/job/job_precondition";
import {
  EJobPathType,
  EJobType,
  TSmartTerrainJobsList,
} from "@/engine/core/objects/server/smart_terrain/job/job_types";
import type { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/server/smart_terrain/SmartTerrainConfig";
import { isPatrolInRestrictor } from "@/engine/core/utils/patrol";
import { StringBuilder } from "@/engine/core/utils/string";
import { TIndex, TName } from "@/engine/lib/types";

/**
 * Create guard jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default animpoint jobs for
 * @param jobs - list of smart terrain jobs to insert into
 * @param builder - builder of large ltx file
 * @returns cover jobs list and updated string builder
 */
export function createStalkerGuardJobs(
  smartTerrain: SmartTerrain,
  jobs: TSmartTerrainJobsList,
  builder: StringBuilder
): LuaMultiReturn<[TSmartTerrainJobsList, StringBuilder]> {
  const smartTerrainName: TName = smartTerrain.name();

  let index: TIndex = 1;

  while (level.patrol_path_exists(string.format("%s_guard_%s_walk", smartTerrainName, index))) {
    const patrolName: TName = string.format("%s_guard_%s_walk", smartTerrainName, index);

    table.insert(jobs, {
      type: EJobType.GUARD,
      priority: smartTerrainConfig.JOBS.STALKER_GUARD.PRIORITY,
      section: string.format("logic@%s", patrolName),
      pathType: EJobPathType.PATH,
      isMonsterJob: false,
      preconditionParameters: {
        wayName: patrolName,
      },
      preconditionFunction: jobPreconditionGuard,
    });

    builder.append(
      string.format(
        `[logic@%s]
active = walker@%s
[walker@%s]
meet = meet@generic_lager
path_walk = guard_%s_walk
path_look = guard_%s_look
`,
        patrolName,
        patrolName,
        patrolName,
        index,
        index
      )
    );

    if (smartTerrain.safeRestrictor !== null && isPatrolInRestrictor(smartTerrain.safeRestrictor, patrolName)) {
      builder.append("invulnerable = {=npc_in_zone(smart.safe_restr)} true\n");
    }

    if (smartTerrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", smartTerrain.defendRestrictor));
    }

    builder.append(
      string.format(
        `[walker1@%s]
meet = meet@generic_lager
path_walk = guard_%s_walk
path_look = guard_%s_look
def_state_standing = wait_na
on_info = {!is_obj_on_job(logic@follower_%s:3)} walker@%s
on_info2 = {=distance_to_obj_on_job_le(logic@follower_%s:3)} remark@%s
`,
        patrolName,
        index,
        index,
        patrolName,
        patrolName,
        patrolName,
        patrolName
      )
    );

    if (smartTerrain.safeRestrictor !== null && isPatrolInRestrictor(smartTerrain.safeRestrictor, patrolName)) {
      builder.append("invulnerable = {=npc_in_zone(smart.safe_restr)} true\n");
    }

    if (smartTerrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", smartTerrain.defendRestrictor));
    }

    builder.append(
      string.format(
        `[remark@%s]
anim = wait_na
target = logic@follower_%s
`,
        patrolName,
        patrolName
      )
    );

    if (smartTerrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", smartTerrain.defendRestrictor));
    }

    table.insert(jobs, {
      type: EJobType.GUARD_FOLLOWER,
      priority: smartTerrainConfig.JOBS.STALKER_GUARD.PRIORITY_FOLLOWER,
      section: string.format("logic@follower_%s", patrolName),
      pathType: EJobPathType.PATH,
      isMonsterJob: false,
      preconditionParameters: { nextDesiredJob: string.format("logic@%s", patrolName) },
      preconditionFunction: jobPreconditionGuardFollower,
    });

    builder.append(
      string.format(
        `[logic@follower_%s]
active = walker@follow_%s
[walker@follow_%s]
meet = meet@generic_lager
path_walk = guard_%s_walk
path_look = guard_%s_look
on_info = {=distance_to_obj_on_job_le(logic@%s:3)} remark@follower_%s
`,
        patrolName,
        patrolName,
        patrolName,
        index,
        index,
        patrolName,
        patrolName
      )
    );

    if (smartTerrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", smartTerrain.defendRestrictor));
    }

    builder.append(
      string.format(
        `[remark@follower_%s]
anim = wait_na
target = logic@%s
on_timer = 2000 | %%=switch_to_desired_job%%
`,
        patrolName,
        patrolName
      )
    );

    if (smartTerrain.defendRestrictor !== null) {
      builder.append(string.format("out_restr = %s\n", smartTerrain.defendRestrictor));
    }

    index += 1;
  }

  return $multi(jobs, builder);
}
