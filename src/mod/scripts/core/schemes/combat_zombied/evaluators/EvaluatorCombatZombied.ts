import { property_evaluator, XR_property_evaluator } from "xray16";

import { communities } from "@/mod/globals/communities";
import { IStoredObject } from "@/mod/scripts/core/database";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorCombatZombied");

export interface IEvaluatorCombatZombied extends XR_property_evaluator {
  state: IStoredObject;
}

export const EvaluatorCombatZombied: IEvaluatorCombatZombied = declare_xr_class(
  "EvaluatorCombatZombied",
  property_evaluator,
  {
    __init(name: string, state: IStoredObject): void {
      property_evaluator.__init(this, null, name);
      this.state = state;
    },
    evaluate(): boolean {
      return getCharacterCommunity(this.object) === communities.zombied;
    },
  } as IEvaluatorCombatZombied
);
