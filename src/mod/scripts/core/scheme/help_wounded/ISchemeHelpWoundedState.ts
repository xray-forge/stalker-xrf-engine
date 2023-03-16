import { XR_vector } from "xray16";

import { TNumberId } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";

/**
 * todo;
 */
export interface ISchemeHelpWoundedState extends IBaseSchemeState {
  help_wounded_enabled: boolean;
  vertex_id: TNumberId;
  vertex_position: XR_vector;
  selected_id: TNumberId;
}
