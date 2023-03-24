import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { getObjectAnimationWeapon, getObjectIdleState } from "@/engine/core/objects/state/weapon/StateManagerWeapon";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionWeaponUnstrap extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionWeaponUnstrap.__name);
    this.stateManager = stateManager;
  }

  /**
   * Unstrap active animation weapon.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_item(
      getObjectIdleState(this.stateManager.target_state),
      getObjectAnimationWeapon(this.object, this.stateManager.target_state)
    );
  }
}
