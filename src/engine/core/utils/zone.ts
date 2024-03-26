import { getManager, registry } from "@/engine/core/database";
import { ESimulationTerrainRole, SimulationManager } from "@/engine/core/managers/simulation";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import type { Squad } from "@/engine/core/objects/squad/Squad";
import { GameObject, Optional, ServerObject, TRate } from "@/engine/lib/types";

/**
 * Checks online state of object relatively to no combat zones.
 *
 * @param object - target object to check
 * @returns whether object is in one of defined no combat zones
 */
export function isInNoCombatZone(object: ServerObject): boolean {
  const simulationManager: SimulationManager = getManager(SimulationManager);

  for (const [zoneName, smartTerrainName] of registry.noCombatZones) {
    const zone: Optional<GameObject> = registry.zones.get(zoneName);

    if (zone && zone.inside(object.position)) {
      const smartTerrain: Optional<SmartTerrain> = simulationManager.getSmartTerrainByName(smartTerrainName);

      if (
        smartTerrain &&
        smartTerrain.terrainControl &&
        smartTerrain.terrainControl.status !== ESmartTerrainStatus.ALARM
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if squad is assigned to base type smart terrain.
 *
 * @param squad - target squad to check
 * @returns whether the squad is in terrain defined as `base`
 */
export function isInNoWeaponBase(squad: Squad): boolean {
  // todo: Should be u16 max checks?
  if (!squad.assignedSmartTerrainId) {
    return false;
  }

  const assignedSmartTerrain: SmartTerrain = registry.simulator.object(squad.assignedSmartTerrainId) as SmartTerrain;
  const smartTerrainBaseProperties: Optional<TRate> = assignedSmartTerrain.simulationProperties?.get(
    ESimulationTerrainRole.BASE
  );

  // Squad is in a base type terrain.
  return smartTerrainBaseProperties !== null && smartTerrainBaseProperties > 0;
}
