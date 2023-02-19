import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { pstor_retrieve } from "@/mod/scripts/core/db/pstor";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorCanFight");

export interface IEvaluatorCanFight extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorCanFight: IEvaluatorCanFight = declare_xr_class("EvaluatorCanFight", property_evaluator, {
  __init(name: string, state: IStoredObject): void {
    property_evaluator.__init(this, null, name);
    this.state = state;
  },
  evaluate(): boolean {
    if (this.object.critically_wounded()) {
      return true;
    }

    return pstor_retrieve(this.object, "wounded_fight") !== "false";
  },
} as IEvaluatorCanFight);
