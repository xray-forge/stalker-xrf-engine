import { Nillable, TLabel, TName } from "xray16/lib";
import { $dirname } from "xray16/macros";

import { EGameHook, registerGameHook } from "@/engine/core/hooks";
import { isSmartTerrainVisited } from "@/engine/core/managers/map/utils/map_terrain_discovery";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($dirname);

export const name: TName = "Enhanced location progression";
export const enabled: boolean = true;

/**
 * Keep smart terrains off the map and out of travel routes until the actor visits them.
 */
export function register(): void {
  logger.info("Enhanced location progression activated");

  registerGameHook(EGameHook.SMART_TERRAIN_DISCOVERY, getLocationProgressionRejection, { owner: name });
}

/**
 * @param terrainName - Name of the smart terrain.
 * @returns Why the actor does not know the terrain yet, `null` once visited.
 */
export function getLocationProgressionRejection(this: void, terrainName: TName): Nillable<TLabel> {
  return isSmartTerrainVisited(terrainName) ? null : "not visited";
}
