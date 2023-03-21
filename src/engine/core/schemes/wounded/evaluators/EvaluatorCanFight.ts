import { LuabindClass, property_evaluator } from "xray16";

import { portableStoreGet } from "@/engine/core/database/portable_store";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { LuaLogger } from "@/engine/core/utils/logging";
import { FALSE } from "@/engine/lib/constants/words";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCanFight extends property_evaluator {
  public readonly state: ISchemeWoundedState;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeWoundedState) {
    super(null, EvaluatorCanFight.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    if (this.object.critically_wounded()) {
      return true;
    }

    return portableStoreGet(this.object, "wounded_fight") !== FALSE;
  }
}
