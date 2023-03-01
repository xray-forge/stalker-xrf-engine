import { property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isSchemeActive } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedSleep");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedSleep extends property_evaluator {
  public state: IStoredObject;

  public constructor(storage: IStoredObject) {
    super(null, EvaluatorNeedSleep.__name);
    this.state = storage;
  }

  public override evaluate(): boolean {
    return isSchemeActive(this.object, this.state);
  }
}
