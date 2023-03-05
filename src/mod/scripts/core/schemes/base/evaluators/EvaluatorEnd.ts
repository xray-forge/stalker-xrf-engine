import { property_evaluator } from "xray16";

import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorEnd");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorEnd extends property_evaluator {
  public readonly state: IBaseSchemeState;

  public constructor(storage: IBaseSchemeState) {
    super(null, EvaluatorEnd.__name);
    this.state = storage;
  }

  public override evaluate(): boolean {
    return !isActiveSection(this.object, this.state.section);
  }
}
