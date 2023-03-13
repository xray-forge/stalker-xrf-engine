import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeCompanionState } from "@/mod/scripts/core/schemes/companion";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedCompanion extends property_evaluator {
  public readonly state: ISchemeCompanionState;

  /**
   * todo;
   */
  public constructor(storage: ISchemeCompanionState) {
    super(null, EvaluatorNeedCompanion.__name);
    this.state = storage;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return isActiveSection(this.object, this.state.section);
  }
}
