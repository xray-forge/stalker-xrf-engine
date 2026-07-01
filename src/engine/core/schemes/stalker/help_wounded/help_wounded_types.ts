import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { Nillable, TNumberId, Vector } from "@/engine/lib/types";

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
