import { action_base, LuabindClass } from "xray16";
import { TName } from "xray16/lib";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Do nothing.
 * Action placeholder for state manager to not do anything when external logics is applied.
 */
@LuabindClass()
export class ActionStateLocked extends action_base {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager, name: TName) {
    super(null, name || ActionStateLocked.__name);
    this.stateManager = stateManager;
  }
}
