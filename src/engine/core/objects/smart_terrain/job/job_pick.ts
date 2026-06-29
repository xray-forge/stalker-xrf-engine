import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { isJobAvailableToObject } from "@/engine/core/objects/smart_terrain/job/job_check";
import {
  IObjectJobState,
  ISmartTerrainJobDescriptor,
  TSmartTerrainJobsList,
} from "@/engine/core/objects/smart_terrain/job/job_types";
import { Optional, TNumberId } from "@/engine/lib/types";

/**
 * Select smart terrain job for an object.
 *
 * @param terrain - Terrain to search for job inside.
 * @param jobs - List of jobs to search in.
 * @param objectJobDescriptor - Descriptor of selected object work.
 * @returns Selected job id, priority and link.
 */
export function selectTerrainJob(
  terrain: SmartTerrain,
  jobs: TSmartTerrainJobsList,
  objectJobDescriptor: IObjectJobState
): LuaMultiReturn<[Optional<TNumberId>, Optional<ISmartTerrainJobDescriptor>]> {
  for (const [, it] of jobs) {
    // Verify if job is accessible by object and meets conditions.
    if (isJobAvailableToObject(objectJobDescriptor, it, terrain)) {
      // Has no assigned worker, can be used.
      if (!it.objectId || it.id === objectJobDescriptor.jobId) {
        return $multi(it.id as TNumberId, it);
      }
    }
  }

  return $multi(null, null);
}

/**
 * @param terrain - Target smart terrain to get job in.
 * @param objectId - Target object ID to get active job for.
 * @returns Descriptor of the job object is assigned to or null.
 */
export function getTerrainJobByObjectId(
  terrain: SmartTerrain,
  objectId: TNumberId
): Optional<ISmartTerrainJobDescriptor> {
  const descriptor: Optional<IObjectJobState> = terrain.objectJobDescriptors.get(objectId);

  return descriptor && terrain.jobs.get(descriptor.jobId);
}
