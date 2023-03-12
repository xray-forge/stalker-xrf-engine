import { alife, LuabindClass, property_evaluator } from "xray16";

import type { Actor } from "@/mod/scripts/core/objects/alife/Actor";
import type { SmartTerrain } from "@/mod/scripts/core/objects/alife/smart/SmartTerrain";
import type { Squad } from "@/mod/scripts/core/objects/alife/Squad";
import { getObjectSquad } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorReachedTaskLocation extends property_evaluator {
  /**
   * todo;
   */
  public constructor() {
    super(null, EvaluatorReachedTaskLocation.__name);
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    const squad = getObjectSquad(this.object);

    if (squad && squad.current_action && squad.current_action.name === "reach_target") {
      const squad_target = alife().object<Actor | SmartTerrain | Squad>(squad.assigned_target_id!);

      if (squad_target === null) {
        return false;
      }

      return !squad_target.am_i_reached(squad);
    }

    return false;
  }
}
