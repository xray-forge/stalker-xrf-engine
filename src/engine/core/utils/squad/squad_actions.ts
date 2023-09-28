import { registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/server/squad";
import { hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { areObjectsOnSameLevel } from "@/engine/core/utils/position";
import { getObjectSquad } from "@/engine/core/utils/squad/squad_get";
import { isEmpty } from "@/engine/core/utils/table";
import { communities } from "@/engine/lib/constants/communities";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { AnyGameObject, ClientObject, Optional, ServerObject, TNumberId } from "@/engine/lib/types";

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

  switch (squad.getCommunity()) {
    case communities.stalker:
      return hasAlifeInfo(infoPortions.sim_stalker_help_harder);

    case communities.dolg:
      return hasAlifeInfo(infoPortions.sim_duty_help_harder);

    case communities.freedom:
      return hasAlifeInfo(infoPortions.sim_freedom_help_harder);

    default:
      return false;
  }
}

/**
 * Check whether provided object is commander of squad.
 *
 * @param object - target game object to check
 * @returns whether object is commanding squad
 */
export function isObjectSquadCommander(object: AnyGameObject): boolean {
  const squad: Optional<Squad> = getObjectSquad(object);

  if (squad) {
    const id: TNumberId = type(object.id) === "function" ? (object as ClientObject).id() : (object as ServerObject).id;

    return squad.commander_id() === id;
  } else {
    return false;
  }
}
