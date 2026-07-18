import type { AbuseManager } from "@/engine/core/schemes/stalker/abuse/AbuseManager";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/lib/types";

/**
 * Generic abuse scheme state.
 */
export interface ISchemeAbuseState extends IBaseSchemeState {
  abuseManager: AbuseManager;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.ABUSE]: ISchemeAbuseState;
  }
}
