import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeAnimpointState } from "@/mod/scripts/core/schemes/animpoint/ISchemeAnimpointState";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedAnimpoint extends property_evaluator {
  public readonly state: ISchemeAnimpointState;

  /**
   * todo;
   */
  public constructor(state: ISchemeAnimpointState) {
    super(null, EvaluatorNeedAnimpoint.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return isActiveSection(this.object, this.state.section);
  }
}
