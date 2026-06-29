import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";

/**
 * Evaluator checking whether scripted combat logic should take over the object's combat behaviour.
 */
@LuabindClass()
export class EvaluatorCheckCombat extends property_evaluator {
  public readonly state: ISchemeCombatState;

  public constructor(state: ISchemeCombatState) {
    super(null, EvaluatorCheckCombat.__name);
    this.state = state;
  }

  /**
   * Evaluate whether a scripted combat type is active for the object with an enemy present, for the planner.
   *
   * @returns Whether scripted combat logic should be applied.
   */
  public override evaluate(): boolean {
    if (this.state.enabled && this.object.best_enemy()) {
      return registry.actor !== null && this.state.scriptCombatType !== null;
    }

    return false;
  }
}
