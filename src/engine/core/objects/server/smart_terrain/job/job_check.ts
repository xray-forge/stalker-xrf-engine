import type { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import type {
  IObjectJobDescriptor,
  ISmartTerrainJobDescriptor,
  TObjectJobsList,
} from "@/engine/core/objects/server/smart_terrain/job/job_types";
import { AnyObject, TNumberId } from "@/engine/lib/types";

/**
 * Check if object can use job.
 * Validates if it is matching for creature type and job preconditions are met.
 *
 * @param objectJob - descriptor of object job
 * @param smartTerrainJob - descriptor of smart terrain job
 * @param smartTerrain - target smart terrain where job should be processed
 * @returns whether job is available for object
 */
export function isJobAvailableToObject(
  objectJob: IObjectJobDescriptor,
  smartTerrainJob: ISmartTerrainJobDescriptor,
  smartTerrain: SmartTerrain
): boolean {
  // Job worker recently died, ignore it for now.
  if (smartTerrain.jobDeadTimeById.get(smartTerrainJob.id as TNumberId) !== null) {
    return false;
  }

  // Check monster / stalker restriction for job.
  if (smartTerrainJob.isMonsterJob !== null && smartTerrainJob.isMonsterJob !== objectJob.isMonster) {
    return false;
  }

  // Has callback checker - call it.
  return (
    !smartTerrainJob.preconditionFunction ||
    smartTerrainJob.preconditionFunction(
      objectJob.object,
      smartTerrain,
      smartTerrainJob.preconditionParameters as AnyObject,
      objectJob
    )
  );
}

/**
 * Check if no stalkers are working on smart terrain jobs.
 * If no one is working or only monsters, return true.
 *
 * @param descriptors - list of object job descriptors to check
 * @returns whether no stalkers working on jobs
 */
export function areNoStalkersWorkingOnJobs(descriptors: TObjectJobsList): boolean {
  for (const [, descriptor] of descriptors) {
    if (!descriptor.isMonster) {
      return false;
    }
  }

  return true;
}
