import { LuabindClass, property_evaluator } from "xray16";

import { ISchemePatrolState } from "@/engine/core/schemes/stalker/patrol";

/**
 * Evaluate whether object is patrol commander.
 */
@LuabindClass()
export class EvaluatorPatrolCommander extends property_evaluator {
  public readonly state: ISchemePatrolState;

  public constructor(state: ISchemePatrolState) {
    super(null, EvaluatorPatrolCommander.__name);
    this.state = state;
  }

  public override evaluate(): boolean {
    return this.state.patrolManager.commanderId === this.object.id();
  }
}
