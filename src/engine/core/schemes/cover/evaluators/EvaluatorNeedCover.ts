import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeCoverState } from "@/engine/core/schemes/cover";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActiveSectionState } from "@/engine/core/utils/scheme/scheme_logic";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check whether cover needed.
 */
@LuabindClass()
export class EvaluatorNeedCover extends property_evaluator {
  public readonly state: ISchemeCoverState;

  public constructor(state: ISchemeCoverState) {
    super(null, EvaluatorNeedCover.__name);
    this.state = state;
  }

  /**
   * Check whether cover scheme is active.
   */
  public override evaluate(): boolean {
    return isActiveSectionState(this.object, this.state);
  }
}
