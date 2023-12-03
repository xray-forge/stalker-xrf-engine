import { registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { isStalker } from "@/engine/core/utils/class_ids";
import { squadCommunityByBehaviour } from "@/engine/lib/constants/behaviours";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import {
  GameObject,
  Optional,
  ServerCreatureObject,
  ServerGroupObject,
  ServerHumanObject,
  TNumberId,
} from "@/engine/lib/types";

/**
 * @param squad - target squad to get community for
 * @returns squad community section
 */
export function getSquadCommunity(squad: Squad): TCommunity {
  return squadCommunityByBehaviour.get(squad.faction);
}

/**
 * Returns community of provided object.
 *
 * @param object - game object or server stalker/group
 * @returns object community
 */
export function getObjectCommunity(object: GameObject | ServerHumanObject | ServerGroupObject): TCommunity {
  if (isStalker(object)) {
    return type(object.id) === "function"
      ? (object as unknown as GameObject).character_community()
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
  const gameObject: Optional<GameObject> = registry.objects.get(object.id)?.object as Optional<GameObject>;

  if (gameObject) {
    gameObject.change_team(teamId, squadId, groupId);
  } else {
    object.team = teamId;
    object.squad = squadId;
    object.group = groupId;
  }
}
