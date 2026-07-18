import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/lib/types";

/**
 * Gather items scheme state.
 */
export interface ISchemeGatherItemsState extends IBaseSchemeState {
  // Whether object can collect loot.
  canLootItems: boolean;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.GATHER_ITEMS]: ISchemeGatherItemsState;
  }
}
