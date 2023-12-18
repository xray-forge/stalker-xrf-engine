import { world_property } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state";
import { ActionAnimstateStart, ActionAnimstateStop } from "@/engine/core/ai/state/animstate";
import { ActionStateLocked } from "@/engine/core/ai/state/state";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { ActionPlanner } from "@/engine/lib/types";

/**
 * Setup GOAP logics related to animstate execution of stalkers.
 *
 * @param planner - action planner to configure
 * @param stateManager - target object state manager
 */
export function setupStalkerAnimstateStatePlanner(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  const animstateStartAction: ActionAnimstateStart = new ActionAnimstateStart(stateManager);

  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE, false));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SET, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_SET, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_PLAY_NOW, false));
  animstateStartAction.add_effect(new world_property(EStateEvaluatorId.ANIMSTATE, true));
  planner.add_action(EStateActionId.ANIMSTATE_START, animstateStartAction);

  const animstateStopAction: ActionAnimstateStop = new ActionAnimstateStop(stateManager);

  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  // --action.add_precondition    (new world_property(EStateManagerProperty.animstate,              false))
  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, false));
  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, false));
  animstateStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMSTATE, true));
  animstateStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMSTATE_PLAY_NOW, false));
  animstateStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  planner.add_action(EStateActionId.ANIMSTATE_STOP, animstateStopAction);

  const lockedAnimstateAction: ActionStateLocked = new ActionStateLocked(stateManager, "ActionStateLockedAnimstate");

  lockedAnimstateAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, true));
  lockedAnimstateAction.add_effect(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  planner.add_action(EStateActionId.LOCKED_ANIMSTATE, lockedAnimstateAction);
}
