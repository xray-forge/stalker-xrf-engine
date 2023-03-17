import { action_base, LuabindClass, object } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/objects/state/StateManager";
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

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerActWeaponNone.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_item(object.idle, null);
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();
  }

  /**
   * todo;
   */
  public override finalize(): void {
    super.finalize();
  }
}
