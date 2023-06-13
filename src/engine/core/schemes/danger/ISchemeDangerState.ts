import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { Optional, TTimestamp } from "@/engine/lib/types";

/**
 * Danger sense scheme state.
 */
export interface ISchemeDangerState extends IBaseSchemeState {
  dangerTime: Optional<TTimestamp>;
}
