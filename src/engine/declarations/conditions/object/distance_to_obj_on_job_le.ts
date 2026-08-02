import { GameObject } from "xray16/alias";
import { extern, TDistance, TSection } from "xray16/lib";

import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { getObjectTerrain } from "@/engine/core/utils/position";

/**
 * Check if distance from object in smart terrain to another working object with matching job section is less or equals.
 *
 * Where:
 * - section - job section to check
 * - distance - number value to check as distance.
 */
extern(
  "xr_conditions.distance_to_obj_on_job_le",
  (_: GameObject, object: GameObject, [section, distance]: [TSection, TDistance]): boolean => {
    const terrain: SmartTerrain = getObjectTerrain(object)!;

    for (const [, descriptor] of terrain.objectJobDescriptors) {
      if (descriptor.job && descriptor.job.section === section) {
        return object.position().distance_to_sqr(descriptor.object.position) <= distance * distance;
      }
    }

    return false;
  }
);
