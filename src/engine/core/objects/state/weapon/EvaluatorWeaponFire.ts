import { LuabindClass, property_evaluator } from "xray16";

import { EWeaponAnimation } from "@/engine/core/objects/state";
import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorWeaponFire extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponFire.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return (
      states.get(this.stateManager.target_state).weapon === EWeaponAnimation.FIRE ||
      states.get(this.stateManager.target_state).weapon === EWeaponAnimation.SNIPER_FIRE
    );
  }
}
