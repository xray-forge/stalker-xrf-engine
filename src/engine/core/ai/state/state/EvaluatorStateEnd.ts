import { action_planner, LuabindClass, property_evaluator } from "xray16";

import { COMBAT_ACTION_IDS, EActionId } from "@/engine/core/ai/planner/types";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check when state end action is active.
 * State never ends, but has side effects during checking to force execution of other actions.
 */
@LuabindClass()
export class EvaluatorStateEnd extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  private actionPlanner: Optional<action_planner> = null;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorStateEnd.__name);
    this.stateManager = stateManager;
  }

  /**
   * Perform silly checks of state with side effects.
   *
   * @returns false since state never ends
   */
  public override evaluate(): boolean {
    this.actionPlanner = this.actionPlanner ?? this.object.motivation_action_manager();

    if (this.actionPlanner.initialized()) {
      const currentActionId: TNumberId = this.actionPlanner.current_action_id();

      if (!COMBAT_ACTION_IDS[currentActionId]) {
        this.stateManager.isCombat = false;
      }

      if (currentActionId !== EActionId.ALIFE) {
        this.stateManager.isAlife = false;
      }
    }

    // State never ends.
    return false;
  }
}
