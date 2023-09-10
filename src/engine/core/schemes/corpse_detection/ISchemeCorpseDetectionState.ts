import { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import { Optional, TNumberId, Vector } from "@/engine/lib/types";

/**
 * State of corpse looting scheme.
 */
export interface ISchemeCorpseDetectionState extends IBaseSchemeState {
  // Whether object can detect and search nearby corpses for loot.
  isCorpseDetectionEnabled: Optional<boolean>;
  // Selected corpse vertex id to loot.
  selectedCorpseVertexId: TNumberId;
  // Selected corpse vertex position to loot.
  selectedCorpseVertexPosition: Optional<Vector>;
  // Selected corpse ID to loot.
  selectedCorpseId: Optional<TNumberId>;
}
