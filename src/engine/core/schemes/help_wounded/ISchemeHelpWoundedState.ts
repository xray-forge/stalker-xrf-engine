import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { TNumberId, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeHelpWoundedState extends IBaseSchemeState {
  help_wounded_enabled: boolean;
  vertex_id: TNumberId;
  vertex_position: Vector;
  selected_id: TNumberId;
}
