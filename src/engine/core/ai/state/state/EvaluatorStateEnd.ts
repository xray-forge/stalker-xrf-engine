import { action_planner, LuabindClass, property_evaluator } from "xray16";
import { Nillable, TNumberId } from "xray16/lib";

import { COMBAT_ACTION_IDS, EActionId } from "@/engine/core/ai/planner/types";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Evaluator to check when state end action is active.
 * State never ends, but has side effects during checking to force execution of other actions.
 */
@LuabindClass()
export class EvaluatorStateEnd extends property_evaluator {
  private readonly controller: StalkerStateController;

  private actionPlanner: Nillable<action_planner> = null;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorStateEnd.__name);
    this.controller = controller;
  }

  /**
   * Perform silly checks of state with side effects.
   *
   * @returns False since state never ends.
   */
  public override evaluate(): boolean {
    this.actionPlanner = this.actionPlanner ?? this.object.motivation_action_manager();

    if (this.actionPlanner.initialized()) {
      const currentActionId: TNumberId = this.actionPlanner.current_action_id();

      if (!COMBAT_ACTION_IDS[currentActionId]) {
        this.controller.isCombat = false;
      }

      if (currentActionId !== EActionId.ALIFE) {
        this.controller.isAlife = false;
      }
    }

    // State never ends.
    return false;
  }
}
