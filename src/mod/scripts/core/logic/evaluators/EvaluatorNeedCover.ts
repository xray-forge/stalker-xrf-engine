import { property_evaluator, XR_property_evaluator } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";

export interface IEvaluatorNeedCover extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorNeedCover: IEvaluatorNeedCover = declare_xr_class("EvaluatorNeedCover", property_evaluator, {
  __init(state: IStoredObject, name: string): void {
    xr_class_super(null, name);
    this.state = state;
  },
  evaluate(): boolean {
    return get_global<AnyCallablesModule>("xr_logic").is_active(this.object, this.state);
  }
} as IEvaluatorNeedCover);
