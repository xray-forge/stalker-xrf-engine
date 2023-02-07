import { property_evaluator, XR_property_evaluator } from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorEnemy");

export interface IEvaluatorEnemy extends XR_property_evaluator {}

export const EvaluatorEnemy: IEvaluatorEnemy = declare_xr_class("EvaluatorEnemy", property_evaluator, {
  __init(name: string): void {
    property_evaluator.__init(this, null, name);
  },
  evaluate(): boolean {
    return this.object.best_enemy() !== null;
  },
} as IEvaluatorEnemy);
