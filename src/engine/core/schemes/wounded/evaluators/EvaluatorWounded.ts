import { LuabindClass, property_evaluator, stalker_ids, XR_action_planner } from "xray16";

import { portableStoreGet } from "@/engine/core/database/portable_store";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorWounded extends property_evaluator {
  public readonly state: ISchemeWoundedState;
  public actionPlanner: Optional<XR_action_planner> = null;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeWoundedState) {
    super(null, EvaluatorWounded.__name);
    this.state = state;
  }

  /**
   * todo: Description.
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
      portableStoreGet(this.object, "wounded_fight") === TRUE
    ) {
      return false;
    }

    return tostring(portableStoreGet(this.object, "wounded_state")) !== NIL;
  }
}
