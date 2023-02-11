import { property_evaluator, XR_property_evaluator } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedAnimpoint");

export interface IEvaluatorNeedAnimpoint extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorNeedAnimpoint: IEvaluatorNeedAnimpoint = declare_xr_class(
  "EvaluatorNeedAnimpoint",
  property_evaluator,
  {
    __init(storage: IStoredObject, name: string): void {
      property_evaluator.__init(this, null, name);
      this.state = storage;
    },
    evaluate(): boolean {
      return get_global<AnyCallablesModule>("xr_logic").is_active(this.object, this.state);
    },
  } as IEvaluatorNeedAnimpoint
);
