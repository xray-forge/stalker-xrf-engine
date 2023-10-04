import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { AbuseManager } from "@/engine/core/schemes/stalker/abuse/AbuseManager";

/**
 * Generic abuse scheme state.
 */
export interface ISchemeAbuseState extends IBaseSchemeState {
  abuseManager: AbuseManager;
}
