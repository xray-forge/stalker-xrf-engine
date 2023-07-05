import { CSightParams } from "xray16";

import { registry } from "@/engine/core/database";
import { copyVector } from "@/engine/core/utils/vector";
import { ClientObject, Optional, ServerCreatureObject, TNumberId, TRate, Vector } from "@/engine/lib/types";

/**
 * Set item condition.
 *
 * @param object - client object to change condition
 * @param condition - value from 0 to 100, percents
 */
export function setItemCondition(object: ClientObject, condition: TRate): void {
  object.set_condition(condition / 100);
}

/**
 * Change object team/squad/group.
 *
 * @param serverObject - alife server object to change team parameters
 * @param teamId - ?
 * @param squadId - id of the parent squad, bound to spawning smart
 * @param groupId - id of the level group
 */
export function setObjectTeamSquadGroup(
  serverObject: ServerCreatureObject,
  teamId: TNumberId,
  squadId: TNumberId,
  groupId: TNumberId
): void {
  const clientObject: Optional<ClientObject> = registry.objects.get(serverObject.id)?.object as Optional<ClientObject>;

  if (clientObject) {
    clientObject.change_team(teamId, squadId, groupId);
  } else {
    serverObject.team = teamId;
    serverObject.squad = squadId;
    serverObject.group = groupId;
  }
}

/**
 * Force object to look at another object.
 *
 * @param object - object to execute look command
 * @param objectToLook - target object to look at
 */
export function objectLookAtAnotherObject(object: ClientObject, objectToLook: ClientObject): void {
  const lookPoint: Vector = copyVector(objectToLook.position().sub(object.position()));

  object.set_sight(CSightParams.eSightTypeDirection, lookPoint, 0);
}
