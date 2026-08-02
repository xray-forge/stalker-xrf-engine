import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { switchTerrainObjectToDesiredJob } from "@/engine/core/objects/smart_terrain/job";
import { getObjectTerrain } from "@/engine/core/utils/position";

/**
 * Switch the object to its desired job within its current smart terrain.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object reassigned to its desired smart terrain job.
 */
extern("xr_effects.switch_to_desired_job", (_: GameObject, object: GameObject): void => {
  switchTerrainObjectToDesiredJob(getObjectTerrain(object) as SmartTerrain, object.id());
});
