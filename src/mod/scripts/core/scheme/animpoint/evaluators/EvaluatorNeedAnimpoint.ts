import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeAnimpointState } from "@/mod/scripts/core/scheme/animpoint/ISchemeAnimpointState";
import { isActiveSection } from "@/mod/scripts/utils/check/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

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
