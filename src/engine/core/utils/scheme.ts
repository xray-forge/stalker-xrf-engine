import { stalker_ids, world_property } from "xray16";

import { registry } from "@/engine/core/database";
import { EEvaluatorId, IBaseSchemeState } from "@/engine/core/schemes";
import { abort } from "@/engine/core/utils/assertion";
import { ActionBase, ClientObject } from "@/engine/lib/types";

/**
 * Check if provided scheme state is active.
 */
export function isSchemeActive(object: ClientObject, state: IBaseSchemeState): boolean {
  if (state.section === null) {
    abort("Object %s '%s': state.section is null.", object.name(), state.section);
  }

  return state.section === registry.objects.get(object.id()).active_section;
}

/**
 * Add common preconditions for base action to give priority for other default actions.
 */
export function addCommonPrecondition(action: ActionBase): void {
  action.add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));
  action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
  action.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));
  action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));
  action.add_precondition(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, false));
  action.add_precondition(new world_property(stalker_ids.property_items, false));
}
