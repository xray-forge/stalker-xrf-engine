import { XR_vector } from "xray16";

import { Optional, TNumberId } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeCorpseDetectionState extends IBaseSchemeState {
  vertex_id: TNumberId;
  vertex_position: Optional<XR_vector>;
  selected_corpse_id: Optional<TNumberId>;
  corpse_detection_enabled: Optional<boolean>;
}
