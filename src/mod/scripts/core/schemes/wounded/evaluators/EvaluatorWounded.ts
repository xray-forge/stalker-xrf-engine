import { property_evaluator, stalker_ids, XR_action_planner, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { pstor_retrieve } from "@/mod/scripts/core/database/pstor";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorWounded");

export interface IEvaluatorWounded extends XR_property_evaluator {
  actionPlanner: XR_action_planner;
  state: IStoredObject;
}

export const EvaluatorWounded: IEvaluatorWounded = declare_xr_class("EvaluatorWounded", property_evaluator, {
  __init(name: string, state: IStoredObject): void {
    property_evaluator.__init(this, null, name);
    this.state = state;
  },
  evaluate(): boolean {
    if (this.object.in_smart_cover()) {
      return false;
    } else if (this.state.wounded_set !== true) {
      return false;
    }

    this.state.wound_manager.update();

    if (this.actionPlanner === null) {
      this.actionPlanner = this.object.motivation_action_manager();
    }

    if (this.object.critically_wounded() === true) {
      return false;
    }

    if (
      this.actionPlanner.evaluator(stalker_ids.property_enemy).evaluate() &&
      pstor_retrieve(this.object, "wounded_fight") === "true"
    ) {
      return false;
    }

    return tostring(pstor_retrieve(this.object, "wounded_state")) !== "nil";
  },
} as IEvaluatorWounded);
