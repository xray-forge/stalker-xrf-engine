import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover";
import { isActiveSection } from "@/engine/core/utils/scheme";

/**
 * Check if smart cover can be used in combat.
 */
@LuabindClass()
export class EvaluatorUseSmartCoverInCombat extends property_evaluator {
  public readonly state: ISchemeSmartCoverState;

  public constructor(state: ISchemeSmartCoverState) {
    super(null, EvaluatorUseSmartCoverInCombat.__name);
    this.state = state;
  }

  /**
   * Verify if currently smart cover section is active and usage in combat is enabled.
   */
  public override evaluate(): boolean {
    return isActiveSection(this.object, this.state.section) ? this.state.useInCombat : false;
  }
}
