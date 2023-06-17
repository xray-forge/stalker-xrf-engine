import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeWalkerState } from "@/engine/core/schemes/walker";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isSectionActive } from "@/engine/core/utils/scheme/logic";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedWalker extends property_evaluator {
  public readonly state: ISchemeWalkerState;

  /**
   * todo: Description.
   */
  public constructor(storage: ISchemeWalkerState) {
    super(null, EvaluatorNeedWalker.__name);
    this.state = storage;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return isSectionActive(this.object, this.state);
  }
}
