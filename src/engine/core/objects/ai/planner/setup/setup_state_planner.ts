import { world_property, world_state } from "xray16";

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
} from "@/engine/core/objects/ai/planner/setup/state_planner";
import { StalkerStateManager } from "@/engine/core/objects/ai/state";
import { ActionStateEnd } from "@/engine/core/objects/ai/state/state";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, WorldState } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Add basic GOAP graphs to state manager planner evaluators / actions.
 * Defines how action states should behave for stalker state management / animation.
 * Works in parallel with C++ engine planner and switches control of actions from time to time or works in parallel.
 *
 * End goal is ended state of all animations and body states.
 *
 * @param planner - target state planner to initialize
 * @param stateManager - target state manager to initialize
 */
export function setupStalkerStatePlanner(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  setupStalkerStateEvaluators(planner, stateManager);

  setupStalkerWeaponStatePlanner(planner, stateManager);
  setupStalkerMovementStatePlanner(planner, stateManager);
  setupStalkerDirectionStatePlanner(planner, stateManager);
  setupStalkerMentalStatePlanner(planner, stateManager);
  setupStalkerBodyStatePlanner(planner, stateManager);
  setupStalkerAnimstateStatePlanner(planner, stateManager);
  setupStalkerAnimationStatePlanner(planner, stateManager);
  setupStalkerSmartCoverStatePlanner(planner, stateManager);
  setupStalkerLockedStatePlanner(planner, stateManager);

  // Final action to execute over time when all state actions are finished.
  const endStateAction: ActionStateEnd = new ActionStateEnd(stateManager);

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
