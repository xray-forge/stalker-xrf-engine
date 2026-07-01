import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { DangerManager } from "@/engine/core/schemes/stalker/danger/DangerManager";
import { Nillable, TTimestamp } from "@/engine/lib/types";

/**
 * Danger sense scheme state.
 */
export interface ISchemeDangerState extends IBaseSchemeState {
  dangerTime: Nillable<TTimestamp>;
  dangerManager: DangerManager;
}
