import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
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
      if (isActiveSection(this.object, this.state.section)) {
        return this.state.use_in_combat;
      }

      return false;
    },
  } as IEvaluatorUseSmartCoverInCombat
);
