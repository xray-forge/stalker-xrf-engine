import { action_base, LuabindClass, object } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { getObjectAnimationWeapon } from "@/engine/core/objects/ai/state/weapon/StateManagerWeapon";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isStrappableWeapon, setItemCondition } from "@/engine/core/utils/object";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { ClientObject, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionWeaponDrop extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionWeaponDrop.__name);
    this.stateManager = stateManager;
  }

  /**
   * Drop weapon if animation requires it.
   * If object has no weapon, just select no weapon active.
   */
  public override initialize(): void {
    logger.info("Drop weapon for:", this.object.name());

    super.initialize();

    const weapon: Optional<ClientObject> = getObjectAnimationWeapon(this.object, this.stateManager.targetState);

    if (isStrappableWeapon(weapon)) {
      this.object.set_item(object.drop, weapon);

      setItemCondition(
        weapon,
        math.random(
          logicsConfig.ITEMS.DROPPED_WEAPON_STATE_DEGRADATION.MIN,
          logicsConfig.ITEMS.DROPPED_WEAPON_STATE_DEGRADATION.MAX
        )
      );
    } else {
      this.object.set_item(object.idle, null);
    }
  }
}
