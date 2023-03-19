import { XR_vector } from "xray16";

import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { Optional, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeCorpseDetectionState extends IBaseSchemeState {
  vertex_id: TNumberId;
  vertex_position: Optional<XR_vector>;
  selected_corpse_id: Optional<TNumberId>;
  corpse_detection_enabled: Optional<boolean>;
}
