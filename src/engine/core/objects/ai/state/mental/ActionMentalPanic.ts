import { action_base, anim, LuabindClass } from "xray16";

import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to set mental panic state of game objects.
 */
@LuabindClass()
export class ActionMentalPanic extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionMentalPanic.__name);
    this.stateManager = stateManager;
  }

  /**
   * Initialize action and change mental state.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_mental_state(anim.panic);
  }

  /**
   * Force setting mental state when it is needed.
   */
  public override execute(): void {
    super.execute();
    this.object.set_mental_state(anim.panic);
  }
}
