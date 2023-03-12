import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeSleeperState } from "@/mod/scripts/core/schemes/sleeper";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isSchemeActive } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedSleep extends property_evaluator {
  public state: ISchemeSleeperState;

  /**
   * todo;
   */
  public constructor(state: ISchemeSleeperState) {
    super(null, EvaluatorNeedSleep.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return isSchemeActive(this.object, this.state);
  }
}
