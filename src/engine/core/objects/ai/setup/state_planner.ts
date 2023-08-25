import { world_property, world_state } from "xray16";

import { setupStalkerAnimationStatePlanner } from "@/engine/core/objects/ai/setup/state/animation_planner";
import { setupStalkerAnimstateStatePlanner } from "@/engine/core/objects/ai/setup/state/animstate_planner";
import { setupStalkerBodyStatePlanner } from "@/engine/core/objects/ai/setup/state/body_state_planner";
import { setupStalkerDirectionStatePlanner } from "@/engine/core/objects/ai/setup/state/direction_planner";
import { setupStalkerLockedStatePlanner } from "@/engine/core/objects/ai/setup/state/locked_planner";
import { setupStalkerMentalStatePlanner } from "@/engine/core/objects/ai/setup/state/mental_planner";
import { setupStalkerMovementStatePlanner } from "@/engine/core/objects/ai/setup/state/movement_planner";
import { setupStalkerSmartCoverStatePlanner } from "@/engine/core/objects/ai/setup/state/smart_cover_planner";
import { setupStalkerStateEvaluators } from "@/engine/core/objects/ai/setup/state/state_evaluators";
import { setupStalkerWeaponStatePlanner } from "@/engine/core/objects/ai/setup/state/weapon_planner";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/animation";
import { StalkerStateManager } from "@/engine/core/objects/state";
import { ActionStateEnd } from "@/engine/core/objects/state/state";
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

  const endStateAction: ActionStateEnd = new ActionStateEnd(stateManager);

  endStateAction.add_precondition(new world_property(EStateEvaluatorId.END, false));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  endStateAction.add_effect(new world_property(EStateEvaluatorId.END, true));
  planner.add_action(EStateActionId.END, endStateAction);

  const goal: WorldState = new world_state();

  goal.add_property(new world_property(EStateEvaluatorId.END, true));
  planner.set_goal_world_state(goal);
}
