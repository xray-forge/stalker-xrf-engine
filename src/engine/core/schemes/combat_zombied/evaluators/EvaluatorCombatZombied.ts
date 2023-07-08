import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectCommunity } from "@/engine/core/utils/object";
import { communities } from "@/engine/lib/constants/communities";

const logger: LuaLogger = new LuaLogger($filename);

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
