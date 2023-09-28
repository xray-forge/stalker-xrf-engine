import { CSightParams } from "xray16";

import { registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { copyVector } from "@/engine/core/utils/vector";
import { ClientObject, Optional, ServerCreatureObject, TNumberId, TRate, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Change object team/squad/group.
 *
 * @param object - alife server object to change team parameters
 * @param teamId - ?
 * @param squadId - id of the parent squad, bound to spawning smart
 * @param groupId - id of the level group
 */
export function setObjectTeamSquadGroup(
  object: ServerCreatureObject,
  teamId: TNumberId,
  squadId: TNumberId,
  groupId: TNumberId
): void {
  const clientObject: Optional<ClientObject> = registry.objects.get(object.id)?.object as Optional<ClientObject>;

  if (clientObject) {
    clientObject.change_team(teamId, squadId, groupId);
  } else {
    object.team = teamId;
    object.squad = squadId;
    object.group = groupId;
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
