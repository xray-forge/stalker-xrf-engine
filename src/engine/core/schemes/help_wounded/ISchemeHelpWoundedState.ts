import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { Optional, TNumberId, Vector } from "@/engine/lib/types";

/**
 * State of helping wounded scheme.
 */
export interface ISchemeHelpWoundedState extends IBaseSchemeState {
  // Whether object can detect and help nearby wounded stalkers.
  isHelpingWoundedEnabled: boolean;
  // Selected wounded stalker vertex id to help.
  selectedWoundedVertexId: Optional<TNumberId>;
  // Selected wounded stalker position to help.
  selectedWoundedVertexPosition: Optional<Vector>;
  // Selected wounded stalker ID to help.
  selectedWoundedId: Optional<TNumberId>;
}
