import { Nillable, TTimestamp } from "xray16/lib";

import { IBaseSchemeState } from "@/engine/core/database/database_types";
import { DangerManager } from "@/engine/core/schemes/stalker/danger/DangerManager";
import { EScheme } from "@/engine/lib/types";

/**
 * Danger sense scheme state.
 */
export interface ISchemeDangerState extends IBaseSchemeState {
  dangerTime: Nillable<TTimestamp>;
  dangerManager: DangerManager;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.DANGER]: ISchemeDangerState;
  }
}
