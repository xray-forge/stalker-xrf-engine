import { SmartTerrain } from "@/engine/core/objects";
import { isJobAvailableToObject } from "@/engine/core/utils/job/job_check";
import { IObjectJobDescriptor } from "@/engine/core/utils/job/types";
import { Optional, TNumberId, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export function selectJob(
  smartTerrain: SmartTerrain,
  jobs: LuaTable<any, any>,
  objectJobDescriptor: IObjectJobDescriptor,
  selectedJobPriority: TRate
): LuaMultiReturn<[Optional<TNumberId>, TRate, Optional<any>]> {
  let selectedJobId: Optional<TNumberId> = null;
  let currentJobPriority: TRate = selectedJobPriority;
  let selectedJobLink = null;

  for (const [k, jobInfo] of jobs) {
    if (currentJobPriority > jobInfo.priority) {
      return $multi(selectedJobId, currentJobPriority, selectedJobLink);
    }

    if (isJobAvailableToObject(objectJobDescriptor, jobInfo, smartTerrain)) {
      if (jobInfo.job_id === null) {
        [selectedJobId, currentJobPriority, selectedJobLink] = selectJob(
          smartTerrain,
          jobInfo.jobs,
          objectJobDescriptor,
          selectedJobPriority
        );
      } else {
        if (jobInfo.npc_id === null) {
          return $multi(jobInfo.job_id, jobInfo.priority, jobInfo);
        } else if (jobInfo.job_id === objectJobDescriptor.job_id) {
          return $multi(jobInfo.job_id, jobInfo.priority, jobInfo);
        }
      }
    }
  }

  return $multi(selectedJobId, currentJobPriority, selectedJobLink);
}
