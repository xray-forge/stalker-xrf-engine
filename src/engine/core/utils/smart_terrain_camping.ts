import { XR_game_object } from "xray16";

import { SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain } from "@/engine/core/utils/object";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo;
 */
export function findSmartTerrainJobForObject(object: XR_game_object, neededJob: string): void {
  const smartTerrain: SmartTerrain = getObjectSmartTerrain(object) as SmartTerrain;

  for (const [id, jobDescriptor] of smartTerrain.objectJobDescriptors) {
    const objectJob = smartTerrain.jobsData.get(jobDescriptor.job_id);

    if (objectJob !== null && objectJob.reserve_job === true) {
      const selected_npc_data = smartTerrain.objectJobDescriptors.get(id);

      selected_npc_data.need_job = neededJob;

      return;
    }
  }
}
