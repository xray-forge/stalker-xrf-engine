import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorOnPosition");

export interface IEvaluatorOnPosition extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorOnPosition: IEvaluatorOnPosition = declare_xr_class("EvaluatorOnPosition", property_evaluator, {
  __init(name: string, storage: IStoredObject): void {
    property_evaluator.__init(this, null, name);
    this.state = storage;
  },
  evaluate(): boolean {
    return this.object.level_vertex_id() === this.state.pos_vertex;
  },
} as IEvaluatorOnPosition);
