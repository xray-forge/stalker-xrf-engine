import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { isJobAvailableToObject } from "@/engine/core/objects/server/smart_terrain/job/job_check";
import {
  IObjectJobDescriptor,
  ISmartTerrainJobDescriptor,
  TSmartTerrainJobsList,
} from "@/engine/core/objects/server/smart_terrain/job/job_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Select smart terrain job for an object.
 *
 * @param smartTerrain - terrain to search for job inside
 * @param jobs - list of jobs to search in
 * @param objectJobDescriptor - descriptor of selected object work
 * @returns selected job id, priority and link
 */
export function selectSmartTerrainJob(
  smartTerrain: SmartTerrain,
  jobs: TSmartTerrainJobsList,
  objectJobDescriptor: IObjectJobDescriptor
): LuaMultiReturn<[Optional<TNumberId>, Optional<ISmartTerrainJobDescriptor>]> {
  for (const [, it] of jobs) {
    // Verify if job is accessible by object and meets conditions.
    if (isJobAvailableToObject(objectJobDescriptor, it, smartTerrain)) {
      // Has no assigned worker, can be used.
      if (!it.objectId || it.id === objectJobDescriptor.jobId) {
        return $multi(it.id as TNumberId, it);
      }
    }
  }

  return $multi(null, null);
}
