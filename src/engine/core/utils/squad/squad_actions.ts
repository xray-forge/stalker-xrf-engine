import { registry } from "@/engine/core/database";
import type { ESquadActionType, Squad } from "@/engine/core/objects/squad";
import { getSquadCommunity } from "@/engine/core/utils/community";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { areObjectsOnSameLevel } from "@/engine/core/utils/position";
import { areCommunitiesEnemies } from "@/engine/core/utils/relation";
import { getObjectSquad, getObjectSquadByObjectId } from "@/engine/core/utils/squad/squad_get";
import { isEmpty } from "@/engine/core/utils/table";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import {
  AlifeSimulator,
  AnyGameObject,
  GameObject,
  Optional,
  ServerCreatureObject,
  ServerObject,
  TNumberId,
} from "@/engine/lib/types";

/**
 * Precondition checker to verify if squad can help actor in case of attack by another squad / monsters etc.
 *
 * @param squad - target squad to check help state
 * @returns whether squad can assist actor in fighting
 */
export function canSquadHelpActor(squad: Squad): boolean {
  if (isEmpty(registry.actorCombat) || !areObjectsOnSameLevel(squad, registry.actorServer)) {
    return false;
  }

  switch (getSquadCommunity(squad)) {
    case communities.stalker:
      return hasInfoPortion(infoPortions.sim_stalker_help_harder);

    case communities.dolg:
      return hasInfoPortion(infoPortions.sim_duty_help_harder);

    case communities.freedom:
      return hasInfoPortion(infoPortions.sim_freedom_help_harder);

    default:
      return false;
  }
}

/**
 * Check if squad can help actor.
 * If any valid target in combat can be targeted, try to help actor.
 *
 * @returns optional help target id to start combat with
 */
export function getSquadHelpActorTargetId(squad: Squad): Optional<TNumberId> {
  if (!canSquadHelpActor(squad)) {
    return null;
  }

  const squadCommunity: TCommunity = getSquadCommunity(squad);
  const simulator: AlifeSimulator = registry.simulator;

  for (const [id] of registry.actorCombat) {
    const enemySquadId: Optional<TNumberId> = simulator.object<ServerCreatureObject>(id)
      ?.group_id as Optional<TNumberId>;

    if (enemySquadId) {
      const targetSquad: Optional<Squad> = simulator.object<Squad>(enemySquadId);

      if (
        targetSquad &&
        areCommunitiesEnemies(squadCommunity, getSquadCommunity(targetSquad)) &&
        squad.position.distance_to_sqr(targetSquad.position) < 150 * 150
      ) {
        return enemySquadId;
      }
    }
  }

  return null;
}

/**
 * Check whether provided object is commander of squad.
 *
 * @param object - game object to check
 * @returns whether object is commanding squad
 */
export function isObjectSquadCommander(object: AnyGameObject): boolean {
  const squad: Optional<Squad> = getObjectSquad(object);

  return squad
    ? squad.commander_id() ===
        (type(object.id) === "function" ? (object as GameObject).id() : (object as ServerObject).id)
    : false;
}

/**
 * Check whether provided object id is commander of squad.
 *
 * @param objectId - game object ID to check
 * @returns whether object is commanding squad
 */
export function isObjectSquadCommanderById(objectId: TNumberId): boolean {
  const squad: Optional<Squad> = getObjectSquadByObjectId(objectId);

  return squad ? squad.commander_id() === objectId : false;
}

/**
 * @param squad - target squad to check
 * @param action - action type to expect
 * @returns whether current squad action matches provided type
 */
export function isSquadAction(squad: Squad, action: ESquadActionType): boolean {
  return squad.currentAction?.type === action;
}
