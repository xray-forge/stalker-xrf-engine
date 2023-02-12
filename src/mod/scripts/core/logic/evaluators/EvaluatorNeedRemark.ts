import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { isActiveSection } from "@/mod/scripts/utils/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedRemark");

export interface IEvaluatorNeedRemark extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorNeedRemark: IEvaluatorNeedRemark = declare_xr_class("EvaluatorNeedRemark", property_evaluator, {
  __init(name: string, state: IStoredObject): void {
    property_evaluator.__init(this, null, name);
    this.state = state;
  },
  evaluate(): boolean {
    return isActiveSection(this.object, this.state.section);
  },
} as IEvaluatorNeedRemark);
