import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { Optional, TNumberId, Vector } from "@/engine/lib/types";

/**
 * State of corpse looting scheme.
 */
export interface ISchemeCorpseDetectionState extends IBaseSchemeState {
  // Selected corpse vertex id to loot.
  selectedCorpseVertexId: TNumberId;
  // Selected corpse vertex position to loot.
  selectedCorpseVertexPosition: Optional<Vector>;
  // Selected corpse ID to loot.
  selectedCorpseId: Optional<TNumberId>;
  // Whether object can detect and search nearby corpses for loot.
  isCorpseDetectionEnabled: Optional<boolean>;
}
