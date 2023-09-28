import { registry } from "@/engine/core/database";
import { isStalker } from "@/engine/core/utils/class_ids";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import {
  ClientObject,
  Optional,
  ServerCreatureObject,
  ServerGroupObject,
  ServerHumanObject,
  TNumberId,
} from "@/engine/lib/types";

/**
 * Returns community of provided object.
 *
 * @param object - client object or server stalker/group
 * @returns object community
 */
export function getObjectCommunity(object: ClientObject | ServerHumanObject | ServerGroupObject): TCommunity {
  if (isStalker(object)) {
    return type(object.id) === "function"
      ? (object as unknown as ClientObject).character_community()
      : (object as ServerHumanObject).community();
  }

  return communities.monster;
}

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
