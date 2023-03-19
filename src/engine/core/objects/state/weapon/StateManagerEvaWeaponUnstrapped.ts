import { LuabindClass, property_evaluator } from "xray16";

import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StateManager } from "@/engine/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaWeaponUnstrapped",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaWeaponUnstrapped extends property_evaluator {
  private readonly stateManager: StateManager;

  /**
   * todo;
   */ public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaWeaponUnstrapped.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    const weapon: Optional<string> = states.get(this.stateManager.target_state).weapon;

    return weapon !== null && (weapon === "unstrapped" || weapon === "fire" || weapon === "sniper_fire");
  }
}
