import { LuabindClass, property_evaluator } from "xray16";

import { STRINGIFIED_FALSE } from "@/engine/lib/constants/words";
import { pstor_retrieve } from "@/engine/scripts/core/database/pstor";
import { ISchemeWoundedState } from "@/engine/scripts/core/schemes/wounded";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCanFight extends property_evaluator {
  public readonly state: ISchemeWoundedState;

  /**
   * todo;
   */
  public constructor(state: ISchemeWoundedState) {
    super(null, EvaluatorCanFight.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    if (this.object.critically_wounded()) {
      return true;
    }

    return pstor_retrieve(this.object, "wounded_fight") !== STRINGIFIED_FALSE;
  }
}
