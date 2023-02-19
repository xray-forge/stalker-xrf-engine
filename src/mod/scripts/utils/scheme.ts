import { stalker_ids, world_property, XR_action_base, XR_game_object } from "xray16";

import { IStoredObject, registry } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/schemes/base/evaluators_id";
import { abort } from "@/mod/scripts/utils/debug";

/**
 * Check if provided scheme state is active.
 */
export function isSchemeActive(object: XR_game_object, state: IStoredObject): boolean {
  if (state.section === null) {
    abort("Object %s '%s': state.section is null.", object.name(), state.section);
  }

  return state.section === registry.objects.get(object.id()).active_section;
}

/**
 * Add common preconditions for base action to give priority for other default actions.
 */
export function addCommonPrecondition(action: XR_action_base): void {
  action.add_precondition(new world_property(evaluators_id.stohe_meet_base + 1, false));
  action.add_precondition(new world_property(evaluators_id.sidor_wounded_base + 0, false));
  action.add_precondition(new world_property(evaluators_id.abuse_base, false));
  action.add_precondition(new world_property(evaluators_id.wounded_exist, false));
  action.add_precondition(new world_property(evaluators_id.corpse_exist, false));
  action.add_precondition(new world_property(stalker_ids.property_items, false));
}
