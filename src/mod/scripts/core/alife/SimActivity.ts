import { XR_cse_alife_object } from "xray16";

import { communities, TCommunity } from "@/mod/globals/communities";
import { Optional, PartialRecord } from "@/mod/lib/types";
import { SimSquad } from "@/mod/scripts/core/alife/SimSquad";
import { SurgeManager } from "@/mod/scripts/core/managers/SurgeManager";
import { TravelManager } from "@/mod/scripts/core/managers/TravelManager";
import { getAlifeDistanceBetween } from "@/mod/scripts/utils/alife";
import { hasAlifeInfo } from "@/mod/scripts/utils/info_portions";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isInTimeInterval } from "@/mod/scripts/utils/time";

const logger: LuaLogger = new LuaLogger("SimActivity");

export type TSimActivityPreconditionChecker = (squad: SimSquad, target: XR_cse_alife_object) => boolean;

export interface ISimActivityPrecondition {
  prec: TSimActivityPreconditionChecker;
}

export type TSimActivitySmartType = "surge" | "base" | "resource" | "territory" | "lair";

export interface ISimActivityDescriptor {
  squad: Optional<PartialRecord<TCommunity, Optional<ISimActivityPrecondition>>>;
  smart: Optional<PartialRecord<TSimActivitySmartType, Optional<ISimActivityPrecondition>>>;
  actor: Optional<ISimActivityPrecondition>;
}

export const simulation_activities: Record<TCommunity, ISimActivityDescriptor> = {
  [communities.none]: {
    squad: null,
    smart: null,
    actor: null,
  },
  [communities.stalker]: {
    squad: null,
    smart: {
      base: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(18, 8) &&
          !SurgeManager.getInstance().isStarted &&
          !TravelManager.getInstance().isEnemyWithSquadMember(squad) &&
          (target.name() === "zat_stalker_base_smart" || target.name() === "jup_a6" || target.name() === "pri_a16"),
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      territory: {
        prec: () => isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
      resource: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
    },
    actor: null,
  },
  [communities.bandit]: {
    squad: {
      stalker: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 21) &&
          !SurgeManager.getInstance().isStarted &&
          getAlifeDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      base: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(21, 8) &&
          !SurgeManager.getInstance().isStarted &&
          !TravelManager.getInstance().isEnemyWithSquadMember(squad) &&
          (target.name() === "zat_stalker_base_smart" || target.name() === "jup_a10_smart_terrain"),
      },
      territory: {
        prec: () => isInTimeInterval(8, 21) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      resource: null,
    },
    actor: {
      prec: (squad: SimSquad, target: XR_cse_alife_object) =>
        hasAlifeInfo("sim_bandit_attack_harder") && getAlifeDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.dolg]: {
    squad: {
      freedom: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getAlifeDistanceBetween(squad, target) <= 150,
      },
      monster_predatory_day: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getAlifeDistanceBetween(squad, target) <= 150,
      },
      monster_predatory_night: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getAlifeDistanceBetween(squad, target) <= 150,
      },
      monster_vegetarian: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getAlifeDistanceBetween(squad, target) <= 150,
      },
      monster_zombied_day: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getAlifeDistanceBetween(squad, target) <= 150,
      },
      monster_special: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getAlifeDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      base: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 8) &&
          !SurgeManager.getInstance().isStarted &&
          !TravelManager.getInstance().isEnemyWithSquadMember(squad) &&
          (target.name() === "zat_stalker_base_smart" || target.name() === "jup_a6" || target.name() === "pri_a16"),
      },
      territory: {
        prec: () => isInTimeInterval(8, 19) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      resource: null,
    },
    actor: null,
  },
  [communities.freedom]: {
    squad: {
      dolg: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 19) &&
          !SurgeManager.getInstance().isStarted &&
          getAlifeDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      base: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 8) &&
          !SurgeManager.getInstance().isStarted &&
          !TravelManager.getInstance().isEnemyWithSquadMember(squad) &&
          (target.name() === "zat_stalker_base_smart" || target.name() === "jup_a6" || target.name() === "pri_a16"),
      },
      territory: {
        prec: () => isInTimeInterval(8, 19) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      resource: null,
    },
    actor: null,
  },
  [communities.killer]: {
    squad: null,
    smart: {
      territory: { prec: () => !SurgeManager.getInstance().isStarted },
      base: null,
      resource: null,
      surge: { prec: () => SurgeManager.getInstance().isStarted },
    },
    actor: {
      prec: (squad: SimSquad, target: XR_cse_alife_object) => getAlifeDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.zombied]: {
    squad: null,
    smart: { territory: { prec: () => true }, lair: { prec: () => true }, resource: null, base: null },
    actor: null,
  },
  [communities.monster_predatory_day]: {
    squad: {
      monster_vegetarian: { prec: () => isInTimeInterval(6, 19) },
      stalker: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      bandit: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      dolg: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      freedom: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      killer: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      territory: { prec: () => isInTimeInterval(6, 19) },
      lair: { prec: () => isInTimeInterval(19, 6) },
      base: null,
      resource: null,
    },
    actor: {
      prec: (squad: SimSquad, target: XR_cse_alife_object) =>
        isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.monster_predatory_night]: {
    squad: {
      monster_vegetarian: { prec: () => isInTimeInterval(21, 6) },
      stalker: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      bandit: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      dolg: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      freedom: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      killer: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      territory: { prec: () => isInTimeInterval(19, 6) },
      lair: { prec: () => isInTimeInterval(6, 19) },
      base: null,
      resource: null,
    },
    actor: {
      prec: (squad: SimSquad, target: XR_cse_alife_object) =>
        isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.monster_vegetarian]: {
    squad: null,
    smart: {
      lair: { prec: () => true },
      base: null,
      resource: null,
    },
    actor: {
      prec: (squad: SimSquad, target: XR_cse_alife_object) =>
        isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.monster_zombied_day]: {
    squad: {
      stalker: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      bandit: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      dolg: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      freedom: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      killer: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      territory: { prec: () => !SurgeManager.getInstance().isStarted },
      lair: { prec: () => isInTimeInterval(19, 6) },
      base: null,
      resource: null,
    },
    actor: {
      prec: (squad: SimSquad, target: XR_cse_alife_object) =>
        isInTimeInterval(6, 19) && getAlifeDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.monster_zombied_night]: {
    squad: {
      stalker: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      bandit: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      dolg: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      freedom: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
      },
      killer: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
      },
    },
    smart: {
      territory: { prec: () => isInTimeInterval(19, 6) },
      lair: { prec: () => isInTimeInterval(6, 19) },
      base: null,
      resource: null,
    },
    actor: {
      prec: (squad: SimSquad, target: XR_cse_alife_object) =>
        isInTimeInterval(19, 6) && getAlifeDistanceBetween(squad, target) <= 150,
    },
  },
  [communities.monster_special]: {
    squad: null,
    smart: { lair: { prec: () => true }, base: null, resource: null },
    actor: null,
  },
  [communities.monster]: {
    squad: null,
    smart: { lair: { prec: () => true }, base: null, resource: null },
    actor: null,
  },
  [communities.army]: {
    squad: null,
    smart: {
      base: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(18, 8) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      territory: {
        prec: () => isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
      resource: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
    },
    actor: null,
  },
  [communities.ecolog]: {
    squad: null,
    smart: {
      base: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(18, 8) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      territory: {
        prec: () => isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
      resource: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
    },
    actor: null,
  },
  [communities.monolith]: {
    squad: null,
    smart: {
      base: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(18, 8) && !SurgeManager.getInstance().isStarted,
      },
      surge: { prec: () => SurgeManager.getInstance().isStarted },
      territory: {
        prec: () => isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
      resource: {
        prec: (squad: SimSquad, target: XR_cse_alife_object) =>
          isInTimeInterval(8, 18) && !SurgeManager.getInstance().isStarted,
      },
    },
    actor: null,
  },
};
