import { IBaseSchemeState } from "@/engine/core/schemes/base";

/**
 * Gather items scheme state.
 */
export interface ISchemeGatherItemsState extends IBaseSchemeState {
  // Whether object can be looted after death by other stalkers.
  canBeLooted: boolean;
}
