import { action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { get_idle_state, get_weapon } from "@/mod/scripts/core/state_management/weapon/StateManagerWeapon";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActWeaponUnstrapp",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActWeaponUnstrapp extends action_base {
  public stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActWeaponUnstrapp.__name);
    this.stateManager = stateManager;
  }

  public override initialize(): void {
    super.initialize();
    this.object.set_item(
      get_idle_state(this.stateManager.target_state),
      get_weapon(this.object, this.stateManager.target_state)
    );
  }

  public override execute(): void {
    super.execute();
  }

  public override finalize(): void {
    super.finalize();
  }
}
