import { property_evaluator } from "xray16";

import { communities } from "@/mod/globals/communities";
import { IStoredObject } from "@/mod/scripts/core/database";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorCombatZombied");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCombatZombied extends property_evaluator {
  public readonly state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, EvaluatorCombatZombied.__name);
    this.state = state;
  }

  public override evaluate(): boolean {
    return getCharacterCommunity(this.object) === communities.zombied;
  }
}
