import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { EEvaluatorId } from "@/engine/core/objects/ai/types";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectWounded } from "@/engine/core/utils/object";
import { FALSE } from "@/engine/lib/constants/words";
import { ActionPlanner, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check if object is ready to communicate.
 */
@LuabindClass()
export class EvaluatorContact extends property_evaluator {
  public readonly state: ISchemeMeetState;
  public actionPlanner: Optional<ActionPlanner> = null;

  public constructor(state: ISchemeMeetState) {
    super(null, EvaluatorContact.__name);
    this.state = state;
  }

  /**
   * Evaluate whether object is ready to contact with actor.
   * Based on distance wait for actor to speak or continue doing other things.
   */
  public override evaluate(): boolean {
    if (!this.state.isMeetInitialized) {
      return false;
    }

    // No alive actor.
    if (!registry.actor?.alive()) {
      return false;
    }

    this.state.meetManager.update();

    // Wounded or have enemy, cannot speak.
    if (isObjectWounded(this.object.id()) || this.object.best_enemy() !== null) {
      return false;
    }

    if (this.actionPlanner === null) {
      this.actionPlanner = this.object.motivation_action_manager();
    }

    // In combat/searching for enemy, cannot speak.
    if (this.actionPlanner.evaluator(EEvaluatorId.ENEMY).evaluate()) {
      this.state.meetManager.use = FALSE;
      this.object.disable_talk();

      return false;
    }

    return this.state.meetManager.currentDistanceToSpeaker !== null;
  }
}
