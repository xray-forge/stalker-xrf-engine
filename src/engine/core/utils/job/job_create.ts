import { SmartTerrain } from "@/engine/core/objects";
import { createMonsterJobs } from "@/engine/core/utils/job/job_create_monster";
import { createStalkerJobs } from "@/engine/core/utils/job/job_create_stalker";
import { loadExclusiveJobs } from "@/engine/core/utils/job/job_exclusive";
import { TJobDescriptor } from "@/engine/core/utils/job/job_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { LuaArray } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Create jobs for smart terrain.
 * Generate jobs for stalkers and monsters based on available configuration and data.
 *
 * Following types are created:
 * - Monster jobs
 * - Stalker jobs
 * - Exclusive jobs
 *
 * @param smartTerrain - smart terrain to generate for
 * @returns array of job descriptors and ltx configuration text
 */
export function createSmartTerrainJobs(smartTerrain: SmartTerrain): LuaMultiReturn<[LuaArray<TJobDescriptor>, string]> {
  logger.info("Load job for smart:", smartTerrain.name());

  let jobsLtx: string = "";
  const jobsList: LuaArray<TJobDescriptor> = new LuaTable();

  // Stalkers part.
  const [stalkerJobs, stalkerJobsLtx] = createStalkerJobs(smartTerrain);

  jobsLtx += stalkerJobsLtx;
  table.insert(jobsList, stalkerJobs);

  // Monsters part.
  const [monsterJobs, monsterLtx] = createMonsterJobs(smartTerrain);

  jobsLtx += monsterLtx;
  table.insert(jobsList, monsterJobs);

  // Exclusive jobs for smart terrain.
  loadExclusiveJobs(smartTerrain, jobsList);

  return $multi(jobsList, jobsLtx);
}
