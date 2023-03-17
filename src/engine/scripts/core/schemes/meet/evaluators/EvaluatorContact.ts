import { LuabindClass, property_evaluator, stalker_ids, XR_action_planner, XR_game_object } from "xray16";

import { STRINGIFIED_FALSE } from "@/engine/globals/lua";
import { Optional } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { ISchemeMeetState } from "@/engine/scripts/core/schemes/meet";
import { isObjectWounded } from "@/engine/scripts/utils/check/check";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorContact extends property_evaluator {
  public readonly state: ISchemeMeetState;
  public actionPlanner: Optional<XR_action_planner> = null;

  /**
   * todo;
   */
  public constructor(state: ISchemeMeetState) {
    super(null, EvaluatorContact.__name);
    this.state = state;
  }

  /**
   * todo;
   */
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
        this.state.meet_manager.use = STRINGIFIED_FALSE;
        this.object.disable_talk();

        return false;
      }

      return this.state.meet_manager.current_distance !== null;
    }
  }
}
