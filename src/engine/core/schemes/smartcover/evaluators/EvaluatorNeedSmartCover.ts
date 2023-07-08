import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeSmartCoverState } from "@/engine/core/schemes/smartcover";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActiveSection } from "@/engine/core/utils/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedSmartCover extends property_evaluator {
  public readonly state: ISchemeSmartCoverState;

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
