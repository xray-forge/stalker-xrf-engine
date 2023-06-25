import { IRegistryObjectState, registry } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { EActionId } from "@/engine/core/schemes";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, ClientObject, EScheme, Optional, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export function isObjectAsleep(object: ClientObject): boolean {
  return registry.objects.get(object.id()).stateManager!.animstate.states.currentState === EStalkerState.SLEEP;
}

/**
 * @returns whether object is wounded.
 */
export function isObjectWounded(object: ClientObject): boolean {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (state === null) {
    return false;
  } else if (state[EScheme.WOUNDED] !== null) {
    return tostring((state[EScheme.WOUNDED] as ISchemeWoundedState).woundManager.woundState) !== NIL;
  } else {
    return false;
  }
}

/**
 * @returns whether object is heavily wounded.
 */
export function isHeavilyWounded(objectId: TNumberId): boolean {
  const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);

  return (
    (state &&
      state[EScheme.WOUNDED] &&
      tostring((state[EScheme.WOUNDED] as ISchemeWoundedState).woundManager.woundState) !== NIL) === true
  );
}

/**
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
