import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isSchemeActive } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedWalker");

export interface IEvaluatorNeedWalker extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorNeedWalker: IEvaluatorNeedWalker = declare_xr_class("EvaluatorNeedWalker", property_evaluator, {
  __init(storage: IStoredObject, name: string): void {
    property_evaluator.__init(this, null, name);
    this.state = storage;
  },
  evaluate(): boolean {
    return isSchemeActive(this.object, this.state);
  }
} as IEvaluatorNeedWalker);
