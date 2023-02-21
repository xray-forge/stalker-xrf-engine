import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorReachAnimpoint");

export interface IEvaluatorReachAnimpoint extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorReachAnimpoint: IEvaluatorReachAnimpoint = declare_xr_class(
  "EvaluatorReachAnimpoint",
  property_evaluator,
  {
    __init(storage: IStoredObject, name: string): void {
      property_evaluator.__init(this, null, name);
      this.state = storage;
    },
    evaluate(): boolean {
      return this.state.animpoint!.position_riched();
    },
  } as IEvaluatorReachAnimpoint
);
