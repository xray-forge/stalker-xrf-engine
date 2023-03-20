import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeSmartCoverState } from "@/engine/core/schemes/smartcover";
import { isActiveSection } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedSmartCover extends property_evaluator {
  public readonly state: ISchemeSmartCoverState;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeSmartCoverState) {
    super(null, EvaluatorNeedSmartCover.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return isActiveSection(this.object, this.state.section);
  }
}
