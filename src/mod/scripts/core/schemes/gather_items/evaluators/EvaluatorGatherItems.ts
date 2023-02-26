import { property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorGatherItems extends property_evaluator {
  public readonly state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, EvaluatorGatherItems.__name);
    this.state = state;
  }

  public evaluate(): boolean {
    if (this.state.gather_items_enabled !== true) {
      return false;
    }

    return this.object.is_there_items_to_pickup();
  }
}
