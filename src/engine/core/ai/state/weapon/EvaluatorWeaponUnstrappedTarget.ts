import { LuabindClass, property_evaluator } from "xray16";
import { Nillable } from "xray16/lib";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";
import { EWeaponAnimation } from "@/engine/core/animation/types";

/**
 * Whether weapon should be in hands.
 */
@LuabindClass()
export class EvaluatorWeaponUnstrappedTarget extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorWeaponUnstrappedTarget.__name);
    this.controller = controller;
  }

  /**
   * Check if weapon target state is unstrapped state.
   */
  public override evaluate(): boolean {
    const weapon: Nillable<EWeaponAnimation> = states.get(this.controller.targetState).weapon;

    return (
      weapon === EWeaponAnimation.UNSTRAPPED ||
      weapon === EWeaponAnimation.FIRE ||
      weapon === EWeaponAnimation.SNIPER_FIRE
    );
  }
}
