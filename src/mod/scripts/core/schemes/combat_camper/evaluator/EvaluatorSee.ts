import { property_evaluator, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorSee");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorSee extends property_evaluator {
  public readonly state: IStoredObject;

  public constructor(storage: IStoredObject) {
    super(null, EvaluatorSee.__name);
    this.state = storage;
  }

  public override evaluate(): boolean {
    const bestEnemy: Optional<XR_game_object> = this.object.best_enemy();

    if (bestEnemy !== null && this.object.alive() && this.object.see(bestEnemy)) {
      this.state.last_seen_pos = bestEnemy.position();

      return true;
    } else {
      return false;
    }
  }
}
