import { property_evaluator, stalker_ids, XR_action_planner, XR_game_object, XR_property_evaluator } from "xray16";

import { Optional } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { isObjectWounded } from "@/mod/scripts/utils/checkers/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorContact");

export interface IEvaluatorContact extends XR_property_evaluator {
  state: IStoredObject;
  actionPlanner: XR_action_planner;
}

export const EvaluatorContact: IEvaluatorContact = declare_xr_class("EvaluatorContact", property_evaluator, {
  __init(name: string, state: IStoredObject): void {
    property_evaluator.__init(this, null, name);
    this.state = state;
  },
  evaluate(): boolean {
    if (this.state.meet_set !== true) {
      return false;
    }

    const actor: Optional<XR_game_object> = getActor();

    if (actor === null || !actor.alive()) {
      return false;
    } else {
      this.state.meet_manager.update();

      if (isObjectWounded(this.object)) {
        return false;
      }

      if (this.object.best_enemy() !== null) {
        return false;
      }

      if (this.actionPlanner === null) {
        this.actionPlanner = this.object.motivation_action_manager();
      }

      if (this.actionPlanner.evaluator(stalker_ids.property_enemy).evaluate()) {
        this.state.meet_manager.use = "false";
        this.object.disable_talk();

        return false;
      }

      return this.state.meet_manager.current_distance !== null;
    }
  },
} as IEvaluatorContact);
