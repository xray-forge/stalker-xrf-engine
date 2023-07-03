import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeRemarkState } from "@/engine/core/schemes/remark";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActiveSection } from "@/engine/core/utils/object";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo: Find all evaluators and create single shared 'is scheme active evaluator'
 */
@LuabindClass()
export class EvaluatorNeedRemark extends property_evaluator {
  public readonly state: ISchemeRemarkState;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeRemarkState) {
    super(null, EvaluatorNeedRemark.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return isActiveSection(this.object, this.state.section);
  }
}
