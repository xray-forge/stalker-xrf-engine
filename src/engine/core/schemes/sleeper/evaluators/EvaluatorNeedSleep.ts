import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeSleeperState } from "@/engine/core/schemes/sleeper";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActiveSection } from "@/engine/core/utils/scheme/scheme_logic";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to verify if object should sleep.
 */
@LuabindClass()
export class EvaluatorNeedSleep extends property_evaluator {
  public state: ISchemeSleeperState;

  public constructor(state: ISchemeSleeperState) {
    super(null, EvaluatorNeedSleep.__name);
    this.state = state;
  }

  /**
   * Check if sleeper scheme is active.
   */
  public override evaluate(): boolean {
    return isActiveSection(this.object, this.state.section);
  }
}
