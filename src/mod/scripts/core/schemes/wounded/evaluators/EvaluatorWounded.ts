import { LuabindClass, property_evaluator, stalker_ids, XR_action_planner } from "xray16";

import { STRINGIFIED_NIL, STRINGIFIED_TRUE } from "@/mod/globals/lua";
import { Optional } from "@/mod/lib/types";
import { pstor_retrieve } from "@/mod/scripts/core/database/pstor";
import { ISchemeWoundedState } from "@/mod/scripts/core/schemes/wounded";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorWounded");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorWounded extends property_evaluator {
  public readonly state: ISchemeWoundedState;
  public actionPlanner: Optional<XR_action_planner> = null;

  /**
   * todo;
   */
  public constructor(state: ISchemeWoundedState) {
    super(null, EvaluatorWounded.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    if (this.object.in_smart_cover()) {
      return false;
    } else if (this.state.wounded_set !== true) {
      return false;
    }

    this.state.wound_manager.update();

    if (this.actionPlanner === null) {
      this.actionPlanner = this.object.motivation_action_manager();
    }

    if (this.object.critically_wounded()) {
      return false;
    }

    if (
      this.actionPlanner.evaluator(stalker_ids.property_enemy).evaluate() &&
      pstor_retrieve(this.object, "wounded_fight") === STRINGIFIED_TRUE
    ) {
      return false;
    }

    return tostring(pstor_retrieve(this.object, "wounded_state")) !== STRINGIFIED_NIL;
  }
}
