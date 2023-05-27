import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { Optional, TNumberId, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeCorpseDetectionState extends IBaseSchemeState {
  vertex_id: TNumberId;
  vertex_position: Optional<Vector>;
  selected_corpse_id: Optional<TNumberId>;
  corpse_detection_enabled: Optional<boolean>;
}
