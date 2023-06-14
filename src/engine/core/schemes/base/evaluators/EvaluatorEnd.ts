import { LuabindClass, property_evaluator } from "xray16";

import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { isActiveSection } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluate whether section is still active.
 */
@LuabindClass()
export class EvaluatorEnd extends property_evaluator {
  public readonly state: IBaseSchemeState;

  public constructor(state: IBaseSchemeState) {
    super(null, EvaluatorEnd.__name);
    this.state = state;
  }

  /**
   * Check whether evaluator scheme state is still active or ended.
   */
  public override evaluate(): boolean {
    return !isActiveSection(this.object, this.state.section);
  }
}
