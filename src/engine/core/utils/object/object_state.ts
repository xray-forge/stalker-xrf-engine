import { IRegistryObjectState, registry } from "@/engine/core/database";
import { EActionId } from "@/engine/core/objects/ai/types";
import { EStalkerState } from "@/engine/core/objects/animation/types/state_types";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, ClientObject, EScheme, Optional, TNumberId } from "@/engine/lib/types";

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
 * @param object - target game object to check
 * @returns whether object is meeting with someone.
 */
export function isObjectMeeting(object: ClientObject): boolean {
  const actionPlanner: ActionPlanner = object.motivation_action_manager();

  return (
    actionPlanner !== null &&
    actionPlanner.initialized() &&
    actionPlanner.current_action_id() === EActionId.MEET_WAITING_ACTIVITY
  );
}
