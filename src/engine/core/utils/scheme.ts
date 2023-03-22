import { stalker_ids, world_property, XR_action_base, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { EEvaluatorId, IBaseSchemeState } from "@/engine/core/schemes";
import { abort } from "@/engine/core/utils/assertion";

/**
 * Check if provided scheme state is active.
 */
export function isSchemeActive(object: XR_game_object, state: IBaseSchemeState): boolean {
  if (state.section === null) {
    abort("Object %s '%s': state.section is null.", object.name(), state.section);
  }

  return state.section === registry.objects.get(object.id()).active_section;
}

/**
 * Add common preconditions for base action to give priority for other default actions.
 */
export function addCommonPrecondition(action: XR_action_base): void {
  action.add_precondition(new world_property(EEvaluatorId.stohe_meet_base + 1, false));
  action.add_precondition(new world_property(EEvaluatorId.sidor_wounded_base + 0, false));
  action.add_precondition(new world_property(EEvaluatorId.abuse_base, false));
  action.add_precondition(new world_property(EEvaluatorId.wounded_exist, false));
  action.add_precondition(new world_property(EEvaluatorId.corpse_exist, false));
  action.add_precondition(new world_property(stalker_ids.property_items, false));
}
