import { LuabindClass, property_evaluator } from "xray16";

import { communities } from "@/mod/globals/communities";
import { ISchemeCombatState } from "@/mod/scripts/core/scheme/combat";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

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
