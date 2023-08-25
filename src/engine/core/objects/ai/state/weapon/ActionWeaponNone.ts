import { action_base, LuabindClass, object } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionWeaponNone extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionWeaponNone.__name);
    this.stateManager = stateManager;
  }

  /**
   * Select no weapon active.
   */
  public override initialize(): void {
    logger.info("Set weapon none for:", this.object.name());

    super.initialize();
    this.object.set_item(object.idle, null);
  }
}
