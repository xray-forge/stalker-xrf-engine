import { action_base, LuabindClass } from "xray16";

import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionAnimationStop extends action_base {
  public readonly stateManager: StalkerStateManager;

  public constructor(state: StalkerStateManager) {
    super(null, ActionAnimationStop.__name);
    this.stateManager = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.stateManager.animation.setState(
      null,
      (this.stateManager.isForced || states.get(this.stateManager.target_state).isForced) as Optional<boolean>
    );
    this.stateManager.animation.setControl();
  }
}
