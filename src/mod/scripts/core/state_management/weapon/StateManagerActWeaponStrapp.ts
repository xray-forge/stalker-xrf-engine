import { action_base, object, XR_game_object } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { get_weapon } from "@/mod/scripts/core/state_management/weapon/StateManagerWeapon";
import { isStrappableWeapon } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActWeaponStrapp",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActWeaponStrapp extends action_base {
  private readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActWeaponStrapp.__name);
    this.stateManager = stateManager;
  }

  public initialize(): void {
    super.initialize();

    const weapon: Optional<XR_game_object> = get_weapon(this.object, this.stateManager.target_state);

    if (isStrappableWeapon(weapon)) {
      this.object.set_item(object.strap, weapon);
    } else {
      this.object.set_item(object.idle, null);
    }
  }

  public execute(): void {
    super.execute();
  }

  public finalize(): void {
    super.finalize();
  }
}
