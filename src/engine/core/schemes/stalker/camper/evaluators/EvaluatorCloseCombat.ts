import { LuabindClass, property_evaluator, time_global } from "xray16";

import { EEvaluatorId } from "@/engine/core/ai/planner/types";
import { ISchemeCamperState } from "@/engine/core/schemes/stalker/camper/camper_types";
import { isActiveSection } from "@/engine/core/utils/scheme";
import { ActionPlanner, Optional, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCloseCombat extends property_evaluator {
  public readonly state: ISchemeCamperState;
  public actionPlanner: Optional<ActionPlanner> = null;
  public isCloseCombat: boolean = false;

  public constructor(state: ISchemeCamperState) {
    super(null, EvaluatorCloseCombat.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    if (!isActiveSection(this.object, this.state.section)) {
      return true;
    }

    if (this.actionPlanner === null) {
      this.actionPlanner = this.object.motivation_action_manager();
    }

    if (!this.actionPlanner.evaluator(EEvaluatorId.ENEMY).evaluate()) {
      return false;
    }

    if (!this.actionPlanner.evaluator(EEvaluatorId.CAN_FIGHT).evaluate()) {
      return false;
    }

    if (this.actionPlanner.evaluator(EEvaluatorId.DANGER).evaluate()) {
      return true;
    }

    if (this.object.best_enemy() === null) {
      return this.isCloseCombat;
    }

    if (this.isCloseCombat) {
      const memoryTime: TTimestamp = this.object.memory_time(this.object.best_enemy()!);

      if (memoryTime !== null) {
        if (time_global() - memoryTime > 20_000) {
          this.isCloseCombat = false;
        }
      } else {
        this.isCloseCombat = false;
      }
    } else {
      this.isCloseCombat =
        this.object.position().distance_to(this.object.memory_position(this.object.best_enemy()!)) < this.state.radius;
    }

    return this.isCloseCombat;
  }
}
