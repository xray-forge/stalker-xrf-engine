import type { TConditionList } from "@/engine/core/utils/ini";
import type { LuaArray, TCount, TSection } from "@/engine/lib/types";

/**
 * Smart terrain active status.
 */
export enum ESmartTerrainStatus {
  NORMAL = 0,
  DANGER,
  ALARM,
}

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
