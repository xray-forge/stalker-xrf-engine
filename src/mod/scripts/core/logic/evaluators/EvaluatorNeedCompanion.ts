import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
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
      return isActiveSection(this.object, this.state.section);
    },
  } as IEvaluatorNeedCompanion
);
