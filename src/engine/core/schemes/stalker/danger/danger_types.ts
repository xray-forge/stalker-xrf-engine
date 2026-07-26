import { Nillable, TTimestamp } from "xray16/lib";

import { DangerController } from "@/engine/core/schemes/stalker/danger/DangerController";
import { IBaseSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Danger sense scheme state.
 */
export interface ISchemeDangerState extends IBaseSchemeState {
  dangerTime: Nillable<TTimestamp>;
  dangerController: DangerController;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.DANGER]: ISchemeDangerState;
  }
}
