import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to set current movement state as stand + turn.
 */
@LuabindClass()
export class ActionMovementStandTurn extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionMovementStandTurn.__name);
    this.stateManager = stateManager;
  }

  /**
   * Apply correct states for an object.
   */
  public override initialize(): void {
    super.initialize();

    this.stateManager.turn();
    this.object.set_movement_type(move.stand);
  }
}
