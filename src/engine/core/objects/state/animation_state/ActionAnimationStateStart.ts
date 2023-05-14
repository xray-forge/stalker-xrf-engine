import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check animation state.
 */
@LuabindClass()
export class ActionAnimationStateStart extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionAnimationStateStart.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether animation state.
   */
  public override initialize(): void {
    super.initialize();

    this.stateManager.animstate.setState(states.get(this.stateManager.targetState).animstate, null);
    this.stateManager.animstate.setControl();
  }
}
