import { action_planner, LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { COMBAT_ACTION_IDS, EActionId } from "@/engine/core/objects/ai/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
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
   * todo: Description.
   */
  public override evaluate(): boolean {
    this.actionPlanner = this.actionPlanner || this.object.motivation_action_manager();

    if (!this.actionPlanner.initialized()) {
      return false;
    }

    const currentActionId: TNumberId = this.actionPlanner.current_action_id();

    if (!COMBAT_ACTION_IDS[currentActionId]) {
      this.stateManager.isCombat = false;
    }

    if (currentActionId !== EActionId.ALIFE) {
      this.stateManager.isAlife = false;
    }

    return false;
  }
}
