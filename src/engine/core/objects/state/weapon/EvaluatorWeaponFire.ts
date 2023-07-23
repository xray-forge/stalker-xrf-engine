import { LuabindClass, property_evaluator } from "xray16";

import { states } from "@/engine/core/objects/animation/states";
import { EWeaponAnimation } from "@/engine/core/objects/state";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Whether object should fire weapon.
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
      states.get(this.stateManager.targetState).weapon === EWeaponAnimation.FIRE ||
      states.get(this.stateManager.targetState).weapon === EWeaponAnimation.SNIPER_FIRE
    );
  }
}
