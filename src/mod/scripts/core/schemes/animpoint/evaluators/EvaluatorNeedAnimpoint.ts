import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
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
      return isActiveSection(this.object, this.state.section);
    },
  } as IEvaluatorNeedAnimpoint
);
