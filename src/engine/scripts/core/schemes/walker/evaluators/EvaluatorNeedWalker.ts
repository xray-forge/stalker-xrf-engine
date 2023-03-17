import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeWalkerState } from "@/engine/scripts/core/schemes/walker";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { isSchemeActive } from "@/engine/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedWalker extends property_evaluator {
  public readonly state: ISchemeWalkerState;

  /**
   * todo;
   */
  public constructor(storage: ISchemeWalkerState) {
    super(null, EvaluatorNeedWalker.__name);
    this.state = storage;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return isSchemeActive(this.object, this.state);
  }
}
