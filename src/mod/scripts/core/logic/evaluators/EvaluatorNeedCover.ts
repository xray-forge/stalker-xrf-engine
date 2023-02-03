import { property_evaluator, XR_property_evaluator } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isSchemeActive } from "@/mod/scripts/utils/scheme";

const log: LuaLogger = new LuaLogger("EvaluatorNeedCover");

export interface IEvaluatorNeedCover extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorNeedCover: IEvaluatorNeedCover = declare_xr_class("EvaluatorNeedCover", property_evaluator, {
  __init(state: IStoredObject, name: string): void {
    property_evaluator.__init(this, null, name);
    this.state = state;
  },
  evaluate(): boolean {
    return isSchemeActive(this.object, this.state);
  }
} as IEvaluatorNeedCover);
