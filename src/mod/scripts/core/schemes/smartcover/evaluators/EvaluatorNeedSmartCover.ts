import { property_evaluator } from "xray16";

import { ISchemeSmartCoverState } from "@/mod/scripts/core/schemes/smartcover";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorNeedSmartCover");

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

  public override evaluate(): boolean {
    return isActiveSection(this.object, this.state.section);
  }
}
