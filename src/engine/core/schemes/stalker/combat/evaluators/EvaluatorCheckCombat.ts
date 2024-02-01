import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCheckCombat extends property_evaluator {
  public readonly state: ISchemeCombatState;

  public constructor(state: ISchemeCombatState) {
    super(null, EvaluatorCheckCombat.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    if (this.state.enabled && this.object.best_enemy()) {
      return registry.actor !== null && this.state.scriptCombatType !== null;
    }

    return false;
  }
}
