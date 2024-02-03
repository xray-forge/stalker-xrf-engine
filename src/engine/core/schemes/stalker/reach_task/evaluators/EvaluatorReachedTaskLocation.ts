import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import type { TSimulationObject } from "@/engine/core/managers/simulation";
import type { Squad } from "@/engine/core/objects/squad/Squad";
import { ESquadActionType } from "@/engine/core/objects/squad/squad_types";
import { getObjectSquad } from "@/engine/core/utils/squad";
import { Optional } from "@/engine/lib/types";

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

    if (squad?.currentAction?.type !== ESquadActionType.REACH_TARGET) {
      return false;
    }

    const simulationTarget: Optional<TSimulationObject> = registry.simulator.object(squad.assignedTargetId!);

    return simulationTarget !== null && !simulationTarget.isReachedBySimulationObject(squad);
  }
}
