import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject, registry } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorCombatCamper");

export interface IEvaluatorCombatCamper extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorCombatCamper: IEvaluatorCombatCamper = declare_xr_class(
  "EvaluatorCombatCamper",
  property_evaluator,
  {
    __init(name, storage): void {
      property_evaluator.__init(this, null, name);
      this.state = storage;
    },
    evaluate(): boolean {
      return registry.objects.get(this.object.id()).script_combat_type === "camper";
    },
  } as IEvaluatorCombatCamper
);
