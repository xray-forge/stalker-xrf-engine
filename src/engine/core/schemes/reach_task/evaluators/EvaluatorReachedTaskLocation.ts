import { alife, LuabindClass, property_evaluator } from "xray16";

import type { Actor } from "@/engine/core/objects/alife/Actor";
import type { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import type { Squad } from "@/engine/core/objects/alife/Squad";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSquad } from "@/engine/core/utils/object";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorReachedTaskLocation extends property_evaluator {
  /**
   * todo: Description.
   */
  public constructor() {
    super(null, EvaluatorReachedTaskLocation.__name);
  }

  /**
   * todo: Description.
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
