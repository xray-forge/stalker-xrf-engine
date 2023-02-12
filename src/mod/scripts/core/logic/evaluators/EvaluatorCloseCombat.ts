import { property_evaluator, stalker_ids, time_global, XR_action_planner, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { isActiveSection } from "@/mod/scripts/utils/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorCloseCombat");

export interface IEvaluatorCloseCombat extends XR_property_evaluator {
  state: IStoredObject;
  actionPlanner: XR_action_planner;
  isCloseCombat: boolean;
}

export const EvaluatorCloseCombat: IEvaluatorCloseCombat = declare_xr_class(
  "EvaluatorCloseCombat",
  property_evaluator,
  {
    __init(name, storage): void {
      property_evaluator.__init(this, null, name);
      this.state = storage;
      this.isCloseCombat = false;
    },
    evaluate(): boolean {
      if (!isActiveSection(this.object, this.state.section)) {
        return true;
      }

      if (this.actionPlanner === null) {
        this.actionPlanner = this.object.motivation_action_manager();
      }

      if (!this.actionPlanner.evaluator(stalker_ids.property_enemy).evaluate()) {
        return false;
      }

      if (!this.actionPlanner.evaluator(evaluators_id.sidor_wounded_base + 1).evaluate()) {
        return false;
      }

      if (this.actionPlanner.evaluator(stalker_ids.property_danger).evaluate()) {
        return true;
      }

      if (this.object.best_enemy() === null) {
        return this.isCloseCombat;
      }

      if (!this.isCloseCombat) {
        this.isCloseCombat =
          this.object.position().distance_to(this.object.memory_position(this.object.best_enemy()!)) <
          this.state.radius;
      }

      if (this.isCloseCombat) {
        const memoryTime: number = this.object.memory_time(this.object.best_enemy()!);

        if (memoryTime !== null) {
          if (time_global() - memoryTime > 20000) {
            this.isCloseCombat = false;
          }
        } else {
          this.isCloseCombat = false;
        }
      }

      return this.isCloseCombat;
    },
  } as IEvaluatorCloseCombat
);
