import { alife } from "xray16";

import { registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects";
import { hasAlifeInfo } from "@/engine/core/utils/object/object_info_portion";
import { areObjectsOnSameLevel } from "@/engine/core/utils/object/object_location";
import { isEmpty } from "@/engine/core/utils/table";
import { communities } from "@/engine/lib/constants/communities";
import { infoPortions } from "@/engine/lib/constants/info_portions";

/**
 * todo;
 */
export function canSquadHelpActor(squad: Squad): boolean {
  if (isEmpty(registry.actorCombat) || !areObjectsOnSameLevel(squad, alife().actor())) {
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