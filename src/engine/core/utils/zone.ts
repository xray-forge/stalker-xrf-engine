import { $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { ESimulationTerrainRole } from "@/engine/core/managers/simulation/types";
import { getSimulationTerrainByName } from "@/engine/core/managers/simulation/utils";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import type { Squad } from "@/engine/core/objects/squad/Squad";
import { GameObject, Nillable, ServerObject, TRate } from "@/engine/lib/types";

/**
 * Checks online state of object relatively to no combat zones.
 *
 * @param object - Target object to check.
 * @returns Whether object is in one of defined no combat zones.
 */
export function isInNoCombatZone(object: ServerObject): boolean {
  for (const [zoneName, terrainName] of registry.noCombatZones) {
    const zone: Nillable<GameObject> = registry.zones.get(zoneName);

    if (zone && zone.inside(object.position)) {
      const terrain: Nillable<SmartTerrain> = getSimulationTerrainByName(terrainName);

      if (terrain && terrain.terrainControl && terrain.terrainControl.status !== ESmartTerrainStatus.ALARM) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if squad is assigned to base type smart terrain.
 *
 * @param squad - Target squad to check.
 * @returns Whether the squad is in terrain defined as `base`.
 */
export function isInNoWeaponBase(squad: Squad): boolean {
  // todo: Should be u16 max checks?
  if (!squad.assignedTerrainId) {
    return false;
  }

  const assignedTerrain: SmartTerrain = registry.simulator.object(squad.assignedTerrainId) as SmartTerrain;
  const terrainBaseProperties: Nillable<TRate> = assignedTerrain.simulationProperties?.get(ESimulationTerrainRole.BASE);

  // Squad is in a base type terrain.
  return $isNotNil(terrainBaseProperties) && terrainBaseProperties > 0;
}
