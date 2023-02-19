import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorEnd");

export interface IEvaluatorEnd extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorEnd: IEvaluatorEnd = declare_xr_class("EvaluatorEnd", property_evaluator, {
  __init(name: string, storage: IStoredObject): void {
    property_evaluator.__init(this, null, name);
    this.state = storage;
  },
  evaluate(): boolean {
    return !isActiveSection(this.object, this.state.section);
  },
} as IEvaluatorEnd);
