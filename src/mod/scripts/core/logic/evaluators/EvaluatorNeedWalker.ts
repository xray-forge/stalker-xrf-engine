import { property_evaluator, XR_property_evaluator } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("EvaluatorNeedWalker");

export interface IEvaluatorNeedWalker extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorNeedWalker: IEvaluatorNeedWalker = declare_xr_class("EvaluatorNeedWalker", property_evaluator, {
  __init(storage: IStoredObject, name: string): void {
    property_evaluator.__init(this, null, name);
    this.state = storage;
  },
  evaluate(): boolean {
    return get_global<AnyCallablesModule>("xr_logic").is_active(this.object, this.state);
  }
} as IEvaluatorNeedWalker);
