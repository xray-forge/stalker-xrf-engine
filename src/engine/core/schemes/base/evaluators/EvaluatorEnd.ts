import { LuabindClass, property_evaluator } from "xray16";

import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { isActiveSection } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";

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
