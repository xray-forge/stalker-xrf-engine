import { action_base, LuabindClass, object, XR_game_object } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { getObjectAnimationWeapon } from "@/engine/core/objects/state/weapon/StateManagerWeapon";
import { isStrappableWeapon } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { setItemCondition } from "@/engine/core/utils/object";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { Optional } from "@/engine/lib/types";

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
    super.initialize();

    const weapon: Optional<XR_game_object> = getObjectAnimationWeapon(this.object, this.stateManager.target_state);

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
