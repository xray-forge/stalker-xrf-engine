import { world_property } from "xray16";
import { ActionPlanner } from "xray16/alias";

import { StalkerStateController } from "@/engine/core/ai/state";
import { ActionMentalDanger, ActionMentalFree, ActionMentalPanic } from "@/engine/core/ai/state/mental";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";

/**
 * Setup GOAP logics related to mental state changes of stalkers.
 *
 * @param planner - Action planner to configure.
 * @param controller - Target object state controller.
 */
export function setupStalkerMentalStatePlanner(planner: ActionPlanner, controller: StalkerStateController): void {
  const mentalFreeAction: ActionMentalFree = new ActionMentalFree(controller);

  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, false));
  // --	action.add_precondition    (new world_property(EStateControllerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateControllerProperty.movement,               true))
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_FREE_TARGET, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_SET, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, true));
  mentalFreeAction.add_effect(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  planner.add_action(EStateActionId.MENTAL_FREE, mentalFreeAction);

  const mentalDangerAction: ActionMentalDanger = new ActionMentalDanger(controller);

  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, false));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  // --	action.add_precondition    (new world_property(EStateControllerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateControllerProperty.movement,               true))
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_DANGER_TARGET, true));
  mentalDangerAction.add_effect(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  mentalDangerAction.add_effect(new world_property(EStateEvaluatorId.MENTAL_DANGER_NOW, true));
  planner.add_action(EStateActionId.MENTAL_DANGER, mentalDangerAction);

  const mentalPanicAction: ActionMentalPanic = new ActionMentalPanic(controller);

  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, false));
  // --	action.add_precondition    (new world_property(EStateControllerProperty.weapon,                 true))
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_PANIC_TARGET, true));
  mentalPanicAction.add_effect(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  planner.add_action(EStateActionId.MENTAL_PANIC, mentalPanicAction);
}
