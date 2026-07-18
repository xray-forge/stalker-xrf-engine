import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EScheme } from "@/engine/lib/types";

/**
 * Gather items scheme state.
 */
export interface ISchemeGatherItemsState extends IBaseSchemeState {
  // Whether object can collect loot.
  canLootItems: boolean;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.GATHER_ITEMS]: ISchemeGatherItemsState;
  }
}
