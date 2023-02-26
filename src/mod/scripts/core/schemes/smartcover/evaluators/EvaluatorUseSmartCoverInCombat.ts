import { property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorUseSmartCoverInCombat");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorUseSmartCoverInCombat extends property_evaluator {
  public state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, EvaluatorUseSmartCoverInCombat.__name);
    this.state = state;
  }

  public evaluate(): boolean {
    if (isActiveSection(this.object, this.state.section)) {
      return this.state.use_in_combat;
    }

    return false;
  }
}
