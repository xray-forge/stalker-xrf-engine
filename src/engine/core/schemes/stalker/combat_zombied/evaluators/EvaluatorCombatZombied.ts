import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { communities } from "@/engine/lib/constants/communities";

/**
 * Checker to verify whether zombied combat style is applied.
 */
@LuabindClass()
export class EvaluatorCombatZombied extends property_evaluator {
  public readonly state: ISchemeCombatState;

  public constructor(state: ISchemeCombatState) {
    super(null, EvaluatorCombatZombied.__name);
    this.state = state;
  }

  /**
   * Check whether zombied combat should be applied.
   */
  public override evaluate(): boolean {
    return getObjectCommunity(this.object) === communities.zombied;
  }
}
