import { LuabindClass, property_evaluator } from "xray16";

import { EWeaponAnimationType } from "@/engine/core/objects/state";
import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorWeaponUnstrapped extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponUnstrapped.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if weapon target state is unstrapped state.
   */
  public override evaluate(): boolean {
    const weapon: Optional<EWeaponAnimationType> = states.get(this.stateManager.target_state).weapon;

    return (
      weapon !== null &&
      (weapon === EWeaponAnimationType.UNSTRAPPED ||
        weapon === EWeaponAnimationType.FIRE ||
        weapon === EWeaponAnimationType.SNIPER_FIRE)
    );
  }
}
