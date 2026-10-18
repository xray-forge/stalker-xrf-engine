import { LuaArray, Nillable, TDistance, TNumberId } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { ESimulationTerrainRole } from "@/engine/core/managers/simulation/types";
import { getSimulationTerrainDescriptorById, getSimulationTerrains } from "@/engine/core/managers/simulation/utils";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { areObjectsOnSameLevel } from "@/engine/core/utils/position";
import type { IDynamicZoneConfig } from "@/engine/extensions/dynamic_zone/dynamic_zone_config";

/**
 * Base terrains and the area around them where squads are protected from hunts and offline battles.
 */
export interface IDynamicZoneBases {
  // Square of the distance from a base terrain within which squads are protected.
  protectionRadiusSqr: TDistance;
  // Terrains with the base role, collected on first use, as terrains register after extensions.
  terrains: Nillable<LuaArray<SmartTerrain>>;
}

/**
 * @param config - Settings of the extension.
 * @returns Base terrains, collected on first use.
 */
export function createDynamicZoneBases(config: IDynamicZoneConfig): IDynamicZoneBases {
  return { protectionRadiusSqr: config.baseProtectionRadius * config.baseProtectionRadius, terrains: null };
}

/**
 * @param terrain - Smart terrain.
 * @returns Whether the terrain has the base role.
 */
function isBaseTerrain(terrain: SmartTerrain): boolean {
  return (terrain.simulationProperties.get(ESimulationTerrainRole.BASE) ?? 0) > 0;
}

/**
 * @param bases - Base terrains.
 * @returns Terrains with the base role, collected once.
 */
function getBaseTerrains(bases: IDynamicZoneBases): LuaArray<SmartTerrain> {
  if ($isNil(bases.terrains)) {
    const terrains: LuaArray<SmartTerrain> = new LuaTable();

    for (const [, terrain] of getSimulationTerrains()) {
      if (isBaseTerrain(terrain)) {
        table.insert(terrains, terrain);
      }
    }

    bases.terrains = terrains;
  }

  return bases.terrains;
}

/**
 * @param bases - Base terrains.
 * @param squad - Squad to check.
 * @returns Whether the squad is assigned to a base terrain or stands within the protection radius of one on its level.
 */
export function isDynamicZoneSquadProtected(bases: IDynamicZoneBases, squad: Squad): boolean {
  const terrainId: Nillable<TNumberId> = squad.assignedTerrainId;
  const terrain: Nillable<SmartTerrain> = $isNil(terrainId)
    ? null
    : getSimulationTerrainDescriptorById(terrainId)?.terrain;

  if ($isNotNil(terrain) && isBaseTerrain(terrain)) {
    return true;
  }

  const terrains: LuaArray<SmartTerrain> = getBaseTerrains(bases);

  for (const index of $range(1, terrains.length())) {
    const base: SmartTerrain = terrains.get(index);

    if (
      areObjectsOnSameLevel(squad, base) &&
      squad.position.distance_to_sqr(base.position) <= bases.protectionRadiusSqr
    ) {
      return true;
    }
  }

  return false;
}
