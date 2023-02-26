import { property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isSchemeActive } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedCover");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedCover extends property_evaluator {
  public state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, EvaluatorNeedCover.__name);
    this.state = state;
  }

  public evaluate(): boolean {
    return isSchemeActive(this.object, this.state);
  }
}
