import { Nillable, TLabel, TName } from "xray16/lib";

import { EGameHook, getGameGuardHookRejection } from "@/engine/core/hooks";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * @param terrainName - Name of the smart terrain.
 * @returns Why the actor does not know the terrain yet, `null` when it does: its map spot and travel to it wait.
 */
export function getSmartTerrainDiscoveryRejection(terrainName: TName): Nillable<TLabel> {
  if (mapDisplayConfig.REQUIRE_SMART_TERRAIN_VISIT && !isSmartTerrainVisited(terrainName)) {
    return "not visited";
  }

  return getGameGuardHookRejection(EGameHook.SMART_TERRAIN_DISCOVERY, terrainName);
}

/**
 * @param terrainName - Name of the smart terrain.
 * @returns Whether the actor has visited the terrain.
 */
export function isSmartTerrainVisited(terrainName: TName): boolean {
  return hasInfoPortion(string.format("%s_visited", terrainName));
}
