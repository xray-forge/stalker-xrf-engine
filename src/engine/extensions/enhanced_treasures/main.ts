import { TName } from "xray16/lib";
import { $dirname } from "xray16/macros";

import { EGameHook, EGameHookPhase, registerGameHook } from "@/engine/core/hooks";
import { getTypedTreasureMapSpot } from "@/engine/core/managers/map/utils/map_spot_treasure";
import { ITreasureDescriptor } from "@/engine/core/managers/treasures/treasures_types";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($dirname);

export const name: TName = "Enhanced treasures";
export const enabled: boolean = true;

/**
 * Show treasures on the map with the spot of their type: common, rare, epic or unique.
 */
export function register(): void {
  logger.info("Enhanced treasures activated");

  registerGameHook(EGameHook.TREASURE_MAP_SPOT, getEnhancedTreasureMapSpot, { owner: name, phase: EGameHookPhase.SET });
}

/**
 * @param spot - Map spot the core picked.
 * @param treasure - Treasure to show.
 * @returns Map spot of the treasure's type.
 */
export function getEnhancedTreasureMapSpot(this: void, spot: TName, treasure: ITreasureDescriptor): TName {
  return getTypedTreasureMapSpot(treasure);
}
