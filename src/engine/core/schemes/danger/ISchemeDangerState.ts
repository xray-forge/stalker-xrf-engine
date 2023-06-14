import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { DangerManager } from "@/engine/core/schemes/danger/DangerManager";
import { Optional, TTimestamp } from "@/engine/lib/types";

/**
 * Danger sense scheme state.
 */
export interface ISchemeDangerState extends IBaseSchemeState {
  dangerTime: Optional<TTimestamp>;
  dangerManager: DangerManager;
}
