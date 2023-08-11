import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionStateLocked extends action_base {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager, name: string) {
    super(null, name || ActionStateLocked.__name);
    this.stateManager = stateManager;
  }
}
