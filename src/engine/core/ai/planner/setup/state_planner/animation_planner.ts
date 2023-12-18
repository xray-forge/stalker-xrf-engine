import { world_property } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state";
import { ActionAnimationStart, ActionAnimationStop } from "@/engine/core/ai/state/animation";
import { ActionStateLocked } from "@/engine/core/ai/state/state";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { ActionPlanner } from "@/engine/lib/types";

/**
 * Setup GOAP logics related to animation execution of stalkers.
 *
 * @param planner - action planner to configure
 * @param stateManager - target object state manager
 */
export function setupStalkerAnimationStatePlanner(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  // -- START
  const animationStartAction: ActionAnimationStart = new ActionAnimationStart(stateManager);

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
  const animationStopAction: ActionAnimationStop = new ActionAnimationStop(stateManager);

  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  // --action.add_precondition    (new world_property(EStateManagerProperty.animstate,              true))
  // --action.add_precondition    (new world_property(EStateManagerProperty.animation,              false))
  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, true));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION, true));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, false));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  planner.add_action(EStateActionId.ANIMATION_STOP, animationStopAction);

  const lockedAnimationAction: ActionStateLocked = new ActionStateLocked(stateManager, "ActionStateLockedAnimation");

  lockedAnimationAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, true));
  lockedAnimationAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  planner.add_action(EStateActionId.LOCKED_ANIMATION, lockedAnimationAction);
}
