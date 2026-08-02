import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";
import {
  getSimulationTerrainByName,
  getSimulationTerrainDescriptorById,
} from "@/engine/core/managers/simulation/utils";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";

/**
 * Check whether all squads assigned to the `jup_b41` smart terrain are located inside the `jup_b41_sr_light` zone.
 *
 * Todo: Use generic condition?
 *
 * @returns Whether every member of every squad assigned to the terrain is inside the zone.
 */
extern("xr_conditions.squads_in_zone_b41", (): boolean => {
  const terrain: Nillable<SmartTerrain> = getSimulationTerrainByName("jup_b41");
  const zone: Nillable<GameObject> = registry.zones.get("jup_b41_sr_light");

  if (!zone) {
    return false;
  }

  if (!terrain) {
    return false;
  }

  for (const [_k, v] of getSimulationTerrainDescriptorById(terrain.id)!.assignedSquads) {
    if ($isNotNil(v)) {
      for (const j of v.squad_members()) {
        if (!zone.inside(j.object.position)) {
          return false;
        }
      }
    }
  }

  return true;
});
