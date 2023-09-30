import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { LuaArray, TCount, TName } from "@/engine/lib/types";

/**
 * Crow spawner scheme state configured from ini files.
 */
export interface ISchemeCrowSpawnerState extends IBaseSchemeState {
  maxCrowsOnLevel: TCount;
  pathsList: LuaArray<TName>;
}
