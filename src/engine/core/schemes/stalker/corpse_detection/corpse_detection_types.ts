import { Vector } from "xray16/alias";
import { Nillable, TNumberId, TStringId } from "xray16/lib";

import { IBaseSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/lib/types";

/**
 * Key in portable store indicating who is looting corpse.
 */
export const PS_LOOTING_DEAD_OBJECT: TStringId = "looting_dead_object";

/**
 * State of corpse looting scheme.
 */
export interface ISchemeCorpseDetectionState extends IBaseSchemeState {
  // Whether object can detect and search nearby corpses for loot.
  isCorpseDetectionEnabled: Nillable<boolean>;
  // Selected corpse vertex id to loot.
  selectedCorpseVertexId: TNumberId;
  // Selected corpse vertex position to loot.
  selectedCorpseVertexPosition: Nillable<Vector>;
  // Selected corpse ID to loot.
  selectedCorpseId: Nillable<TNumberId>;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.CORPSE_DETECTION]: ISchemeCorpseDetectionState;
  }
}
