import { registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/server/squad";
import { hasAlifeInfo } from "@/engine/core/utils/object/object_info_portion";
import { areObjectsOnSameLevel } from "@/engine/core/utils/object/object_location";
import { isEmpty } from "@/engine/core/utils/table";
import { communities } from "@/engine/lib/constants/communities";
import { infoPortions } from "@/engine/lib/constants/info_portions";

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
