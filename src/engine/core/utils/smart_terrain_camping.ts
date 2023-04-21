import { alife, XR_alife_simulator, XR_cse_alife_creature_abstract, XR_game_object } from "xray16";

import { SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain } from "@/engine/core/utils/object";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { TNumberId } from "@/engine/lib/types";

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

/**
 * todo;
 */
export function onSmartTerrainObjectDeath(object: XR_cse_alife_creature_abstract): void {
  const alifeSimulator: XR_alife_simulator = alife();

  if (alifeSimulator !== null) {
    object = alifeSimulator.object(object.id) as XR_cse_alife_creature_abstract;

    if (object === null) {
      return;
    }

    const smartTerrainId: TNumberId = object.smart_terrain_id();

    if (smartTerrainId !== MAX_U16) {
      logger.info("Clear smart terrain dead object:", object.name());
      (alifeSimulator.object(smartTerrainId) as SmartTerrain).onObjectDeath(object);
    }
  }
}
