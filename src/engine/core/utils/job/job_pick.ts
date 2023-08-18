import { SmartTerrain } from "@/engine/core/objects";
import { isJobAvailableToObject } from "@/engine/core/utils/job/job_check";
import { IObjectJobDescriptor, ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { LuaArray, Optional, TNumberId, TRate } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Select smart terrain job for an object.
 *
 * @param smartTerrain - terrain to search for job inside
 * @param jobs - list of jobs to search in
 * @param objectJobDescriptor - descriptor of selected object work
 * @param selectedJobPriority - currently selected job priority, starts with -1
 * @returns selected job id, priority and link
 */
export function selectSmartTerrainJob(
  smartTerrain: SmartTerrain,
  jobs: LuaArray<ISmartTerrainJobDescriptor>,
  objectJobDescriptor: IObjectJobDescriptor,
  selectedJobPriority: TRate
): LuaMultiReturn<[Optional<TNumberId>, TRate, Optional<ISmartTerrainJobDescriptor>]> {
  for (const [, it] of jobs) {
    // Verify if job is accessible by object and meets conditions.
    if (isJobAvailableToObject(objectJobDescriptor, it, smartTerrain)) {
      // Has no assigned worker, can be used.
      if (!it.objectId || it.id === objectJobDescriptor.jobId || selectedJobPriority > it.priority) {
        return $multi(it.id as TNumberId, it.priority, it);
      }
    }
  }

  return $multi(null, selectedJobPriority, null);
}
