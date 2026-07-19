import { world_property } from "xray16";
import { ActionPlanner } from "xray16/alias";

import { StalkerStateController } from "@/engine/core/ai/state";
import { ActionAnimationStart, ActionAnimationStop } from "@/engine/core/ai/state/animation";
import { ActionStateLocked } from "@/engine/core/ai/state/state";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";

/**
 * Setup GOAP logics related to animation execution of stalkers.
 *
 * @param planner - Action planner to configure.
 * @param controller - Target object state controller.
 */
export function setupStalkerAnimationStatePlanner(planner: ActionPlanner, controller: StalkerStateController): void {
  // -- START
  const animationStartAction: ActionAnimationStart = new ActionAnimationStart(controller);

  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.IN_SMARTCOVER, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SET, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_SET, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_SET, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, false));
  animationStartAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION, true));
  planner.add_action(EStateActionId.ANIMATION_START, animationStartAction);

  // -- STOP
  const animationStopAction: ActionAnimationStop = new ActionAnimationStop(controller);

  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  // --action.add_precondition    (new world_property(EStateControllerProperty.animstate,              true))
  // --action.add_precondition    (new world_property(EStateControllerProperty.animation,              false))
  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, true));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION, true));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, false));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  planner.add_action(EStateActionId.ANIMATION_STOP, animationStopAction);

  const lockedAnimationAction: ActionStateLocked = new ActionStateLocked(controller, "ActionStateLockedAnimation");

  lockedAnimationAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, true));
  lockedAnimationAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  planner.add_action(EStateActionId.LOCKED_ANIMATION, lockedAnimationAction);
}
