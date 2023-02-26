import { property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedSmartCover");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedSmartCover extends property_evaluator {
  public state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, EvaluatorNeedSmartCover.__name);
    this.state = state;
  }

  public evaluate(): boolean {
    return isActiveSection(this.object, this.state.section);
  }
}
