import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeCompanionState } from "@/engine/core/schemes/companion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActiveSection } from "@/engine/core/utils/object";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorNeedCompanion extends property_evaluator {
  public readonly state: ISchemeCompanionState;

  public constructor(storage: ISchemeCompanionState) {
    super(null, EvaluatorNeedCompanion.__name);
    this.state = storage;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return isActiveSection(this.object, this.state.section);
  }
}
