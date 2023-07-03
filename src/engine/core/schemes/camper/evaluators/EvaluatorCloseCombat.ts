import { LuabindClass, property_evaluator, stalker_ids, time_global } from "xray16";

import { EEvaluatorId } from "@/engine/core/schemes/base";
import { ISchemeCamperState } from "@/engine/core/schemes/camper/ISchemeCamperState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActiveSection } from "@/engine/core/utils/object";
import { ActionPlanner, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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

    if (!this.actionPlanner.evaluator(stalker_ids.property_enemy).evaluate()) {
      return false;
    }

    if (!this.actionPlanner.evaluator(EEvaluatorId.CAN_FIGHT).evaluate()) {
      return false;
    }

    if (this.actionPlanner.evaluator(stalker_ids.property_danger).evaluate()) {
      return true;
    }

    if (this.object.best_enemy() === null) {
      return this.isCloseCombat;
    }

    if (this.isCloseCombat) {
      const memoryTime: number = this.object.memory_time(this.object.best_enemy()!);

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
