import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeSleeperState } from "@/engine/scripts/core/schemes/sleeper";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { isSchemeActive } from "@/engine/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger($filename);

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
