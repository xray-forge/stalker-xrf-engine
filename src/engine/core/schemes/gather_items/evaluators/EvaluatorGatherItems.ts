import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeGatherItemsState } from "@/engine/core/schemes/gather_items";

/**
 * Evaluator to check whether object can loot items.
 */
@LuabindClass()
export class EvaluatorGatherItems extends property_evaluator {
  public readonly state: ISchemeGatherItemsState;

  public constructor(state: ISchemeGatherItemsState) {
    super(null, EvaluatorGatherItems.__name);
    this.state = state;
  }

  /**
   * Evaluate whether object can pick any items nearby.
   */
  public override evaluate(): boolean {
    return this.state.canLootItems === true && this.object.is_there_items_to_pickup();
  }
}
