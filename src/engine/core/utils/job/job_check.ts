import { patrol } from "xray16";

import { registry } from "@/engine/core/database";
import type { SmartTerrain } from "@/engine/core/objects";
import { IObjectJobDescriptor } from "@/engine/core/utils/job/types";
import { AnyCallable, ClientObject, LuaArray, Optional, Patrol, ServerObject, TCount, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function isAccessibleJob(serverObject: ServerObject, wayName: TName): boolean {
  return registry.objects.get(serverObject.id)?.object !== null;
}

/**
 * todo;
 * todo: gulag general update
 */
export function isJobAvailableToObject(
  objectInfo: IObjectJobDescriptor,
  jobInfo: any,
  smartTerrain: SmartTerrain
): boolean {
  if (smartTerrain.jobDeadTimeById.get(jobInfo.job_id) !== null) {
    return false;
  }

  if (jobInfo._precondition_is_monster !== null && jobInfo._precondition_is_monster !== objectInfo.isMonster) {
    return false;
  }

  if (jobInfo._precondition_function !== null) {
    if (
      !(jobInfo._precondition_function as AnyCallable)(
        objectInfo.serverObject,
        smartTerrain,
        jobInfo._precondition_params,
        objectInfo
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function areOnlyMonstersOnJobs(objectInfos: LuaArray<IObjectJobDescriptor>): boolean {
  for (const [, objectInfo] of objectInfos) {
    if (!objectInfo.isMonster) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 * todo;
 */
export function isJobInRestrictor(smart: SmartTerrain, restrictorName: TName, wayName: string): Optional<boolean> {
  if (restrictorName === null) {
    return null;
  }

  const restrictor: Optional<ClientObject> = registry.zones.get(restrictorName);

  if (restrictor === null) {
    return null;
  }

  const patrolObject: Patrol = new patrol(wayName);
  const count: TCount = patrolObject.count();

  for (const pt of $range(0, count - 1)) {
    if (!restrictor.inside(patrolObject.point(pt))) {
      return false;
    }
  }

  return true;
}
