import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";

export interface IEvaluatorGatherItems extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorGatherItems: IEvaluatorGatherItems = declare_xr_class(
  "EvaluatorGatherItems",
  property_evaluator,
  {
    __init(name: string, state: IStoredObject): void {
      property_evaluator.__init(this, null, name);
      this.state = state;
    },
    evaluate(): boolean {
      if (this.state.gather_items_enabled !== true) {
        return false;
      }

      return this.object.is_there_items_to_pickup();
    },
  } as IEvaluatorGatherItems
);
