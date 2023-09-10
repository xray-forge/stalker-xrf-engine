import { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";

/**
 * Gather items scheme state.
 */
export interface ISchemeGatherItemsState extends IBaseSchemeState {
  // Whether object can collect loot.
  canLootItems: boolean;
}
