import { property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedRemark");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedRemark extends property_evaluator {
  public readonly state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, EvaluatorNeedRemark.__name);
    this.state = state;
  }

  public override evaluate(): boolean {
    return isActiveSection(this.object, this.state.section);
  }
}
