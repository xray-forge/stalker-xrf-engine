import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { DangerManager } from "@/engine/core/schemes/stalker/danger/DangerManager";
import { Optional, TTimestamp } from "@/engine/lib/types";

/**
 * Danger sense scheme state.
 */
export interface ISchemeDangerState extends IBaseSchemeState {
  dangerTime: Optional<TTimestamp>;
  dangerManager: DangerManager;
}
