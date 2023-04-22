import { alife, LuabindClass, property_evaluator } from "xray16";

import { SquadReachTargetAction } from "@/engine/core/objects/server/squad/action";
import type { Squad } from "@/engine/core/objects/server/squad/Squad";
import { TSimulationObject } from "@/engine/core/objects/server/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSquad } from "@/engine/core/utils/object";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorReachedTaskLocation extends property_evaluator {
  public constructor() {
    super(null, EvaluatorReachedTaskLocation.__name);
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    const squad: Optional<Squad> = getObjectSquad(this.object);

    if (squad?.currentAction?.name === SquadReachTargetAction.ACTION_NAME) {
      const squadTarget: Optional<TSimulationObject> = alife().object(squad.assignedTargetId!);

      if (squadTarget === null) {
        return false;
      }

      return !squadTarget.isReachedBySquad(squad);
    }

    return false;
  }
}
