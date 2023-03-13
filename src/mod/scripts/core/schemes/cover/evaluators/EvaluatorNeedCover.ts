import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeCoverState } from "@/mod/scripts/core/schemes/cover";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isSchemeActive } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedCover extends property_evaluator {
  public readonly state: ISchemeCoverState;

  /**
   * todo;
   */
  public constructor(state: ISchemeCoverState) {
    super(null, EvaluatorNeedCover.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return isSchemeActive(this.object, this.state);
  }
}
