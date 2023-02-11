import { property_evaluator, XR_property_evaluator } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedCompanion");

export interface IEvaluatorNeedCompanion extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorNeedCompanion: IEvaluatorNeedCompanion = declare_xr_class(
  "EvaluatorNeedCompanion",
  property_evaluator,
  {
    __init(storage, name): void {
      property_evaluator.__init(this, null, name);
      this.state = storage;
    },
    evaluate(): boolean {
      return get_global<AnyCallablesModule>("xr_logic").is_active(this.object, this.state);
    },
  } as IEvaluatorNeedCompanion
);
