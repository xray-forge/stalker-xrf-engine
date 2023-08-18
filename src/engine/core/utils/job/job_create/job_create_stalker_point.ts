import { SmartTerrain } from "@/engine/core/objects";
import { EJobPathType, EJobType, ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { LuaArray, TCount, TName } from "@/engine/lib/types";

/**
 * Create point / cover jobs for stalkers in smart terrain.
 *
 * @param smartTerrain - smart terrain to create default point jobs for
 * @returns cover jobs list, generated LTX and count of created jobs
 */
export function createStalkerPointJobs(
  smartTerrain: SmartTerrain,
  jobsList: LuaArray<ISmartTerrainJobDescriptor>
): LuaMultiReturn<[LuaArray<ISmartTerrainJobDescriptor>, string]> {
  const smartTerrainName: TName = smartTerrain.name();

  let ltx: string = "";

  for (const it of $range(1, logicsConfig.JOBS.STALKER_POINT.COUNT)) {
    const name: TName = `${smartTerrainName}_point_${it}`;

    table.insert(jobsList, {
      type: EJobType.POINT,
      isMonsterJob: false,
      priority: logicsConfig.JOBS.STALKER_POINT.PRIORITY,
      section: `logic@${name}`,
      pathType: EJobPathType.POINT,
    });

    ltx +=
      `[logic@${name}]\n` +
      `active = cover@${name}\n` +
      `[cover@${name}]\n` +
      "meet = meet@generic_lager\n" +
      `smart = ${smartTerrainName}\n` +
      `radius_min = ${logicsConfig.JOBS.STALKER_POINT.MIN_RADIUS}\n` +
      `radius_max = ${logicsConfig.JOBS.STALKER_POINT.MAX_RADIUS}\n` +
      "use_attack_direction = false\n" +
      "anim = {!npc_community(zombied)} sit, guard\n";

    if (smartTerrain.defendRestrictor !== null) {
      ltx += `out_restr = ${smartTerrain.defendRestrictor}\n`;
    }

    if (smartTerrain.smartTerrainActorControl !== null && smartTerrain.smartTerrainActorControl.ignoreZone !== null) {
      // todo: Probably smart.base_on_actor_control.ignore_zone should be injected? Original issue.
      ltx +=
        "combat_ignore_cond = {=npc_in_zone(smart.base_on_actor_control.ignore_zone)} true\n" +
        "combat_ignore_keep_when_attacked = true\n";
    }
  }

  return $multi(jobsList, ltx);
}
