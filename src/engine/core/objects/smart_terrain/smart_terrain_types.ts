import type { LuaArray, TCount, TName, TSection } from "xray16/lib";

import type { TConditionList } from "@/engine/core/ini";

/**
 * Smart terrain active status.
 */
export const enum ESmartTerrainStatus {
  NORMAL = 1,
  DANGER,
  ALARM,
}

/**
 * Map of smart terrain statuses by name.
 */
export const ALARM_STATUSES: Record<TName, ESmartTerrainStatus> = {
  normal: ESmartTerrainStatus.NORMAL,
  danger: ESmartTerrainStatus.DANGER,
  alarm: ESmartTerrainStatus.ALARM,
};

/**
 * Configuration for spawn of smart terrain entity.
 */
export interface ISmartTerrainSpawnConfiguration {
  squads: LuaArray<TSection>;
  num: TConditionList;
}

/**
 * Configuration for spawn of smart terrain entity.
 */
export interface ISmartTerrainSpawnItemsDescriptor {
  num: TCount;
}
