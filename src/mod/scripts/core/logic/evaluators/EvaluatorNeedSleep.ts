import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isSchemeActive } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedSleep");

export interface IEvaluatorNeedSleep extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorNeedSleep: IEvaluatorNeedSleep = declare_xr_class("EvaluatorNeedSleep", property_evaluator, {
  __init(name: string, storage: IStoredObject): void {
    property_evaluator.__init(this, null, name);
    this.state = storage;
  },
  evaluate(): boolean {
    return isSchemeActive(this.object, this.state);
  }
} as IEvaluatorNeedSleep);
