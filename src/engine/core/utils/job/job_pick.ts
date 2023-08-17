import { SmartTerrain } from "@/engine/core/objects";
import { isJobAvailableToObject } from "@/engine/core/utils/job/job_check";
import { IObjectJobDescriptor } from "@/engine/core/utils/job/job_types";
import { LuaArray, Optional, TNumberId, TRate } from "@/engine/lib/types";

/**
 * Select smart terrain job for an object.
 * todo: Flat jobs structure.
 *
 * @param smartTerrain - terrain to search for job inside
 * @param jobs - list of jobs to search in
 * @param objectJobDescriptor - descriptor of selected object work
 * @param selectedJobPriority - currently selected job priority, starts with -1
 * @returns selected job id, priority and link
 */
export function selectSmartTerrainJob(
  smartTerrain: SmartTerrain,
  jobs: LuaArray<any>,
  objectJobDescriptor: IObjectJobDescriptor,
  selectedJobPriority: TRate
): LuaMultiReturn<[Optional<TNumberId>, TRate, Optional<any>]> {
  let selectedJobId: Optional<TNumberId> = null;
  let currentJobPriority: TRate = selectedJobPriority;
  let selectedJobLink = null;

  for (const [, it] of jobs) {
    // Selected job with higher priority, no reason to go down (jobs are sorted by DESC).
    if (currentJobPriority > it.priority) {
      return $multi(selectedJobId, currentJobPriority, selectedJobLink);
    }

    // Verify if job is accessible by object and meets conditions.
    if (isJobAvailableToObject(objectJobDescriptor, it, smartTerrain)) {
      // Job entity, can be verified.
      if (it.jobId) {
        // Has no assigned worker, can be used.
        if (!it.npc_id) {
          return $multi(it.jobId, it.priority, it);
          // Is already handled by object, continue working with it.
        } else if (it.jobId === objectJobDescriptor.jobId) {
          return $multi(it.jobId, it.priority, it);
        }
      } else {
        // Search jobs in list, one level down in recursive data structure.
        [selectedJobId, currentJobPriority, selectedJobLink] = selectSmartTerrainJob(
          smartTerrain,
          it.jobs,
          objectJobDescriptor,
          selectedJobPriority
        );
      }
    }
  }

  return $multi(selectedJobId, currentJobPriority, selectedJobLink);
}
