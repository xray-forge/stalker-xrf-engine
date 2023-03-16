import { LuabindClass, property_evaluator } from "xray16";

import { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";
import { isActiveSection } from "@/mod/scripts/utils/check/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorEnd extends property_evaluator {
  public readonly state: IBaseSchemeState;

  /**
   * todo;
   */
  public constructor(storage: IBaseSchemeState) {
    super(null, EvaluatorEnd.__name);
    this.state = storage;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return !isActiveSection(this.object, this.state.section);
  }
}
