import { LuabindClass, property_evaluator } from "xray16";
import { Nillable } from "xray16/lib";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";
import { EWeaponAnimation } from "@/engine/core/animation/types";

/**
 * Whether object is in fire weapon state.
 */
@LuabindClass()
export class EvaluatorWeaponFireTarget extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponFireTarget.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether weapon fire state is active.
   */
  public override evaluate(): boolean {
    const weaponAnimation: Nillable<EWeaponAnimation> = states.get(this.stateManager.targetState).weapon;

    return weaponAnimation === EWeaponAnimation.FIRE || weaponAnimation === EWeaponAnimation.SNIPER_FIRE;
  }
}
