import { property_evaluator, XR_game_object, XR_property_evaluator } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorSee");

export interface IEvaluatorSee extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorSee: IEvaluatorSee = declare_xr_class("EvaluatorSee", property_evaluator, {
  __init(name: string, storage: IStoredObject): void {
    property_evaluator.__init(this, null, name);
    this.state = storage;
  },
  evaluate(): boolean {
    const bestEnemy: Optional<XR_game_object> = this.object.best_enemy();

    if (bestEnemy !== null && this.object.alive() && this.object.see(bestEnemy)) {
      this.state.last_seen_pos = bestEnemy.position();

      return true;
    } else {
      return false;
    }
  },
} as IEvaluatorSee);
