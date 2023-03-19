import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeCompanionState } from "@/engine/core/schemes/companion";
import { isActiveSection } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";

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
