import { action_base, LuabindClass, object } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { getObjectAnimationWeapon } from "@/engine/core/objects/state/weapon/StateManagerWeapon";
import { isStrappableWeapon } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionWeaponStrap extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionWeaponStrap.__name);
    this.stateManager = stateManager;
  }

  /**
   * Strap active weapon.
   */
  public override initialize(): void {
    logger.info("Strap weapon for:", this.object.name());

    super.initialize();

    const weapon: Optional<ClientObject> = getObjectAnimationWeapon(this.object, this.stateManager.targetState);

    if (isStrappableWeapon(weapon)) {
      this.object.set_item(object.strap, weapon);
    } else {
      this.object.set_item(object.idle, null);
    }
  }
}
