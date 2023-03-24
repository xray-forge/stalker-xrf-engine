import { action_base, anim, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 */
@LuabindClass()
export class ActionMentalPanic extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionMentalPanic.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_mental_state(anim.panic);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();
    this.object.set_mental_state(anim.panic);
  }
}
