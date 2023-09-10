import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { AbuseManager } from "@/engine/core/schemes/abuse/AbuseManager";

/**
 * Generic abuse scheme state.
 */
export interface ISchemeAbuseState extends IBaseSchemeState {
  abuseManager: AbuseManager;
}
