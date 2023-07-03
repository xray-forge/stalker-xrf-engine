import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeWalkerState } from "@/engine/core/schemes/walker";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isSectionActive } from "@/engine/core/utils/scheme/scheme_logic";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check whether walker scheme is active.
 */
@LuabindClass()
export class EvaluatorNeedWalker extends property_evaluator {
  public readonly state: ISchemeWalkerState;

  public constructor(storage: ISchemeWalkerState) {
    super(null, EvaluatorNeedWalker.__name);
    this.state = storage;
  }

  /**
   * Check whether walker scheme is active and should still continue processing.
   */
  public override evaluate(): boolean {
    return isSectionActive(this.object, this.state);
  }
}
