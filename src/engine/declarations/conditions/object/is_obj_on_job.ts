import { GameObject } from "xray16/alias";
import { extern, Nillable, TName, TSection } from "xray16/lib";

import { getSimulationTerrainByName } from "@/engine/core/managers/simulation/utils";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { getObjectTerrain } from "@/engine/core/utils/position";

/**
 * Check if object is on specific job in specific smart terrain.
 *
 * Where:
 * - section - job section to check
 * - terrainName - name of smart terrain to check.
 */
extern(
  "xr_conditions.is_obj_on_job",
  (_: GameObject, object: GameObject, [section, terrainName]: [TSection, Nillable<TName>]): boolean => {
    const terrain: Nillable<SmartTerrain> = terrainName
      ? getSimulationTerrainByName(terrainName)
      : getObjectTerrain(object);

    if (!terrain) {
      return false;
    }

    for (const [, descriptor] of terrain.objectJobDescriptors) {
      if (descriptor.job && descriptor.job.section === section) {
        return true;
      }
    }

    return false;
  }
);
