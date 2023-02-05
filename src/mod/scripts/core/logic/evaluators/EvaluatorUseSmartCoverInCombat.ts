import { property_evaluator, XR_property_evaluator } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorUseSmartCoverInCombat");

export interface IEvaluatorUseSmartCoverInCombat extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorUseSmartCoverInCombat: IEvaluatorUseSmartCoverInCombat = declare_xr_class(
  "EvaluatorUseSmartCoverInCombat",
  property_evaluator,
  {
    __init(state: IStoredObject, name: string): void {
      property_evaluator.__init(this, null, name);
      this.state = state;
    },
    evaluate(): boolean {
      if (get_global<AnyCallablesModule>("xr_logic").is_active(this.object, this.state)) {
        return this.state.use_in_combat;
      }

      return false;
    },
  } as IEvaluatorUseSmartCoverInCombat
);
