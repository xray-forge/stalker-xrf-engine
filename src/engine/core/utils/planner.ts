import { EActionId } from "@/engine/core/ai/planner/types";
import { EStalkerState } from "@/engine/core/animation/types/state_types";
import { IRegistryObjectState, registry } from "@/engine/core/database";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, EScheme, GameObject, Optional, TNumberId } from "@/engine/lib/types";

/**
 * @param objectId - target object id to check state
 * @returns whether object is currently asleep
 */
export function isObjectAsleep(objectId: TNumberId): boolean {
  return registry.objects.get(objectId)?.stateManager?.animstate.state.currentState === EStalkerState.SLEEP;
}

/**
 * @param objectId - target object id to check
 * @returns whether object is wounded.
 */
export function isObjectWounded(objectId: TNumberId): boolean {
  const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);

  // Not registered / not correct game object provided.
  if (!state || !state[EScheme.WOUNDED]) {
    return false;
  }

  return tostring((state[EScheme.WOUNDED] as ISchemeWoundedState).woundManager.woundState) !== NIL;
}

/**
 * @param object - game object to check
 * @returns whether object is meeting with someone.
 */
export function isObjectMeeting(object: GameObject): boolean {
  const planner: ActionPlanner = object.motivation_action_manager();

  return planner !== null && planner.initialized() && planner.current_action_id() === EActionId.MEET_WAITING_ACTIVITY;
}

/**
 * Check whether provided object is in combat.
 *
 * @param object - game object to check
 * @returns whether object is in combat
 */
export function isObjectInCombat(object: GameObject): boolean {
  const planner: ActionPlanner = object.motivation_action_manager();

  if (!planner.initialized()) {
    return false;
  }

  const currentActionId: Optional<TNumberId> = planner.current_action_id();

  return currentActionId === EActionId.COMBAT || currentActionId === EActionId.POST_COMBAT_WAIT;
}

/**
 * Check whether provided object is searching corpse.
 *
 * @param object - game object to check
 * @returns whether object is searching corpse
 */
export function isObjectSearchingCorpse(object: GameObject): boolean {
  const planner: ActionPlanner = object.motivation_action_manager();

  return planner.initialized() && planner.current_action_id() === EActionId.SEARCH_CORPSE;
}

/**
 * Check whether provided object is helping wounded.
 *
 * @param object - game object to check
 * @returns whether object is helping wounded
 */
export function isObjectHelpingWounded(object: GameObject): boolean {
  const planner: ActionPlanner = object.motivation_action_manager();

  return planner.initialized() && planner.current_action_id() === EActionId.HELP_WOUNDED;
}
