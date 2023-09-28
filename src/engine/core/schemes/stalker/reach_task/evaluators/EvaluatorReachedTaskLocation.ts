import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import type { TSimulationObject } from "@/engine/core/managers/simulation";
import type { Squad } from "@/engine/core/objects/server/squad/Squad";
import { ESquadActionType } from "@/engine/core/objects/server/squad/squad_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSquad } from "@/engine/core/utils/squad";
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

    if (squad?.currentAction?.type !== ESquadActionType.REACH_TARGET) {
      return false;
    }

    const simulationTarget: Optional<TSimulationObject> = registry.simulator.object(squad.assignedTargetId!);

    return simulationTarget !== null && !simulationTarget.isReachedBySquad(squad);
  }
}
