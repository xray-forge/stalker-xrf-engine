import type { LuaArray, TCount, TName } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * Crow spawner scheme state configured from ini files.
 */
export interface ISchemeCrowSpawnerState extends IBaseSchemeState {
  maxCrowsOnLevel: TCount;
  pathsList: LuaArray<TName>;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.SR_CROW_SPAWNER]: ISchemeCrowSpawnerState;
  }
}
