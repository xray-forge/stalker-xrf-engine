import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject, patrols } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorPatrolComm");

export interface IEvaluatorPatrolComm extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorPatrolComm: IEvaluatorPatrolComm = declare_xr_class("EvaluatorPatrolComm", property_evaluator, {
  __init(name, storage): void {
    property_evaluator.__init(this, null, name);
    this.state = storage;
  },
  evaluate(): boolean {
    return patrols.get(this.state.patrol_key).is_commander(this.object.id());
  },
} as IEvaluatorPatrolComm);
