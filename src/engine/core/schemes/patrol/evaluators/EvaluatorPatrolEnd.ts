import { LuabindClass, property_evaluator } from "xray16";

import { ISchemePatrolState } from "@/engine/core/schemes/patrol";
import { isActiveSection } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorPatrolEnd extends property_evaluator {
  public readonly state: ISchemePatrolState;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemePatrolState) {
    super(null, EvaluatorPatrolEnd.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return !isActiveSection(this.object, this.state.section);
  }
}
