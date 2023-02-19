import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject, registry } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorCheckCombat");

export interface IEvaluatorCheckCombat extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorCheckCombat: IEvaluatorCheckCombat = declare_xr_class(
  "EvaluatorCheckCombat",
  property_evaluator,
  {
    __init(name: string, state: IStoredObject): void {
      property_evaluator.__init(this, null, name);
      this.state = state;
    },
    evaluate(): boolean {
      const state = this.state;

      if (state.enabled && this.object.best_enemy()) {
        const actor = registry.actor;

        if (!actor) {
          return false;
        }

        return state.script_combat_type !== null;
      }

      return false;
    },
  } as IEvaluatorCheckCombat
);
