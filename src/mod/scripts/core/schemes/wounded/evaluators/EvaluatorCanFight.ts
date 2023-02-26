import { property_evaluator } from "xray16";

import { STRINGIFIED_FALSE } from "@/mod/globals/lua";
import { IStoredObject } from "@/mod/scripts/core/database";
import { pstor_retrieve } from "@/mod/scripts/core/database/pstor";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorCanFight");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCanFight extends property_evaluator {
  public state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, EvaluatorCanFight.__name);
    this.state = state;
  }

  public evaluate(): boolean {
    if (this.object.critically_wounded()) {
      return true;
    }

    return pstor_retrieve(this.object, "wounded_fight") !== STRINGIFIED_FALSE;
  }
}
