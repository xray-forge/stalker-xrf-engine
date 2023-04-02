import { action_base, LuabindClass, move } from "xray16";

import { turn } from "@/engine/core/objects/state/direction/StateManagerDirection";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionMovementStandTurn extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionMovementStandTurn.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();
    turn(this.object, this.stateManager);
    this.object.set_movement_type(move.stand);
  }
}