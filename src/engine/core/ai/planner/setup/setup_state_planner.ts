import { world_property, world_state } from "xray16";
import { ActionPlanner, WorldState } from "xray16/alias";

import {
  setupStalkerAnimationStatePlanner,
  setupStalkerAnimstateStatePlanner,
  setupStalkerBodyStatePlanner,
  setupStalkerDirectionStatePlanner,
  setupStalkerLockedStatePlanner,
  setupStalkerMentalStatePlanner,
  setupStalkerMovementStatePlanner,
  setupStalkerSmartCoverStatePlanner,
  setupStalkerStateEvaluators,
  setupStalkerWeaponStatePlanner,
} from "@/engine/core/ai/planner/setup/state_planner";
import { StalkerStateController } from "@/engine/core/ai/state";
import { ActionStateEnd } from "@/engine/core/ai/state/state";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";

/**
 * Add basic GOAP graphs to state controller planner evaluators / actions.
 * Defines how action states should behave for stalker state management / animation.
 * Works in parallel with C++ engine planner and switches control of actions from time to time or works in parallel.
 *
 * End goal is ended state of all animations and body states.
 *
 * @param planner - Target state planner to initialize.
 * @param controller - Target state controller to initialize.
 */
export function setupStalkerStatePlanner(planner: ActionPlanner, controller: StalkerStateController): void {
  setupStalkerStateEvaluators(planner, controller);

  setupStalkerWeaponStatePlanner(planner, controller);
  setupStalkerMovementStatePlanner(planner, controller);
  setupStalkerDirectionStatePlanner(planner, controller);
  setupStalkerMentalStatePlanner(planner, controller);
  setupStalkerBodyStatePlanner(planner, controller);
  setupStalkerAnimstateStatePlanner(planner, controller);
  setupStalkerAnimationStatePlanner(planner, controller);
  setupStalkerSmartCoverStatePlanner(planner, controller);
  setupStalkerLockedStatePlanner(planner, controller);

  // Final action to execute over time when all state actions are finished.
  const endStateAction: ActionStateEnd = new ActionStateEnd(controller);

  endStateAction.add_precondition(new world_property(EStateEvaluatorId.END, false));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_SET, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_SET, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SET, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  endStateAction.add_effect(new world_property(EStateEvaluatorId.END, true));
  planner.add_action(EStateActionId.END, endStateAction);

  // End goal for action graph.
  const goal: WorldState = new world_state();

  goal.add_property(new world_property(EStateEvaluatorId.END, true));

  planner.set_goal_world_state(goal);
}
