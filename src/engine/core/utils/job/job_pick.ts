import { SmartTerrain } from "@/engine/core/objects";
import { isJobAvailableToObject } from "@/engine/core/utils/job/job_check";
import { IObjectJobDescriptor } from "@/engine/core/utils/job/job_types";
import { LuaArray, Optional, TNumberId, TRate } from "@/engine/lib/types";

/**
 * todo;
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

  for (const [, jobInfo] of jobs) {
    if (currentJobPriority > jobInfo.priority) {
      return $multi(selectedJobId, currentJobPriority, selectedJobLink);
    }

    if (isJobAvailableToObject(objectJobDescriptor, jobInfo, smartTerrain)) {
      if (jobInfo.jobId) {
        if (!jobInfo.npc_id) {
          return $multi(jobInfo.jobId, jobInfo.priority, jobInfo);
        } else if (jobInfo.jobId === objectJobDescriptor.jobId) {
          return $multi(jobInfo.jobId, jobInfo.priority, jobInfo);
        }
      } else {
        [selectedJobId, currentJobPriority, selectedJobLink] = selectSmartTerrainJob(
          smartTerrain,
          jobInfo.jobs,
          objectJobDescriptor,
          selectedJobPriority
        );
      }
    }
  }

  return $multi(selectedJobId, currentJobPriority, selectedJobLink);
}
