import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";

export interface IEvaluatorAbuse extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorAbuse: IEvaluatorAbuse = declare_xr_class("EvaluatorAbuse", property_evaluator, {
  __init(name: string, storage: IStoredObject): void {
    xr_class_super(null, name);
    this.state = storage;
  },
  evaluate(): boolean {
    return this.state.abuse_manager.update();
  }
} as IEvaluatorAbuse);
