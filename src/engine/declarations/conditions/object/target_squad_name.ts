import { GameObject, ServerCreatureObject } from "xray16/alias";
import { extern, MAX_ALIFE_ID, Nillable, TName, TNumberId } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";
import { isCreature } from "@/engine/core/utils/class_ids";

/**
 * Check whether the squad of the object (or the object itself) matches the provided section name.
 *
 * @param _ - Actor game object, not used.
 * @param object - Server creature object whose squad section or own section is checked.
 * @param name - Section name to match against the squad section or the object section.
 * @returns Whether the squad section contains the name or the object section equals the name.
 */
extern("xr_conditions.target_squad_name", (_: GameObject, object: ServerCreatureObject, [name]: [TName]): boolean => {
  if ($isNil(object) || $isNil(name)) {
    return false;
  }

  if (isCreature(object)) {
    const groupId: TNumberId = object.group_id;

    if (groupId === MAX_ALIFE_ID) {
      return false;
    }

    const squad: Nillable<Squad> = registry.simulator.object(groupId);

    if (!squad) {
      return false;
    }

    if ($isNotNil(string.find(squad.section_name(), name, 1, true)[0])) {
      return true;
    }
  }

  return object.section_name() === name;
});
