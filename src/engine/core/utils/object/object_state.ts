import { IRegistryObjectState, registry } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/animation/state_types";
import { EActionId } from "@/engine/core/schemes/base";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
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

  if (!state || !state[EScheme.WOUNDED]) {
    return false;
  } else {
    return tostring((state[EScheme.WOUNDED] as ISchemeWoundedState).woundManager.woundState) !== NIL;
  }
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
