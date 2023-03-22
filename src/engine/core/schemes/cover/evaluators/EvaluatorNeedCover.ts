import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeCoverState } from "@/engine/core/schemes/cover";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isSchemeActive } from "@/engine/core/utils/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedCover extends property_evaluator {
  public readonly state: ISchemeCoverState;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeCoverState) {
    super(null, EvaluatorNeedCover.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return isSchemeActive(this.object, this.state);
  }
}