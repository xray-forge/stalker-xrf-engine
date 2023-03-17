import { XR_vector } from "xray16";

import { TNumberId } from "@/engine/lib/types";
import { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeHelpWoundedState extends IBaseSchemeState {
  help_wounded_enabled: boolean;
  vertex_id: TNumberId;
  vertex_position: XR_vector;
  selected_id: TNumberId;
}
