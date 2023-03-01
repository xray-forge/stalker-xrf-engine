import { property_evaluator, XR_property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isSchemeActive } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedWalker");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedWalker extends property_evaluator {
  public readonly state: IStoredObject;

  public constructor(storage: IStoredObject) {
    super(null, EvaluatorNeedWalker.__name);
    this.state = storage;
  }

  public override evaluate(): boolean {
    return isSchemeActive(this.object, this.state);
  }
}
