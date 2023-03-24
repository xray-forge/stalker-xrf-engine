import { cast_planner, LuabindClass, property_evaluator, stalker_ids, XR_action_planner } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorStateEnd extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  private actionPlanner: Optional<XR_action_planner> = null;
  private combatPlanner: Optional<XR_action_planner> = null;

  /**
   * todo: Description.
   */
  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorStateEnd.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    if (this.actionPlanner === null) {
      this.actionPlanner = this.object.motivation_action_manager();
    }

    if (this.combatPlanner === null) {
      this.combatPlanner = cast_planner(this.actionPlanner.action(stalker_ids.action_combat_planner));
    }

    if (!this.actionPlanner.initialized()) {
      return false;
    }

    const currentActionId: TNumberId = this.actionPlanner.current_action_id();

    if (currentActionId === stalker_ids.action_combat_planner) {
      if (!this.combatPlanner.initialized()) {
        return false;
      }
    } else if (
      currentActionId !== stalker_ids.action_danger_planner &&
      currentActionId !== stalker_ids.action_anomaly_planner
    ) {
      this.stateManager.combat = false;
    }

    return false;
  }
}
