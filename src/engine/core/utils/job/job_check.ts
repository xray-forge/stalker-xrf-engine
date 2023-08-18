import { patrol } from "xray16";

import { registry } from "@/engine/core/database";
import type { SmartTerrain } from "@/engine/core/objects";
import { IObjectJobDescriptor, ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import {
  AnyObject,
  ClientObject,
  LuaArray,
  Optional,
  Patrol,
  ServerObject,
  TCount,
  TName,
  TNumberId,
} from "@/engine/lib/types";

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
  jobInfo: ISmartTerrainJobDescriptor,
  smartTerrain: SmartTerrain
): boolean {
  // Job worker recently died, ignore it for now.
  if (smartTerrain.jobDeadTimeById.get(jobInfo.id as TNumberId) !== null) {
    return false;
  }

  // Check monster / stalker restriction for job.
  if ("isMonsterJob" in jobInfo && jobInfo.isMonsterJob !== objectInfo.isMonster) {
    return false;
  }

  // Has callback checker.
  if (
    jobInfo.preconditionFunction &&
    !jobInfo.preconditionFunction(
      objectInfo.object,
      smartTerrain,
      jobInfo.preconditionParameters as AnyObject,
      objectInfo
    )
  ) {
    return false;
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
export function isJobPatrolInRestrictor(
  smartTerrain: SmartTerrain,
  restrictorName: TName,
  wayName: TName
): Optional<boolean> {
  if (restrictorName === null) {
    return null;
  }

  const restrictor: Optional<ClientObject> = registry.zones.get(restrictorName);

  if (restrictor === null) {
    return null;
  }

  const patrolObject: Patrol = new patrol(wayName);
  const count: TCount = patrolObject.count();

  for (const point of $range(0, count - 1)) {
    if (!restrictor.inside(patrolObject.point(point))) {
      return false;
    }
  }

  return true;
}
