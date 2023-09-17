import { alife, LuabindClass, property_evaluator } from "xray16";

import { TSimulationObject } from "@/engine/core/managers/simulation";
import { SquadReachTargetAction } from "@/engine/core/objects/server/squad/action";
import type { Squad } from "@/engine/core/objects/server/squad/Squad";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSquad } from "@/engine/core/utils/object";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether object has reached task location.
 */
@LuabindClass()
export class EvaluatorReachedTaskLocation extends property_evaluator {
  public constructor() {
    super(null, EvaluatorReachedTaskLocation.__name);
  }

  /**
   * Evaluate if target is still reaching some target with squad.
   */
  public override evaluate(): boolean {
    const squad: Optional<Squad> = getObjectSquad(this.object);

    if (squad?.currentAction?.name !== SquadReachTargetAction.ACTION_NAME) {
      return false;
    }

    const simulationTarget: Optional<TSimulationObject> = alife().object(squad.assignedTargetId!);

    return simulationTarget !== null && !simulationTarget.isReachedBySquad(squad);
  }
}
