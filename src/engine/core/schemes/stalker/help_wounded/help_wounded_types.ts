import { Vector } from "xray16/alias";
import { Nillable, TNumberId } from "xray16/lib";

import { IBaseSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/lib/types";

/**
 * State of helping wounded scheme.
 */
export interface ISchemeHelpWoundedState extends IBaseSchemeState {
  // Whether object can detect and help nearby wounded stalkers.
  isHelpingWoundedEnabled: boolean;
  // Selected wounded stalker vertex id to help.
  selectedWoundedVertexId: Nillable<TNumberId>;
  // Selected wounded stalker position to help.
  selectedWoundedVertexPosition: Nillable<Vector>;
  // Selected wounded stalker ID to help.
  selectedWoundedId: Nillable<TNumberId>;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.HELP_WOUNDED]: ISchemeHelpWoundedState;
  }
}
