import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { EScriptCombatType, ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";

/**
 * Evaluator to check if current combat type is camper combat.
 */
@LuabindClass()
export class EvaluatorCombatCamper extends property_evaluator {
  public readonly state: ISchemeCombatState;

  public constructor(state: ISchemeCombatState) {
    super(null, EvaluatorCombatCamper.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    // todo: Probably get from this.state? Maybe invalid.
    return registry.objects.get(this.object.id()).scriptCombatType === EScriptCombatType.CAMPER;
  }
}
