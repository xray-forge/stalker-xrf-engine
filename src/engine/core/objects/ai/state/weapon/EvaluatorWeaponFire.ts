import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EWeaponAnimation } from "@/engine/core/objects/animation";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Whether object is in fire weapon state.
 */
@LuabindClass()
export class EvaluatorWeaponFire extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponFire.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether weapon fire state is active.
   */
  public override evaluate(): boolean {
    return (
      states.get(this.stateManager.targetState).weapon === EWeaponAnimation.FIRE ||
      states.get(this.stateManager.targetState).weapon === EWeaponAnimation.SNIPER_FIRE
    );
  }
}
