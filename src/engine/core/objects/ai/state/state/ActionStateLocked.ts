import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
