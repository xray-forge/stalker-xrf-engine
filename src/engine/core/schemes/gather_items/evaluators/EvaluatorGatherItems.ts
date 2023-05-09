import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeGatherItemsState } from "@/engine/core/schemes/gather_items";

/**
 * Evaluator to check whether object has anything to pick up.
 */
@LuabindClass()
export class EvaluatorGatherItems extends property_evaluator {
  public readonly state: ISchemeGatherItemsState;

  public constructor(state: ISchemeGatherItemsState) {
    super(null, EvaluatorGatherItems.__name);
    this.state = state;
  }

  /**
   * Evaluate whether object has any items to pick up.
   */
  public override evaluate(): boolean {
    if (!this.state.isGatherItemsEnabled) {
      return false;
    }

    return this.object.is_there_items_to_pickup();
  }
}
