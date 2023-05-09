import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { LuaArray, TCount, TName } from "@/engine/lib/types";

/**
 * Crow spawner scheme state.
 */
export interface ISchemeCrowSpawnerState extends IBaseSchemeState {
  maxCrowsOnLevel: TCount;
  pathsList: LuaArray<TName>;
}
