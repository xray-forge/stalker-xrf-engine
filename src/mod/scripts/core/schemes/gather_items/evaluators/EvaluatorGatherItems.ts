import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeGatherItemsState } from "@/mod/scripts/core/schemes/gather_items";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorGatherItems extends property_evaluator {
  public readonly state: ISchemeGatherItemsState;

  /**
   * todo;
   */
  public constructor(state: ISchemeGatherItemsState) {
    super(null, EvaluatorGatherItems.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    if (this.state.gather_items_enabled !== true) {
      return false;
    }

    return this.object.is_there_items_to_pickup();
  }
}
