import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { AbuseManager } from "@/engine/core/schemes/stalker/abuse/AbuseManager";
import type { EScheme } from "@/engine/lib/types";

/**
 * Generic abuse scheme state.
 */
export interface ISchemeAbuseState extends IBaseSchemeState {
  abuseManager: AbuseManager;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.ABUSE]: ISchemeAbuseState;
  }
}
