import { property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

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

  public constructor(st: StateManager) {
    super(null, StateManagerEvaWeaponUnstrapped.__name);
    this.stateManager = st;
  }

  public evaluate(): boolean {
    const weapon: Optional<string> = states.get(this.stateManager.target_state).weapon;

    return weapon !== null && (weapon === "unstrapped" || weapon === "fire" || weapon === "sniper_fire");
  }
}
