import type { IBaseSchemeState } from "@/engine/core/database/database_types";

/**
 * Gather items scheme state.
 */
export interface ISchemeGatherItemsState extends IBaseSchemeState {
  // Whether object can collect loot.
  canLootItems: boolean;
}
