import { world_property } from "xray16";

import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { StalkerStateManager } from "@/engine/core/objects/state";
import { ActionMentalDanger, ActionMentalFree, ActionMentalPanic } from "@/engine/core/objects/state/mental";
import { ActionPlanner } from "@/engine/lib/types";

/**
 * Setup GOAP logics related to mental state changes of stalkers.
 *
 * @param planner - action planner to configure
 * @param stateManager - target object state manager
 */
export function setupStalkerMentalStatePlanner(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  const mentalFreeAction: ActionMentalFree = new ActionMentalFree(stateManager);

  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_FREE, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, true));
  mentalFreeAction.add_effect(new world_property(EStateEvaluatorId.MENTAL, true));
  planner.add_action(EStateActionId.MENTAL_FREE, mentalFreeAction);

  const mentalDangerAction: ActionMentalDanger = new ActionMentalDanger(stateManager);

  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, false));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_DANGER, true));
  mentalDangerAction.add_effect(new world_property(EStateEvaluatorId.MENTAL, true));
  mentalDangerAction.add_effect(new world_property(EStateEvaluatorId.MENTAL_DANGER_NOW, true));
  planner.add_action(EStateActionId.MENTAL_DANGER, mentalDangerAction);

  const mentalPanicAction: ActionMentalPanic = new ActionMentalPanic(stateManager);

  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_PANIC, true));
  mentalPanicAction.add_effect(new world_property(EStateEvaluatorId.MENTAL, true));
  planner.add_action(EStateActionId.MENTAL_PANIC, mentalPanicAction);
}
