import { action_base, object, XR_game_object } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { get_weapon } from "@/mod/scripts/core/state_management/weapon/StateManagerWeapon";
import { setItemCondition } from "@/mod/scripts/utils/alife";
import { isStrappableWeapon } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActWeaponDrop",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActWeaponDrop extends action_base {
  private readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActWeaponDrop.__name);
    this.stateManager = stateManager;
  }

  public initialize(): void {
    super.initialize();

    const weapon: Optional<XR_game_object> = get_weapon(this.object, this.stateManager.target_state);

    if (isStrappableWeapon(weapon)) {
      this.object.set_item(object.drop, weapon);
      // todo: Configured condition in one place.
      setItemCondition(weapon, math.random(40, 80));
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
