import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeSmartCoverState } from "@/mod/scripts/core/schemes/smartcover";
import { isActiveSection } from "@/mod/scripts/utils/check/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorUseSmartCoverInCombat extends property_evaluator {
  public readonly state: ISchemeSmartCoverState;

  /**
   * todo;
   */
  public constructor(state: ISchemeSmartCoverState) {
    super(null, EvaluatorUseSmartCoverInCombat.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    if (isActiveSection(this.object, this.state.section)) {
      return this.state.use_in_combat;
    }

    return false;
  }
}
