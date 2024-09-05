import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { Optional, TNumberId, Vector } from "@/engine/lib/types";

/**
 * Key in portable store indicating who is looting corpse.
 */
export const LOOTING_DEAD_OBJECT_KEY: string = "looting_dead_object";

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
