import { vector } from "xray16";

import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeHelpWoundedState extends IBaseSchemeState {
  help_wounded_enabled: boolean;
  vertex_id: TNumberId;
  vertex_position: vector;
  selected_id: TNumberId;
}
