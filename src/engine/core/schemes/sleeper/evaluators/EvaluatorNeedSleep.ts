import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeSleeperState } from "@/engine/core/schemes/sleeper";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActiveSectionState } from "@/engine/core/utils/scheme/scheme_logic";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedSleep extends property_evaluator {
  public state: ISchemeSleeperState;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeSleeperState) {
    super(null, EvaluatorNeedSleep.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return isActiveSectionState(this.object, this.state);
  }
}
