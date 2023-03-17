import { LuabindClass, property_evaluator } from "xray16";

import { communities } from "@/engine/lib/constants/communities";
import { ISchemeCombatState } from "@/engine/scripts/core/schemes/combat";
import { getCharacterCommunity } from "@/engine/scripts/utils/alife";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCombatZombied extends property_evaluator {
  public readonly state: ISchemeCombatState;

  /**
   * todo;
   */
  public constructor(state: ISchemeCombatState) {
    super(null, EvaluatorCombatZombied.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return getCharacterCommunity(this.object) === communities.zombied;
  }
}
