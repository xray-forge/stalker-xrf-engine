import { property_evaluator, stalker_ids, XR_action_planner, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { isObjectWounded } from "@/mod/scripts/utils/checkers/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorContact");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorContact extends property_evaluator {
  public readonly state: IStoredObject;
  public actionPlanner: Optional<XR_action_planner> = null;

  public constructor(state: IStoredObject) {
    super(null, EvaluatorContact.__name);
    this.state = state;
  }

  public override evaluate(): boolean {
    if (this.state.meet_set !== true) {
      return false;
    }

    const actor: Optional<XR_game_object> = registry.actor;

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
  }
}
