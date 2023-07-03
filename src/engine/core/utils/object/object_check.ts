import { level, stalker_ids } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { parseConditionsList, pickSectionFromCondList, readIniString } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import { ActionPlanner, ClientObject, Optional, TNumberId } from "@/engine/lib/types";

/**
 * Check whether provided object ID is online.
 *
 * @param objectId - object identifier
 */
export function isObjectOnline(objectId: TNumberId): boolean {
  return level.object_by_id(objectId) !== null;
}

/**
 * todo: description
 */
export function isActorSeenByObject(object: ClientObject): boolean {
  return object.alive() && object.see(registry.actor);
}

/**
 * todo;
 */
export function isObjectInvulnerabilityNeeded(object: ClientObject): boolean {
  const state: IRegistryObjectState = registry.objects.get(object.id());
  const invulnerability: Optional<string> = readIniString(
    state.ini,
    state.activeSection,
    "invulnerable",
    false,
    "",
    null
  );

  if (invulnerability === null) {
    return false;
  }

  return pickSectionFromCondList(registry.actor, object, parseConditionsList(invulnerability)) === TRUE;
}

/**
 * todo;
 */
export function isObjectInCombat(object: ClientObject): boolean {
  const actionPlanner: ActionPlanner = object.motivation_action_manager();

  if (!actionPlanner.initialized()) {
    return false;
  }

  const currentActionId: Optional<TNumberId> = actionPlanner.current_action_id();

  return (
    currentActionId === stalker_ids.action_combat_planner || currentActionId === stalker_ids.action_post_combat_wait
  );
}
