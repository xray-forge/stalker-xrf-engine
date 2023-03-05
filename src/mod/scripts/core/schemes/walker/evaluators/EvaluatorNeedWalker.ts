import { property_evaluator } from "xray16";

import { ISchemeWalkerState } from "@/mod/scripts/core/schemes/walker";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isSchemeActive } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedWalker");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedWalker extends property_evaluator {
  public readonly state: ISchemeWalkerState;

  public constructor(storage: ISchemeWalkerState) {
    super(null, EvaluatorNeedWalker.__name);
    this.state = storage;
  }

  public override evaluate(): boolean {
    return isSchemeActive(this.object, this.state);
  }
}
