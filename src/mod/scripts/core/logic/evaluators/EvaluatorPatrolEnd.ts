import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { isActiveSection } from "@/mod/scripts/utils/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorPatrolEnd");

export interface IEvaluatorPatrolEnd extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorPatrolEnd: IEvaluatorPatrolEnd = declare_xr_class("EvaluatorPatrolEnd", property_evaluator, {
  __init(name: string, storage: IStoredObject): void {
    property_evaluator.__init(this, null, name);
    this.state = storage;
  },
  evaluate(): boolean {
    return !isActiveSection(this.object, this.state.section);
  },
} as IEvaluatorPatrolEnd);
