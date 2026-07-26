import type { AbuseController } from "@/engine/core/schemes/stalker/abuse/AbuseController";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * Generic abuse scheme state.
 */
export interface ISchemeAbuseState extends IBaseSchemeState {
  abuseController: AbuseController;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.ABUSE]: ISchemeAbuseState;
  }
}
