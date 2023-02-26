import { action_base, object } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActWeaponNone",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActWeaponNone extends action_base {
  private readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActWeaponNone.__name);
    this.stateManager = stateManager;
  }

  public initialize(): void {
    super.initialize();
    this.object.set_item(object.idle, null);
  }

  public execute(): void {
    super.execute();
  }

  public finalize(): void {
    super.finalize();
  }
}
